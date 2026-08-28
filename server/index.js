import 'dotenv/config';
import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { db } from './db.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const sessionDays = Number(process.env.SESSION_DAYS || 14);
const cookieSecret = process.env.SESSION_SECRET || 'saarthi-development-secret-change-me';
const DEMO_OTP = '123456';
const clientDist = path.resolve('dist');
const now = () => new Date().toISOString();
const expiresAt = (minutes) => new Date(Date.now() + minutes * 60_000).toISOString();
const id = () => crypto.randomUUID();

app.use(express.json({ limit: '20kb' }));
app.use(cookieParser(cookieSecret));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'saarthi-api' }));

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizePhone(phone) {
  const value = String(phone || '').replace(/\D/g, '');
  if (value.length !== 10) throw httpError(400, 'Enter a valid 10-digit mobile number.');
  return value;
}

function getUser(userId) {
  return db.prepare('SELECT id, phone, name, email, created_at AS createdAt, updated_at AS updatedAt FROM users WHERE id = ?').get(userId);
}

function getCurrentApplication(userId) {
  return db.prepare(`SELECT id, user_id AS userId, intent, status, current_step AS currentStep, state, rto,
    created_at AS createdAt, updated_at AS updatedAt
    FROM applications WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1`).get(userId);
}

function getApplication(applicationId) {
  const application = db.prepare(`SELECT id, user_id AS userId, intent, status, current_step AS currentStep, state, rto,
    created_at AS createdAt, updated_at AS updatedAt FROM applications WHERE id = ?`).get(applicationId);
  if (!application) return null;
  const detail = db.prepare('SELECT data FROM application_details WHERE application_id = ?').get(applicationId);
  const documents = db.prepare('SELECT document_type AS type, status, updated_at AS updatedAt FROM documents WHERE application_id = ? ORDER BY document_type').all(applicationId);
  const payment = db.prepare("SELECT id, reference, method, amount, status, created_at AS createdAt, updated_at AS updatedAt FROM payments WHERE application_id = ? AND stage = 'll' ORDER BY created_at DESC LIMIT 1").get(applicationId) || null;
  const test = db.prepare('SELECT score, total, passed, created_at AS createdAt FROM learner_tests WHERE application_id = ? ORDER BY created_at DESC LIMIT 1').get(applicationId) || null;
  const licence = db.prepare('SELECT reference, issued_at AS issuedAt, valid_until AS validUntil, eligible_for_dl_at AS eligibleForDlAt FROM learner_licences WHERE application_id = ?').get(applicationId) || null;
  const dl = db.prepare('SELECT data, status, updated_at AS updatedAt FROM dl_applications WHERE application_id = ?').get(applicationId);
  const dlPayment = db.prepare("SELECT id, reference, method, amount, status, created_at AS createdAt, updated_at AS updatedAt FROM payments WHERE application_id = ? AND stage = 'dl' ORDER BY created_at DESC LIMIT 1").get(applicationId) || null;
  const appointment = db.prepare('SELECT id, slot, status, created_at AS createdAt, updated_at AS updatedAt FROM appointments WHERE application_id = ?').get(applicationId) || null;
  const drivingTest = db.prepare('SELECT score, total, passed, created_at AS createdAt FROM driving_tests WHERE application_id = ? ORDER BY created_at DESC LIMIT 1').get(applicationId) || null;
  const drivingLicence = db.prepare('SELECT reference, issued_at AS issuedAt, delivery_status AS deliveryStatus, updated_at AS updatedAt FROM driving_licences WHERE application_id = ?').get(applicationId) || null;
  return { ...application, details: detail ? JSON.parse(detail.data) : {}, documents, payment, test: test ? { ...test, passed: Boolean(test.passed) } : null, licence, dl: dl ? { ...dl, data: JSON.parse(dl.data), payment: dlPayment, appointment, drivingTest: drivingTest ? { ...drivingTest, passed: Boolean(drivingTest.passed) } : null, licence: drivingLicence } : null };
}

function assertOwner(applicationId, userId) {
  const application = db.prepare('SELECT id FROM applications WHERE id = ? AND user_id = ?').get(applicationId, userId);
  if (!application) throw httpError(404, 'Application not found.');
  return application;
}

