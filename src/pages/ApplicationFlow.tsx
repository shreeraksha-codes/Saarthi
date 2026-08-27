import { useState } from "react";

interface ApplicationFlowProps {
  onNavigate: (page: string) => void;
}

const STEPS = [
  "What are you applying for?",
  "State & RTO",
  "Eligibility",
  "Personal details",
  "Documents",
  "Fitness declaration",
  "Review",
  "Fees",
  "Payment",
  "Appointment",
  "LL Test",
  "Result",
];

export default function ApplicationFlow({ onNavigate }: ApplicationFlowProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [testScore, setTestScore] = useState<number | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else onNavigate("dashboard");
  };
  const back = () => {
    if (step > 0) setStep(step - 1);
    else onNavigate("dashboard");
  };

  const set = (k: string, v: string) => setAnswers((a) => ({ ...a, [k]: v }));

  return (
    <div className="min-h-screen bg-white">
      {/* Progress bar */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-100">
        <div
          className="h-0.5 bg-teal-500 transition-all duration-500"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
          <button onClick={back} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1.5 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {step === 0 ? "Exit" : "Back"}
          </button>
          <span className="text-xs text-gray-400">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 pt-10 pb-24">
        {step === 0 && (
          <StepWhat answers={answers} set={set} next={next} />
        )}
        {step === 1 && (
          <StepStateRTO answers={answers} set={set} next={next} />
        )}
        {step === 2 && (
          <StepEligibility answers={answers} set={set} next={next} />
        )}
        {step === 3 && (
          <StepPersonal answers={answers} set={set} next={next} />
        )}
        {step === 4 && <StepDocuments next={next} />}
        {step === 5 && <StepFitness next={next} />}
        {step === 6 && <StepReview answers={answers} onEdit={setStep} next={next} />}
        {step === 7 && <StepFees next={next} />}
        {step === 8 && <StepPayment paymentDone={paymentDone} setPaymentDone={setPaymentDone} next={next} />}
        {step === 9 && <StepAppointment next={next} />}
        {step === 10 && <StepLLTest setScore={setTestScore} next={next} />}
        {step === 11 && <StepResult score={testScore} onFinish={() => onNavigate("dashboard")} />}
      </div>
    </div>
  );
}

/* ---- Step components ---- */

function StepWhat({ answers, set, next }: { answers: Record<string,string>; set: (k:string,v:string)=>void; next: ()=>void }) {
  const opts = ["LMV – Light Motor Vehicle (Car)", "MCWG – Motorcycle with Gear", "MCWOG – Motorcycle without Gear"];
  return (
    <div>
      <Heading>What are you applying for?</Heading>
      <Sub>Choose the vehicle class you want to drive.</Sub>
      <div className="flex flex-col gap-3 mt-8">
        {opts.map((o) => (
          <Radio key={o} label={o} selected={answers.vehicle === o} onSelect={() => set("vehicle", o)} />
        ))}
      </div>
      <CTA disabled={!answers.vehicle} onClick={next} />
    </div>
  );
}

