import 'dotenv/config';
import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import express from 'express';
import { db } from './db.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const sessionDays = Number(process.env.SESSION_DAYS || 14);
const cookieSecret = process.env.SESSION_SECRET || 'saarthi-development-secret-change-me';
const DEMO_OTP = '123456';
const now = () => new Date().toISOString();
const expiresAt = (minutes) => new Date(Date.now() + minutes * 60_000).toISOString();
const id = () => crypto.randomUUID();

app.use(express.json({ limit: '20kb' }));
app.use(cookieParser(cookieSecret));

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

function createOrGetApplication(userId, intent) {
  const existing = db.prepare(`SELECT id, user_id AS userId, intent, status, current_step AS currentStep, state, rto,
    created_at AS createdAt, updated_at AS updatedAt FROM applications WHERE user_id = ? AND intent = ?`).get(userId, intent);
  if (existing) return existing;

  const application = {
    id: `APP-${crypto.randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()}`,
    userId,
    intent,
    status: 'started',
    currentStep: 'application-entry',
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
    const application = challenge.intent ? createOrGetApplication(challenge.userId, challenge.intent) : getCurrentApplication(challenge.userId);
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
  res.json({ application });
});

app.post('/api/applications', requireAuth, (req, res, next) => {
  try {
    const intent = req.body.intent;
    if (!['first-ll', 'existing-ll'].includes(intent)) throw httpError(400, 'Choose a valid application path.');
    res.status(201).json({ application: createOrGetApplication(req.userId, intent) });
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
    res.json({ application: db.prepare(`SELECT id, user_id AS userId, intent, status, current_step AS currentStep, state, rto,
      created_at AS createdAt, updated_at AS updatedAt FROM applications WHERE id = ?`).get(application.id) });
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

app.use((_req, _res, next) => next(httpError(404, 'That service endpoint does not exist.')));
app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ error: status >= 500 ? 'We could not connect right now. Please try again.' : error.message });
});

app.listen(port, () => console.log(`Saarthi API listening on http://localhost:${port}`));