function addEvent(applicationId, eventType, label) {
  db.prepare('INSERT INTO journey_events (id, application_id, event_type, label, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(id(), applicationId, eventType, label, now());
}

function updateJourney(applicationId, currentStep, status = currentStep) {
  db.prepare('UPDATE applications SET current_step = ?, status = ?, updated_at = ? WHERE id = ?').run(currentStep, status, now(), applicationId);
}

function saveDetails(applicationId, incoming) {
  const old = db.prepare('SELECT data FROM application_details WHERE application_id = ?').get(applicationId);
  const data = { ...(old ? JSON.parse(old.data) : {}), ...incoming };
  db.prepare(`INSERT INTO application_details (application_id, data, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(application_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`).run(applicationId, JSON.stringify(data), now());
  return data;
}

function createOrGetApplication(userId, intent) {
  const existing = db.prepare(`SELECT id, user_id AS userId, intent, status, current_step AS currentStep, state, rto,
    created_at AS createdAt, updated_at AS updatedAt FROM applications WHERE user_id = ? AND intent = ?`).get(userId, intent);
  if (existing) return existing;

  const application = {
    id: `APP-${crypto.randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()}`,
    userId,
    intent,
    status: 'started',
    currentStep: intent === 'existing-ll' ? 'existing-ll-details' : 'application-entry',
    state: null,
    rto: null,
    createdAt: now(),
    updatedAt: now(),
  };
  try {
    db.prepare(`INSERT INTO applications (id, user_id, intent, status, current_step, state, rto, created_at, updated_at)
      VALUES (@id, @userId, @intent, @status, @currentStep, @state, @rto, @createdAt, @updatedAt)`).run(application);
    db.prepare('INSERT INTO journey_events (id, application_id, event_type, label, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(id(), application.id, 'application_started', 'Application started', application.createdAt);
    return application;
  } catch (error) {
    if (String(error.message).includes('UNIQUE constraint failed')) {
      return db.prepare(`SELECT id, user_id AS userId, intent, status, current_step AS currentStep, state, rto,
        created_at AS createdAt, updated_at AS updatedAt FROM applications WHERE user_id = ? AND intent = ?`).get(userId, intent);
    }
    throw error;
  }
}

function requireAuth(req, _res, next) {
  const sessionId = req.signedCookies.saarthi_session;
  if (!sessionId) return next(httpError(401, 'Your session has expired. Please sign in again.'));
  const session = db.prepare('SELECT id, user_id AS userId, expires_at AS expiresAt FROM sessions WHERE id = ?').get(sessionId);
  if (!session || new Date(session.expiresAt) <= new Date()) {
    if (session) db.prepare('DELETE FROM sessions WHERE id = ?').run(session.id);
    return next(httpError(401, 'Your session has expired. Please sign in again.'));
  }
  req.userId = session.userId;
  req.sessionId = session.id;
  next();
}

function setSessionCookie(res, sessionId) {
  res.cookie('saarthi_session', sessionId, {
    httpOnly: true, signed: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: sessionDays * 24 * 60 * 60 * 1000,
  });
}

app.post('/api/auth/start', (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const intent = req.body.intent;
    if (intent !== undefined && intent !== null && !['first-ll', 'existing-ll'].includes(intent)) throw httpError(400, 'Choose a valid application path.');
    const suppliedName = typeof req.body.name === 'string' ? req.body.name.trim().slice(0, 120) : null;
    const suppliedEmail = typeof req.body.email === 'string' ? req.body.email.trim().slice(0, 254) : null;
    const timestamp = now();
    let user = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (!user) {
      user = { id: id() };
      db.prepare('INSERT INTO users (id, phone, name, email, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(user.id, phone, suppliedName || null, suppliedEmail || null, timestamp, timestamp);
    } else if (suppliedName || suppliedEmail) {
      db.prepare('UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), updated_at = ? WHERE id = ?')
        .run(suppliedName || null, suppliedEmail || null, timestamp, user.id);
    }
    const challengeId = id();
    db.prepare('DELETE FROM auth_challenges WHERE user_id = ? OR expires_at <= ?').run(user.id, timestamp);
    db.prepare('INSERT INTO auth_challenges (id, user_id, intent, expires_at, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(challengeId, user.id, intent || null, expiresAt(10), timestamp);
    res.cookie('saarthi_otp_challenge', challengeId, { httpOnly: true, signed: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 10 * 60 * 1000 });
    res.status(200).json({ message: 'Demo OTP ready.', expiresInSeconds: 600 });
  } catch (error) { next(error); }
});

app.post('/api/auth/verify', (req, res, next) => {
  try {
    if (String(req.body.otp || '') !== DEMO_OTP) throw httpError(400, 'That OTP is not correct. Try 123456 for this demo.');
    const challengeId = req.signedCookies.saarthi_otp_challenge;
    if (!challengeId) throw httpError(400, 'Your OTP request has expired. Please request a new code.');
    const challenge = db.prepare('SELECT id, user_id AS userId, intent, expires_at AS expiresAt FROM auth_challenges WHERE id = ?').get(challengeId);
    if (!challenge || new Date(challenge.expiresAt) <= new Date()) throw httpError(400, 'Your OTP request has expired. Please request a new code.');
    const sessionId = id();
    const timestamp = now();
    db.prepare('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
      .run(sessionId, challenge.userId, expiresAt(sessionDays * 24 * 60), timestamp);
    db.prepare('DELETE FROM auth_challenges WHERE id = ?').run(challenge.id);
    res.clearCookie('saarthi_otp_challenge');
    setSessionCookie(res, sessionId);
    const applicationRow = challenge.intent ? createOrGetApplication(challenge.userId, challenge.intent) : getCurrentApplication(challenge.userId);
    const application = applicationRow ? getApplication(applicationRow.id) : null;
    res.status(200).json({ user: getUser(challenge.userId), application });
  } catch (error) { next(error); }
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(req.sessionId);
  res.clearCookie('saarthi_session');
  res.status(204).end();
});

app.get('/api/me', requireAuth, (req, res) => res.json({ user: getUser(req.userId) }));
app.get('/api/applications/current', requireAuth, (req, res) => {
  const application = getCurrentApplication(req.userId);
  if (!application) throw httpError(404, 'No application found yet.');
  res.json({ application: getApplication(application.id) });
});

app.post('/api/applications', requireAuth, (req, res, next) => {
  try {
    const intent = req.body.intent;
    if (!['first-ll', 'existing-ll'].includes(intent)) throw httpError(400, 'Choose a valid application path.');
    const application = createOrGetApplication(req.userId, intent);
    res.status(201).json({ application: getApplication(application.id) });
  } catch (error) { next(error); }
});

app.patch('/api/applications/:id', requireAuth, (req, res, next) => {
  try {
    const application = db.prepare('SELECT id FROM applications WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!application) throw httpError(404, 'Application not found.');
    const updates = {};
    for (const key of ['status', 'currentStep', 'state', 'rto']) {
      if (typeof req.body[key] === 'string' && req.body[key].trim()) updates[key] = req.body[key].trim().slice(0, 120);
    }
    if (!Object.keys(updates).length) throw httpError(400, 'Provide an application update.');
    db.prepare(`UPDATE applications SET status = COALESCE(@status, status), current_step = COALESCE(@currentStep, current_step),
      state = COALESCE(@state, state), rto = COALESCE(@rto, rto), updated_at = @updatedAt WHERE id = @id`)
      .run({ id: application.id, status: updates.status || null, currentStep: updates.currentStep || null, state: updates.state || null, rto: updates.rto || null, updatedAt: now() });
    res.json({ application: getApplication(application.id) });
  } catch (error) { next(error); }
});

app.get('/api/applications/:id/journey', requireAuth, (req, res, next) => {
  try {
    const application = db.prepare('SELECT id FROM applications WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!application) throw httpError(404, 'Application not found.');
    const events = db.prepare('SELECT id, event_type AS eventType, label, created_at AS createdAt FROM journey_events WHERE application_id = ? ORDER BY created_at ASC').all(application.id);
    res.json({ events });
  } catch (error) { next(error); }
});

app.get('/api/applications/:id/full', requireAuth, (req, res, next) => {
  try { assertOwner(req.params.id, req.userId); res.json({ application: getApplication(req.params.id) }); } catch (error) { next(error); }
});

app.patch('/api/applications/:id/details', requireAuth, (req, res, next) => {
  try {
    assertOwner(req.params.id, req.userId);
    const allowed = ['vehicle', 'dob', 'eligibility', 'name', 'phone', 'email', 'address', 'city', 'pin', 'fitnessConfirmed', 'reviewed', 'learnerReference', 'llIssueDate', 'documentsGuidance'];
    const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key, value]) => allowed.includes(key) && (typeof value === 'string' || typeof value === 'boolean')));
    const allowedSteps = ['application-entry', 'eligibility', 'personal-details', 'documents', 'fitness', 'review', 'payment', 'submitted', 'll-preparation', 'll-test', 'll-result', 'll-issued', 'waiting-period', 'dl-eligible', 'existing-ll-details'];
    const stage = req.body.nextStep;
    if (!Object.keys(updates).length && !(typeof stage === 'string' && allowedSteps.includes(stage)) && !(typeof req.body.state === 'string' && typeof req.body.rto === 'string')) throw httpError(400, 'Provide valid application details.');
    if (updates.phone && !/^\d{10}$/.test(String(updates.phone).replace(/\D/g, ''))) throw httpError(400, 'Enter a valid 10-digit mobile number.');
    if (updates.email && !/^\S+@\S+\.\S+$/.test(updates.email)) throw httpError(400, 'Enter a valid email address.');
    if (updates.dob && Number.isNaN(Date.parse(updates.dob))) throw httpError(400, 'Enter a valid date of birth.');
    if (updates.learnerReference) updates.learnerReference = String(updates.learnerReference).trim().slice(0, 40);
    saveDetails(req.params.id, updates);
    if (typeof req.body.state === 'string' && req.body.state.trim()) {
      const rto = typeof req.body.rto === 'string' ? req.body.rto.trim().slice(0, 120) : null;
      db.prepare('UPDATE applications SET state = ?, rto = COALESCE(?, rto), updated_at = ? WHERE id = ?').run(req.body.state.trim().slice(0, 80), rto || null, now(), req.params.id);
    } else if (typeof req.body.rto === 'string' && req.body.rto.trim()) {
      db.prepare('UPDATE applications SET rto = ?, updated_at = ? WHERE id = ?').run(req.body.rto.trim().slice(0, 120), now(), req.params.id);
    }
    if (typeof stage === 'string' && allowedSteps.includes(stage)) { updateJourney(req.params.id, stage); addEvent(req.params.id, stage, stage.replace(/-/g, ' ')); }
    res.json({ application: getApplication(req.params.id) });
  } catch (error) { next(error); }
});

app.put('/api/applications/:id/documents/:type', requireAuth, (req, res, next) => {
  try {
    assertOwner(req.params.id, req.userId);
    const type = req.params.type;
    const status = req.body.status;
    if (!['identity', 'address', 'photo-signature'].includes(type) || !['needed', 'ready', 'rejected', 'replaced'].includes(status)) throw httpError(400, 'Provide a valid demo document update.');
    db.prepare(`INSERT INTO documents (id, application_id, document_type, status, updated_at) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(application_id, document_type) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at`).run(id(), req.params.id, type, status, now());
    const allReady = db.prepare("SELECT COUNT(*) AS count FROM documents WHERE application_id = ? AND status IN ('ready', 'replaced')").get(req.params.id).count === 3;
    const current = db.prepare('SELECT current_step AS currentStep FROM applications WHERE id = ?').get(req.params.id);
    if (status === 'rejected') updateJourney(req.params.id, 'documents');
    else if (allReady && current?.currentStep === 'documents') updateJourney(req.params.id, 'fitness');
    addEvent(req.params.id, `document_${status}`, `${type.replace(/-/g, ' ')} ${status}`);
    res.json({ application: getApplication(req.params.id) });
  } catch (error) { next(error); }
});

app.post('/api/applications/:id/payment', requireAuth, (req, res, next) => {
  try {
    assertOwner(req.params.id, req.userId);
    const method = req.body.method;
    const outcome = req.body.outcome || 'successful';
    if (!['UPI', 'Card', 'Net banking'].includes(method) || !['successful', 'failed'].includes(outcome)) throw httpError(400, 'Choose a valid demo payment method.');
    const existing = db.prepare("SELECT id, reference, method, amount, status, created_at AS createdAt, updated_at AS updatedAt FROM payments WHERE application_id = ? AND stage = 'll' AND status = 'successful' ORDER BY created_at DESC LIMIT 1").get(req.params.id);
    if (existing) return res.json({ payment: existing, application: getApplication(req.params.id) });
    const payment = { id: id(), reference: `DEMO-PAY-${crypto.randomUUID().replace(/-/g, '').slice(0, 7).toUpperCase()}`, method, amount: 480, status: outcome, createdAt: now(), updatedAt: now() };
    db.prepare('INSERT INTO payments (id, application_id, reference, method, amount, status, created_at, updated_at, stage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(payment.id, req.params.id, payment.reference, payment.method, payment.amount, payment.status, payment.createdAt, payment.updatedAt, 'll');
    updateJourney(req.params.id, outcome === 'successful' ? 'submitted' : 'payment', outcome === 'successful' ? 'submitted' : 'payment-failed');
    addEvent(req.params.id, `payment_${outcome}`, `Demo payment ${outcome}`);
    res.status(201).json({ payment, application: getApplication(req.params.id) });
  } catch (error) { next(error); }
});

app.post('/api/applications/:id/submit', requireAuth, (req, res, next) => {
  try { assertOwner(req.params.id, req.userId); const application = getApplication(req.params.id); if (application.payment?.status !== 'successful') throw httpError(409, 'Complete the demo payment before submitting.'); updateJourney(req.params.id, 'll-preparation', 'submitted'); addEvent(req.params.id, 'submitted', 'Application submitted'); res.json({ application: getApplication(req.params.id) }); } catch (error) { next(error); }
});

app.post('/api/applications/:id/learner-test', requireAuth, (req, res, next) => {
  try {
    assertOwner(req.params.id, req.userId); const answers = req.body.answers;
    if (!Array.isArray(answers) || answers.length !== 5 || answers.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 3)) throw httpError(400, 'Answer every question before submitting.');
    const correct = [1, 0, 2, 2, 0]; const score = answers.reduce((total, answer, index) => total + (answer === correct[index] ? 1 : 0), 0); const passed = score >= 4;
    db.prepare('INSERT INTO learner_tests (id, application_id, score, total, passed, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(id(), req.params.id, score, correct.length, passed ? 1 : 0, now());
    updateJourney(req.params.id, 'll-result', passed ? 'll-test-passed' : 'll-test-failed'); addEvent(req.params.id, passed ? 'll_test_passed' : 'll_test_failed', passed ? 'Learner test passed' : 'Learner test needs another attempt');
    res.json({ application: getApplication(req.params.id) });
  } catch (error) { next(error); }
});

app.post('/api/applications/:id/issue-learner-licence', requireAuth, (req, res, next) => {
  try {
    assertOwner(req.params.id, req.userId); const application = getApplication(req.params.id); if (!application.test?.passed) throw httpError(409, 'Pass the learner test before issuing the demo licence.');
    let licence = application.licence;
    if (!licence) { const issuedAt = now(); const validUntil = new Date(Date.now() + 183 * 86400000).toISOString(); const eligible = new Date(Date.now() + 30 * 86400000).toISOString(); licence = { reference: `LL-DEMO-${crypto.randomUUID().replace(/-/g, '').slice(0, 7).toUpperCase()}`, issuedAt, validUntil, eligibleForDlAt: eligible }; db.prepare('INSERT INTO learner_licences (id, application_id, reference, issued_at, valid_until, eligible_for_dl_at) VALUES (?, ?, ?, ?, ?, ?)').run(id(), req.params.id, licence.reference, issuedAt, validUntil, eligible); }
    updateJourney(req.params.id, 'll-issued', 'll-issued'); addEvent(req.params.id, 'll_issued', 'Learner Licence issued — Demo'); res.json({ application: getApplication(req.params.id) });
  } catch (error) { next(error); }
});

app.post('/api/applications/:id/demo/fast-forward-wait', requireAuth, (req, res, next) => {
  try { assertOwner(req.params.id, req.userId); db.prepare('UPDATE learner_licences SET eligible_for_dl_at = ? WHERE application_id = ?').run(now(), req.params.id); updateJourney(req.params.id, 'dl-eligible', 'dl-eligible'); addEvent(req.params.id, 'waiting_period_demo_complete', 'Demo waiting period completed'); res.json({ application: getApplication(req.params.id) }); } catch (error) { next(error); }
});

function dlEligible(application) {
  return application.intent === 'existing-ll' || (application.licence && new Date(application.licence.eligibleForDlAt) <= new Date());
}

function createOrGetDl(applicationId) {
  const row = db.prepare('SELECT application_id AS applicationId, data, status FROM dl_applications WHERE application_id = ?').get(applicationId);
  if (row) return row;
  const application = getApplication(applicationId);
  if (!dlEligible(application)) throw httpError(409, 'Your simulated 30-day waiting period is not complete yet.');
  if (application.intent === 'existing-ll') {
    if (!application.details.learnerReference || !application.details.llIssueDate || !application.details.vehicle || !application.details.name) {
      throw httpError(409, 'Confirm your Learner\'s Licence number, issue date, vehicle class and name before starting the Driving Licence application.');
    }
  }
  const learnerReference = application.licence?.reference || application.details.learnerReference || '';
  const data = { name: application.details.name || '', dob: application.details.dob || '', phone: application.details.phone || '', email: application.details.email || '', address: application.details.address || '', city: application.details.city || '', pin: application.details.pin || '', vehicle: application.details.vehicle || '', state: application.state || '', rto: application.rto || '', learnerReference, llIssueDate: application.details.llIssueDate || application.licence?.issuedAt || '' };
  db.prepare('INSERT INTO dl_applications (application_id, data, status, updated_at) VALUES (?, ?, ?, ?)').run(applicationId, JSON.stringify(data), 'review', now());
  updateJourney(applicationId, 'dl-review', 'dl-review'); addEvent(applicationId, 'dl_started', 'Driving Licence application started');
  return { applicationId, data: JSON.stringify(data), status: 'review' };
}

app.get('/api/applications/:id/dl', requireAuth, (req, res, next) => { try { assertOwner(req.params.id, req.userId); const application = getApplication(req.params.id); if (!application.dl) return res.status(404).json({ error: 'Driving Licence application not started.' }); res.json({ dl: application.dl, application }); } catch (error) { next(error); } });
app.post('/api/applications/:id/dl', requireAuth, (req, res, next) => { try { assertOwner(req.params.id, req.userId); createOrGetDl(req.params.id); res.status(201).json({ application: getApplication(req.params.id) }); } catch (error) { next(error); } });
app.patch('/api/applications/:id/dl', requireAuth, (req, res, next) => { try { assertOwner(req.params.id, req.userId); const row = createOrGetDl(req.params.id); const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key, value]) => ['name', 'phone', 'email', 'address', 'city', 'pin', 'vehicle'].includes(key) && typeof value === 'string')); const data = { ...JSON.parse(row.data), ...updates }; db.prepare('UPDATE dl_applications SET data = ?, status = ?, updated_at = ? WHERE application_id = ?').run(JSON.stringify(data), 'payment', now(), req.params.id); updateJourney(req.params.id, 'dl-payment', 'dl-payment'); addEvent(req.params.id, 'dl_reviewed', 'Driving Licence details reviewed'); res.json({ application: getApplication(req.params.id) }); } catch (error) { next(error); } });

