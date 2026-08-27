interface DashboardProps {
  onNavigate: (page: string) => void;
}

type StepStatus = "done" | "active" | "upcoming";

interface Step {
  label: string;
  status: StepStatus;
}

const steps: Step[] = [
  { label: "Application started", status: "done" },
  { label: "Personal details", status: "done" },
  { label: "Documents", status: "done" },
  { label: "Payment", status: "done" },
  { label: "Learner's Licence test", status: "active" },
  { label: "Learner's Licence issued", status: "upcoming" },
  { label: "30-day waiting period", status: "upcoming" },
  { label: "Apply for Driving Licence", status: "upcoming" },
  { label: "Driving test", status: "upcoming" },
  { label: "Licence issued", status: "upcoming" },
  { label: "Delivery", status: "upcoming" },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-5 pt-10 pb-24">
        {/* Greeting */}
        <div className="mb-10">
          <p className="text-sm text-gray-500 mb-1">Good morning,</p>
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900">Priya Mehta</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-5">
                Your journey
              </p>
              <div className="flex flex-col gap-0">
                {steps.map((step, i) => (
                  <TimelineStep key={i} step={step} isLast={i === steps.length - 1} />
                ))}
              </div>
            </div>
          </div>

          {/* Main area */}
          <div className="md:col-span-2 flex flex-col gap-5">
            {/* Next step card */}
            <div className="bg-teal-600 rounded-2xl p-6 text-white">
              <div className="text-xs font-medium text-teal-200 uppercase tracking-widest mb-3">
                Your next step
              </div>
              <h2 className="text-xl font-semibold mb-2">Take your Learner's Licence test</h2>
              <p className="text-sm text-teal-100 leading-relaxed mb-1">
                <span className="font-medium text-white">What you need to do:</span> Complete a
                30-question online theory test about road rules and signs.
              </p>
              <p className="text-sm text-teal-100 leading-relaxed mb-1">
                <span className="font-medium text-white">Why it matters:</span> You need to pass
                this to receive your Learner's Licence — the first official document that lets you
                practise driving on the road.
              </p>
              <p className="text-sm text-teal-100 leading-relaxed mb-5">
                <span className="font-medium text-white">What happens next:</span> Your Learner's
                Licence will be issued within 2–3 working days after you pass.
              </p>
              <button
                onClick={() => onNavigate("apply")}
                className="px-5 py-2.5 bg-white text-teal-700 text-sm font-semibold rounded-xl hover:bg-teal-50 transition-colors"
              >
                Start the test →
              </button>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: "📄", label: "Documents" },
                { icon: "💳", label: "Payments" },
                { icon: "📅", label: "Appointments" },
                { icon: "🆘", label: "I'm stuck" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => item.label === "I'm stuck" ? onNavigate("help") : undefined}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-center"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-medium text-gray-700">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Status summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">
                Application summary
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Stat label="Application ID" value="AP2024-00387" />
                <Stat label="State" value="Maharashtra" />
                <Stat label="RTO" value="Pune West (MH-12)" />
                <Stat label="Category" value="LMV — Light Motor Vehicle" />
                <Stat label="Applied on" value="14 August 2024" />
                <Stat label="LL Test" value="Pending" highlight />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineStep({ step, isLast }: { step: Step; isLast: boolean }) {
  const icon = {
    done: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2.5 7l3 3 5.5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    active: <div className="w-2.5 h-2.5 rounded-full bg-white" />,
    upcoming: null,
  };

  const dotClass = {
    done: "bg-teal-600 border-teal-600",
    active: "bg-teal-600 border-teal-600 ring-4 ring-teal-100",
    upcoming: "bg-white border-gray-200",
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${dotClass[step.status]}`}
        >
          {icon[step.status]}
        </div>
        {!isLast && (
          <div
            className={`w-px flex-1 my-0.5 ${step.status === "done" ? "bg-teal-200" : "bg-gray-100"}`}
            style={{ minHeight: "20px" }}
          />
        )}
      </div>
      <div className="pb-4">
        <span
          className={`text-sm leading-tight ${
            step.status === "active"
              ? "font-semibold text-teal-700"
              : step.status === "done"
              ? "text-gray-500"
              : "text-gray-400"
          }`}
        >
          {step.label}
        </span>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm font-medium ${highlight ? "text-amber-600" : "text-gray-800"}`}>
        {value}
      </p>
    </div>
  );
}