function StepStateRTO({ answers, set, next }: { answers: Record<string,string>; set: (k:string,v:string)=>void; next: ()=>void }) {
  const states = ["Maharashtra", "Karnataka", "Tamil Nadu", "Delhi", "Gujarat", "Telangana", "Uttar Pradesh", "Rajasthan"];
  const rtos: Record<string, string[]> = {
    Maharashtra: ["Pune West (MH-12)", "Mumbai Central (MH-01)", "Nagpur (MH-31)"],
    Karnataka: ["Bengaluru Central (KA-01)", "Mysuru (KA-09)"],
    "Tamil Nadu": ["Chennai Central (TN-09)", "Coimbatore (TN-38)"],
    Delhi: ["Sarai Kale Khan (DL-01)", "Rohini (DL-08)"],
    Gujarat: ["Ahmedabad (GJ-01)", "Surat (GJ-05)"],
    Telangana: ["Hyderabad Central (TS-09)", "Secunderabad (TS-10)"],
    "Uttar Pradesh": ["Lucknow (UP-32)", "Kanpur (UP-78)"],
    Rajasthan: ["Jaipur (RJ-14)", "Jodhpur (RJ-19)"],
  };
  return (
    <div>
      <Heading>Where do you live?</Heading>
      <Sub>Your application is processed at the RTO in your area.</Sub>
      <div className="mt-8 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">State</label>
          <select
            value={answers.state ?? ""}
            onChange={(e) => { set("state", e.target.value); set("rto", ""); }}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="">Select state</option>
            {states.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        {answers.state && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">RTO office</label>
            <select
              value={answers.rto ?? ""}
              onChange={(e) => set("rto", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">Select RTO</option>
              {(rtos[answers.state] ?? []).map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        )}
      </div>
      <CTA disabled={!answers.state || !answers.rto} onClick={next} />
    </div>
  );
}

function StepEligibility({ answers, set, next }: { answers: Record<string,string>; set: (k:string,v:string)=>void; next: ()=>void }) {
  return (
    <div>
      <Heading>Let's check your eligibility</Heading>
      <Sub>Answer a few quick questions to confirm you can apply.</Sub>
      <div className="mt-8 space-y-5">
        <YesNo label="Are you 18 years or older?" value={answers.age18} onSelect={(v) => set("age18", v)} />
        <YesNo label="Do you have a valid Aadhaar card or passport?" value={answers.hasId} onSelect={(v) => set("hasId", v)} />
        <YesNo label="Do you have any medical condition that affects your ability to drive?" value={answers.medical} onSelect={(v) => set("medical", v)} />
      </div>
      {answers.medical === "Yes" && (
        <div className="mt-5 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm text-amber-800">You'll need a medical certificate (Form 1A) signed by a registered medical practitioner. We'll remind you when you reach the documents step.</p>
        </div>
      )}
      <CTA disabled={!answers.age18 || !answers.hasId || !answers.medical} onClick={next} />
    </div>
  );
}

function StepPersonal({ answers, set, next }: { answers: Record<string,string>; set: (k:string,v:string)=>void; next: ()=>void }) {
  return (
    <div>
      <Heading>Your personal details</Heading>
      <Sub>Enter your details exactly as they appear on your identity document.</Sub>
      <div className="mt-8 flex flex-col gap-4">
        <Field label="Full name" placeholder="Priya Mehta" value={answers.name ?? ""} onChange={v => set("name", v)} />
        <Field label="Date of birth" type="date" value={answers.dob ?? ""} onChange={v => set("dob", v)} />
        <Field label="Mobile number" placeholder="98765 43210" value={answers.phone ?? ""} onChange={v => set("phone", v)} type="tel" />
        <Field label="Email address" placeholder="priya@email.com" value={answers.email ?? ""} onChange={v => set("email", v)} type="email" />
        <Field label="Address line 1" placeholder="Flat 4B, Shivaji Nagar" value={answers.addr1 ?? ""} onChange={v => set("addr1", v)} />
        <Field label="City / District" placeholder="Pune" value={answers.city ?? ""} onChange={v => set("city", v)} />
        <Field label="PIN code" placeholder="411001" value={answers.pin ?? ""} onChange={v => set("pin", v)} />
      </div>
      <CTA disabled={!answers.name || !answers.dob || !answers.phone} onClick={next} />
    </div>
  );
}

function StepDocuments({ next }: { next: ()=>void }) {
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({});
  const docs = [
    { id: "aadhar", name: "Aadhaar card", why: "Proof of identity and address", formats: "PDF or JPG, under 2 MB" },
    { id: "photo", name: "Passport-size photo", why: "Required for your licence card", formats: "JPG, 35×45 mm, white background" },
    { id: "sign", name: "Signature", why: "Required for your licence card", formats: "JPG, 35×15 mm, on white paper" },
    { id: "dob", name: "Date of birth proof", why: "10th marksheet, birth certificate, or passport", formats: "PDF or JPG, under 2 MB" },
  ];
  const allUploaded = docs.every(d => uploaded[d.id]);
  return (
    <div>
      <Heading>Your documents</Heading>
      <Sub>Upload clear, readable copies. Originals will be verified at your RTO visit.</Sub>
      <div className="mt-8 flex flex-col gap-3">
        {docs.map(d => (
          <div key={d.id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-white">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 mb-0.5">{d.name}</div>
              <div className="text-xs text-gray-500 mb-0.5">{d.why}</div>
              <div className="text-xs text-gray-400">{d.formats}</div>
            </div>
            <button
              onClick={() => setUploaded(u => ({ ...u, [d.id]: true }))}
              className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                uploaded[d.id]
                  ? "bg-teal-50 text-teal-700 border border-teal-200"
                  : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {uploaded[d.id] ? "✓ Uploaded" : "Upload"}
            </button>
          </div>
        ))}
      </div>
      <CTA disabled={!allUploaded} onClick={next} label="All documents uploaded →" />
    </div>
  );
}

function StepFitness({ next }: { next: ()=>void }) {
  const [agreed, setAgreed] = useState(false);
  return (
    <div>
      <Heading>Fitness declaration</Heading>
      <Sub>This is called Form 1 — a self-declaration that you're physically fit to drive.</Sub>
      <div className="mt-8 p-5 bg-gray-50 rounded-xl border border-gray-100">
        <p className="text-sm font-medium text-gray-700 mb-3">Form 1 — Self Declaration</p>
        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside leading-relaxed">
          <li>I do not suffer from any disability that impairs my ability to drive safely.</li>
          <li>I do not have epilepsy, sudden attacks of dizziness, or impaired vision.</li>
          <li>I am not suffering from any mental disorder.</li>
          <li>I have no addiction to alcohol or drugs that might affect my driving.</li>
        </ul>
      </div>
      <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
        <p className="text-sm text-amber-700">
          <span className="font-medium">Note:</span> If any of the above apply to you, you will
          need a medical certificate (Form 1A) from a registered doctor. You can upload it in
          the documents step.
        </p>
      </div>
      <label className="flex items-start gap-3 mt-6 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-teal-600"
        />
        <span className="text-sm text-gray-700">I confirm that all the above statements are true to the best of my knowledge.</span>
      </label>
      <CTA disabled={!agreed} onClick={next} label="Confirm declaration →" />
    </div>
  );
}

function StepReview({ answers, onEdit, next }: { answers: Record<string,string>; onEdit: (s:number)=>void; next: ()=>void }) {
  return (
    <div>
      <Heading>Review your application</Heading>
      <Sub>Check everything carefully — you can edit before you pay.</Sub>
      <div className="mt-8 flex flex-col gap-4">
        <ReviewCard title="Vehicle class" value={answers.vehicle ?? "—"} onEdit={() => onEdit(0)} />
        <ReviewCard title="State & RTO" value={answers.rto ? `${answers.state} · ${answers.rto}` : "—"} onEdit={() => onEdit(1)} />
        <ReviewCard title="Name" value={answers.name ?? "—"} onEdit={() => onEdit(3)} />
        <ReviewCard title="Date of birth" value={answers.dob ?? "—"} onEdit={() => onEdit(3)} />
        <ReviewCard title="Mobile" value={answers.phone ? `+91 ${answers.phone}` : "—"} onEdit={() => onEdit(3)} />
        <ReviewCard title="Address" value={[answers.addr1, answers.city, answers.pin].filter(Boolean).join(", ") || "—"} onEdit={() => onEdit(3)} />
      </div>
      <CTA onClick={next} label="Looks good, proceed to fees →" />
    </div>
  );
}

function StepFees({ next }: { next: ()=>void }) {
  const fees = [
    { name: "Learner's Licence application fee", amount: "₹200" },
    { name: "LL theory test fee", amount: "₹50" },
    { name: "Smart card (licence card) fee", amount: "₹200" },
    { name: "Service convenience fee", amount: "₹30" },
  ];
  return (
    <div>
      <Heading>Fee breakdown</Heading>
      <Sub>These are simulated fees based on Maharashtra state rates for 2024.</Sub>
      <div className="mt-8 rounded-xl border border-gray-100 overflow-hidden">
        {fees.map((f, i) => (
          <div key={i} className={`flex justify-between px-4 py-3.5 text-sm ${i < fees.length - 1 ? "border-b border-gray-50" : ""}`}>
            <span className="text-gray-700">{f.name}</span>
            <span className="font-medium text-gray-900">{f.amount}</span>
          </div>
        ))}
        <div className="flex justify-between px-4 py-3.5 bg-teal-50 text-sm border-t border-teal-100">
          <span className="font-semibold text-teal-800">Total</span>
          <span className="font-bold text-teal-800">₹480</span>
        </div>
      </div>
      <CTA onClick={next} label="Proceed to payment →" />
    </div>
  );
}

function StepPayment({ paymentDone, setPaymentDone, next }: { paymentDone: boolean; setPaymentDone: (v:boolean)=>void; next: ()=>void }) {
  const [method, setMethod] = useState("");
  return (
    <div>
      <Heading>Payment</Heading>
      <Sub>This is a simulated payment — no real money will be charged.</Sub>
      <div className="mt-4 px-4 py-3 bg-amber-50 rounded-xl border border-amber-200 text-sm text-amber-700 font-medium">
        Demo prototype — payment is simulated only
      </div>
      <div className="mt-6 flex flex-col gap-3">
        {["UPI / PhonePe / GPay", "Debit / Credit Card", "Net Banking"].map(m => (
          <Radio key={m} label={m} selected={method === m} onSelect={() => setMethod(m)} />
        ))}
      </div>
      {!paymentDone ? (
        <CTA disabled={!method} onClick={() => setPaymentDone(true)} label="Pay ₹480 (simulated) →" />
      ) : (
        <div className="mt-6">
          <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 text-sm text-teal-700 font-medium mb-4">
            ✓ Payment of ₹480 successful (simulated) · Ref: SAR20240814-7823
          </div>
          <CTA onClick={next} label="Continue →" />
        </div>
      )}
    </div>
  );
}

function StepAppointment({ next }: { next: ()=>void }) {
  const [date, setDate] = useState("2024-08-28");
  const [time, setTime] = useState("10:30");
  return (
    <div>
      <Heading>Book your RTO appointment</Heading>
      <Sub>You'll need to visit the RTO for identity verification before the theory test.</Sub>
      <div className="mt-8 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">Time slot</label>
          <select value={time} onChange={e => setTime(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
            <option value="09:00">09:00 AM</option>
            <option value="10:30">10:30 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="14:30">02:30 PM</option>
          </select>
        </div>
      </div>
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <p className="text-xs font-semibold text-gray-700 mb-2">What to bring on the day</p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>✓ Original Aadhaar card</li>
          <li>✓ Original date of birth proof</li>
          <li>✓ 2 passport-size photos</li>
          <li>✓ Appointment confirmation (this screen)</li>
          <li>✓ Application reference: AP2024-00387</li>
        </ul>
      </div>
      <CTA onClick={next} label="Confirm appointment →" />
    </div>
  );
}

const testQuestions = [
  { q: "What does a solid red traffic light mean?", opts: ["Slow down", "Stop and wait", "Proceed with caution", "Horn prohibited"], ans: 1 },
  { q: "What is the maximum speed limit in a residential area?", opts: ["30 km/h", "40 km/h", "50 km/h", "60 km/h"], ans: 0 },
  { q: "When should you use your horn?", opts: ["At all times", "Only to greet others", "Only when necessary, to warn others", "Never on highways"], ans: 2 },
  { q: "A yellow diamond road sign indicates:", opts: ["Stop ahead", "Mandatory direction", "Warning / caution", "No entry"], ans: 2 },
  { q: "What does the 'No Parking' sign look like?", opts: ["Red circle with a P", "Blue circle with a P", "Red cross on white", "Blue P crossed out"], ans: 0 },
];

function StepLLTest({ setScore, next }: { setScore: (s:number)=>void; next: ()=>void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const correct = testQuestions.filter((q, i) => answers[i] === q.ans).length;
    setScore(correct);
    setSubmitted(true);
  };

  return (
    <div>
      <Heading>Learner's Licence theory test</Heading>
      <Sub>Answer all 5 questions. You need to get at least 4 correct to pass.</Sub>
      <div className="mt-8 flex flex-col gap-6">
        {testQuestions.map((q, qi) => (
          <div key={qi}>
            <p className="text-sm font-medium text-gray-900 mb-3">
              {qi + 1}. {q.q}
            </p>
            <div className="flex flex-col gap-2">
              {q.opts.map((opt, oi) => {
                const selected = answers[qi] === oi;
                const correct = submitted && oi === q.ans;
                const wrong = submitted && selected && oi !== q.ans;
                return (
                  <button
                    key={oi}
                    disabled={submitted}
                    onClick={() => !submitted && setAnswers(a => ({ ...a, [qi]: oi }))}
                    className={`text-left px-4 py-2.5 rounded-lg text-sm border transition-colors ${
                      correct ? "bg-teal-50 border-teal-300 text-teal-800" :
                      wrong ? "bg-red-50 border-red-300 text-red-700" :
                      selected ? "bg-teal-50 border-teal-200 text-teal-800" :
                      "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {!submitted ? (
        <CTA disabled={Object.keys(answers).length < testQuestions.length} onClick={handleSubmit} label="Submit answers →" />
      ) : (
        <CTA onClick={next} label="See results →" />
      )}
    </div>
  );
}

function StepResult({ score, onFinish }: { score: number | null; onFinish: ()=>void }) {
  const passed = (score ?? 0) >= 4;
  return (
    <div className="text-center">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${passed ? "bg-teal-100" : "bg-amber-100"}`}>
        <span className="text-3xl">{passed ? "🎉" : "💪"}</span>
      </div>
      <h2 className={`font-serif text-3xl mb-3 ${passed ? "text-teal-700" : "text-gray-800"}`}>
        {passed ? "Test passed!" : "Almost there."}
      </h2>
      <p className="text-gray-500 mb-2">
        You answered <span className="font-semibold text-gray-800">{score} out of {testQuestions.length}</span> correctly.
      </p>
      {passed ? (
        <>
          <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-sm mx-auto">
            Your Learner's Licence will be processed within 2–3 working days and sent to your
            registered address. It's also available for download from My Journey.
          </p>
          <button onClick={onFinish} className="px-6 py-3.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors">
            Go to My Journey →
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-sm mx-auto">
            You need 4 correct answers to pass. That's completely okay — take a look at the
            Resources section to brush up, and try again when you're ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => window.location.reload()} className="px-6 py-3.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition-colors text-sm">
              Try again
            </button>
            <button onClick={onFinish} className="px-6 py-3.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm">
              Back to My Journey
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ---- Shared primitives ---- */

function Heading({ children }: { children: React.ReactNode }) {
  return <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-2">{children}</h1>;
}

function Sub({ children }: { children: React.ReactNode }) {
  return <p className="text-base text-gray-500">{children}</p>;
}

function CTA({ onClick, disabled, label = "Continue →" }: { onClick: ()=>void; disabled?: boolean; label?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-8 w-full py-3.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 active:bg-teal-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-base"
    >
      {label}
    </button>
  );
}

function Radio({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: ()=>void }) {
  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all text-sm ${
        selected ? "border-teal-400 bg-teal-50 text-teal-800" : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? "border-teal-600" : "border-gray-300"}`}>
        {selected && <div className="w-2 h-2 rounded-full bg-teal-600" />}
      </div>
      {label}
    </button>
  );
}

function YesNo({ label, value, onSelect }: { label: string; value?: string; onSelect: (v:string)=>void }) {
  return (
    <div>
      <p className="text-sm text-gray-800 mb-2">{label}</p>
      <div className="flex gap-2">
        {["Yes", "No"].map(v => (
          <button
            key={v}
            onClick={() => onSelect(v)}
            className={`px-5 py-2 rounded-lg border text-sm font-medium transition-colors ${value === v ? "border-teal-400 bg-teal-50 text-teal-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, type = "text" }: { label: string; placeholder?: string; value: string; onChange: (v:string)=>void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition placeholder-gray-300"
      />
    </div>
  );
}

function ReviewCard({ title, value, onEdit }: { title: string; value: string; onEdit: ()=>void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-50">
      <div>
        <p className="text-xs text-gray-400 mb-0.5">{title}</p>
        <p className="text-sm text-gray-900">{value}</p>
      </div>
      <button onClick={onEdit} className="text-xs text-teal-600 hover:text-teal-800 font-medium shrink-0">Edit</button>
    </div>
  );
}