app.post('/api/applications/:id/dl/payment', requireAuth, (req, res, next) => { try { assertOwner(req.params.id, req.userId); createOrGetDl(req.params.id); const method = req.body.method; const outcome = req.body.outcome || 'successful'; if (!['UPI', 'Card', 'Net banking'].includes(method) || !['successful', 'failed'].includes(outcome)) throw httpError(400, 'Choose a valid demo payment method.'); const existing = db.prepare("SELECT id, reference, method, amount, status, created_at AS createdAt, updated_at AS updatedAt FROM payments WHERE application_id = ? AND stage = 'dl' AND status = 'successful' ORDER BY created_at DESC LIMIT 1").get(req.params.id); if (existing) return res.json({ payment: existing, application: getApplication(req.params.id) }); const payment = { id: id(), reference: `DEMO-DL-PAY-${crypto.randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()}`, method, amount: 750, status: outcome, createdAt: now(), updatedAt: now() }; db.prepare('INSERT INTO payments (id, application_id, reference, method, amount, status, created_at, updated_at, stage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(payment.id, req.params.id, payment.reference, method, payment.amount, outcome, payment.createdAt, payment.updatedAt, 'dl'); if (outcome === 'successful') { db.prepare('UPDATE dl_applications SET status = ?, updated_at = ? WHERE application_id = ?').run('appointment', now(), req.params.id); updateJourney(req.params.id, 'dl-appointment', 'dl-payment-successful'); } else updateJourney(req.params.id, 'dl-payment', 'dl-payment-failed'); addEvent(req.params.id, `dl_payment_${outcome}`, `DL demo payment ${outcome}`); res.status(201).json({ payment, application: getApplication(req.params.id) }); } catch (error) { next(error); } });

app.get('/api/appointments/availability', requireAuth, (req, res) => res.json({ slots: ['02 Sep · 10:00–10:30', '03 Sep · 11:30–12:00', '05 Sep · 14:00–14:30'] }));
app.post('/api/appointments', requireAuth, (req, res, next) => { try { const applicationId = req.body.applicationId; assertOwner(applicationId, req.userId); const slots = ['02 Sep · 10:00–10:30', '03 Sep · 11:30–12:00', '05 Sep · 14:00–14:30']; if (!slots.includes(req.body.slot)) throw httpError(400, 'That demo appointment slot is no longer available. Choose another slot.'); const old = db.prepare('SELECT id FROM appointments WHERE application_id = ?').get(applicationId); if (old) db.prepare('UPDATE appointments SET slot = ?, status = ?, updated_at = ? WHERE application_id = ?').run(req.body.slot, 'booked', now(), applicationId); else db.prepare('INSERT INTO appointments (id, application_id, slot, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(id(), applicationId, req.body.slot, 'booked', now(), now()); db.prepare('UPDATE dl_applications SET status = ?, updated_at = ? WHERE application_id = ?').run('rto-preparation', now(), applicationId); updateJourney(applicationId, 'dl-rto-preparation', 'appointment-booked'); addEvent(applicationId, 'appointment_booked', 'Driving test appointment booked'); res.status(201).json({ application: getApplication(applicationId) }); } catch (error) { next(error); } });
app.patch('/api/appointments/:id', requireAuth, (req, res, next) => { try { const appointment = db.prepare('SELECT application_id AS applicationId FROM appointments WHERE id = ?').get(req.params.id); if (!appointment) throw httpError(404, 'Appointment not found.'); assertOwner(appointment.applicationId, req.userId); if (req.body.status === 'cancelled') { db.prepare('UPDATE appointments SET status = ?, updated_at = ? WHERE id = ?').run('cancelled', now(), req.params.id); updateJourney(appointment.applicationId, 'dl-appointment', 'appointment-cancelled'); } else throw httpError(400, 'Only cancellation is supported in this demo.'); res.json({ application: getApplication(appointment.applicationId) }); } catch (error) { next(error); } });

app.post('/api/tests/driving/start', requireAuth, (req, res, next) => { try { assertOwner(req.body.applicationId, req.userId); const application = getApplication(req.body.applicationId); if (!application.dl?.appointment || application.dl.appointment.status !== 'booked') throw httpError(409, 'Book a demo appointment before starting the driving test.'); updateJourney(req.body.applicationId, 'dl-driving-test', 'driving-test'); addEvent(req.body.applicationId, 'driving_test_started', 'Demo driving test started'); res.json({ application: getApplication(req.body.applicationId) }); } catch (error) { next(error); } });
app.post('/api/tests/driving/submit', requireAuth, (req, res, next) => { try { assertOwner(req.body.applicationId, req.userId); const outcome = req.body.outcome; let score; let passed; if (outcome === 'passed') { score = 5; passed = true; } else if (outcome === 'failed') { score = 2; passed = false; } else { const checks = req.body.checks; if (!Array.isArray(checks) || checks.length !== 5 || checks.some((check) => typeof check !== 'boolean')) throw httpError(400, 'Choose pass or another attempt, or complete every driving-test check.'); score = checks.filter(Boolean).length; passed = score >= 4; } db.prepare('INSERT INTO driving_tests (id, application_id, score, total, passed, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(id(), req.body.applicationId, score, 5, passed ? 1 : 0, now()); updateJourney(req.body.applicationId, 'dl-driving-result', passed ? 'driving-test-passed' : 'driving-test-failed'); addEvent(req.body.applicationId, passed ? 'driving_test_passed' : 'driving_test_failed', passed ? 'Driving test passed' : 'Driving test needs another attempt'); res.json({ application: getApplication(req.body.applicationId) }); } catch (error) { next(error); } });

app.post('/api/applications/:id/dl/issue', requireAuth, (req, res, next) => { try { assertOwner(req.params.id, req.userId); const application = getApplication(req.params.id); if (!application.dl?.drivingTest?.passed) throw httpError(409, 'Pass the demo driving test before issuing the licence.'); let licence = application.dl.licence; if (!licence) { licence = { reference: `DL-DEMO-${crypto.randomUUID().replace(/-/g, '').slice(0, 7).toUpperCase()}`, issuedAt: now() }; db.prepare('INSERT INTO driving_licences (id, application_id, reference, issued_at, delivery_status, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(id(), req.params.id, licence.reference, licence.issuedAt, 'issued', now()); } updateJourney(req.params.id, 'dl-delivery', 'dl-issued'); addEvent(req.params.id, 'dl_issued', 'Driving Licence issued — Demo'); res.json({ application: getApplication(req.params.id) }); } catch (error) { next(error); } });
app.get('/api/applications/:id/licence', requireAuth, (req, res, next) => { try { assertOwner(req.params.id, req.userId); const licence = getApplication(req.params.id).dl?.licence; if (!licence) throw httpError(404, 'Driving Licence record not found.'); res.json({ licence }); } catch (error) { next(error); } });
app.get('/api/applications/:id/delivery', requireAuth, (req, res, next) => { try { assertOwner(req.params.id, req.userId); const licence = getApplication(req.params.id).dl?.licence; if (!licence) throw httpError(404, 'Delivery is not available yet.'); res.json({ delivery: licence }); } catch (error) { next(error); } });
app.post('/api/applications/:id/delivery/advance', requireAuth, (req, res, next) => { try { assertOwner(req.params.id, req.userId); const sequence = ['issued', 'printed', 'dispatched', 'delivered']; const licence = getApplication(req.params.id).dl?.licence; if (!licence) throw httpError(404, 'Driving Licence record not found.'); const nextStatus = sequence[Math.min(sequence.indexOf(licence.deliveryStatus) + 1, sequence.length - 1)]; db.prepare('UPDATE driving_licences SET delivery_status = ?, updated_at = ? WHERE application_id = ?').run(nextStatus, now(), req.params.id); updateJourney(req.params.id, 'dl-delivery', nextStatus === 'delivered' ? 'dl-delivered' : `dl-${nextStatus}`); addEvent(req.params.id, `dl_${nextStatus}`, `Driving Licence ${nextStatus} — Demo`); res.json({ application: getApplication(req.params.id) }); } catch (error) { next(error); } });

const GUIDED_FIELDS = ['vehicle', 'state', 'rto', 'dob', 'name', 'phone', 'email', 'address', 'city', 'pin', 'documents', 'fitness'];
const STATE_RTOS = { Maharashtra: ['Pune West (MH-12)', 'Mumbai Central (MH-01)'], Karnataka: ['Bengaluru Central (KA-01)'], Delhi: ['Sarai Kale Khan (DL-01)'], 'Tamil Nadu': ['Chennai Central (TN-09)'] };

function persistGuidedField(applicationId, field, value) {
  if (field === 'state') db.prepare('UPDATE applications SET state = ?, updated_at = ? WHERE id = ?').run(value, now(), applicationId);
  else if (field === 'rto') db.prepare('UPDATE applications SET rto = ?, updated_at = ? WHERE id = ?').run(value, now(), applicationId);
  else if (field === 'documents') saveDetails(applicationId, { documentsGuidance: true });
  else if (field === 'fitness') saveDetails(applicationId, { fitnessConfirmed: true });
  else saveDetails(applicationId, { [field]: value });
  addEvent(applicationId, 'guided_application_update', `Guided ${field} confirmed`);
}

function deterministicGuide(field, message) {
  const lower = message.toLowerCase(); let value = null; let reply = '';
  if (/proof of address|address proof/.test(lower)) {
    reply = 'Proof of address means a document showing where you currently live. Accepted documents can vary by state/RTO.';
    return { assistantMessage: reply, extractedField: null, extractedValue: null, requiresConfirmation: false, needsClarification: true };
  }
  if (/come back|save.*later|resume/.test(lower)) {
    reply = 'Yes. This demo saves your answers on the server, so you can switch to the classic form and return later.';
    return { assistantMessage: reply, extractedField: null, extractedValue: null, requiresConfirmation: false, needsClarification: true };
  }
  if (field === 'vehicle') { value = /both|bike.*car|car.*bike/.test(lower) ? 'LMV — Light Motor Vehicle' : /without gear|mcwog|scooter/.test(lower) ? 'MCWOG — Motorcycle without Gear' : /car|lmv/.test(lower) ? 'LMV — Light Motor Vehicle' : /motor|bike|mcwg/.test(lower) ? 'MCWG — Motorcycle with Gear' : null; reply = value ? `I understood: ${value}. Is that correct?` : 'Please choose motorcycle with gear, motorcycle without gear, or car. Your state/RTO confirms the final category.'; }
  else if (field === 'state') { value = Object.keys(STATE_RTOS).find((item) => item.toLowerCase() === lower || lower.includes(item.toLowerCase())) || null; reply = value ? `I understood: ${value}. Is that correct?` : 'Choose Maharashtra, Karnataka, Delhi, or Tamil Nadu in this demo.'; }
  else if (field === 'rto') {
    const all = Object.values(STATE_RTOS).flat();
    value = all.find((item) => item.toLowerCase() === lower || lower.includes(item.toLowerCase().split(' (')[0])) || null;
    reply = value ? `I understood: ${value}. Is that correct?` : 'Choose one of the demo RTO offices listed for your state.';
  }
  else if (field === 'dob') { const match = message.match(/\d{4}-\d{2}-\d{2}/) || message.match(/\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4}/); value = match ? match[0] : null; if (value && value.includes('/')) { const [d, m, y] = value.split(/[\/.-]/); if (y && y.length === 4) value = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`; } reply = value ? `I understood your date of birth as ${value}. Is that correct?` : 'Please enter your date of birth as YYYY-MM-DD.'; }
  else if (field === 'phone') { const digits = message.replace(/\D/g, ''); value = digits.length === 10 ? digits : null; reply = value ? `I understood your mobile number as ${value}. Is that correct?` : 'Enter a 10-digit Indian mobile number.'; }
  else if (field === 'pin') { const digits = message.replace(/\D/g, ''); value = digits.length === 6 ? digits : null; reply = value ? `I understood PIN ${value}. Is that correct?` : 'Enter a 6-digit PIN code.'; }
  else if (field === 'email') { value = /\S+@\S+\.\S+/.test(message) ? message.trim() : null; reply = value ? `I understood your email as ${value}. Is that correct?` : 'Enter an email address, or switch to the classic form to skip this optional field.'; }
  else if (field === 'documents') { value = /ready|understand|yes|ok|checklist/.test(lower) ? 'acknowledged' : null; reply = value ? 'I understood that you are ready to use the document checklist. Save this and continue?' : 'You will need identity, address, and photo/signature evidence. Exact lists vary by state/RTO. Say yes when you understand the checklist.'; }
  else if (field === 'fitness') { value = /yes|confirm|understand|form/.test(lower) ? 'confirmed' : null; reply = value ? 'I understood you confirm the demo fitness declaration. Save this?' : 'Form 1 is a self-declaration in many cases. Form 1A may apply from age 40 or in other cases. Confirm with your RTO. Say yes if you understand.'; }
  else if (['name', 'address', 'city'].includes(field)) { value = message.trim().slice(0, 120); reply = `I understood: ${value}. Is that correct?`; }
  return { assistantMessage: reply, extractedField: value ? field : null, extractedValue: value, requiresConfirmation: Boolean(value), needsClarification: !value };
}

async function llmGuide(field, message) {
  if (!process.env.OPENAI_API_KEY) throw new Error('LLM_NOT_CONFIGURED');
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const payload = { model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', store: false, max_output_tokens: 160, text: { format: { type: 'json_schema', name: 'guided_application', strict: true, schema: { type: 'object', properties: { assistantMessage: { type: 'string' }, extractedField: { type: ['string', 'null'] }, extractedValue: { type: ['string', 'null'] }, requiresConfirmation: { type: 'boolean' }, needsClarification: { type: 'boolean' } }, required: ['assistantMessage', 'extractedField', 'extractedValue', 'requiresConfirmation', 'needsClarification'], additionalProperties: false } } }, input: `You are a concise Sarathi demo assistant. Extract only the requested field (${field}) from this message: ${message}. Do not give legal or official advice. If unclear, set extracted values to null and ask one clarification.` };
    const response = await fetch(`${process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'}/responses`, { method: 'POST', signal: controller.signal, headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error('LLM_REQUEST_FAILED'); const body = await response.json(); return JSON.parse(body.output_text);
  } finally { clearTimeout(timer); }
}

function validGuidedResult(result, field) { return result && typeof result.assistantMessage === 'string' && typeof result.requiresConfirmation === 'boolean' && typeof result.needsClarification === 'boolean' && (result.extractedField === null || result.extractedField === field) && (result.extractedValue === null || typeof result.extractedValue === 'string'); }

app.post('/api/ai/application-message', requireAuth, async (req, res, next) => {
  try {
    const applicationId = req.body.applicationId; assertOwner(applicationId, req.userId);
    const field = String(req.body.field || 'vehicle');
    if (!GUIDED_FIELDS.includes(field)) throw httpError(400, 'That guided field is not available. Switch to the classic form for other details.');
    if (req.body.confirm === true) {
      const extractedValue = String(req.body.extractedValue || '').trim().slice(0, 160);
      if (!extractedValue) throw httpError(400, 'Confirm a value before saving.');
      persistGuidedField(applicationId, field, extractedValue);
      return res.json({ assistantMessage: 'Saved. We can continue.', extractedField: field, extractedValue, requiresConfirmation: false, needsClarification: false, mode: 'confirmed', saved: true, application: getApplication(applicationId) });
    }
    const message = String(req.body.message || '').trim().slice(0, 300);
    if (!message) throw httpError(400, 'Write a response before sending.');
    let result; let mode = 'llm'; try { result = await llmGuide(field, message); if (!validGuidedResult(result, field)) throw new Error('LLM_INVALID_OUTPUT'); } catch (_) { result = deterministicGuide(field, message); mode = 'fallback'; }
    res.json({ ...result, mode, saved: false, application: getApplication(applicationId) });
  } catch (error) { next(error); }
});

app.use('/api', (_req, _res, next) => next(httpError(404, 'That service endpoint does not exist.')));

if (process.env.NODE_ENV === 'production') {
  if (!fs.existsSync(clientDist)) throw new Error('Production frontend build is missing. Run pnpm build before pnpm start.');
  app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
  app.get('/{*splat}', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use((_req, _res, next) => next(httpError(404, 'That page does not exist.')));
app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ error: status >= 500 ? 'We could not connect right now. Please try again.' : error.message });
});

app.listen(port, () => console.log(`Saarthi API listening on http://localhost:${port}`));
