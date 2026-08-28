import type { Application, User } from "../api/client";
import { nextActionCopy, simplifiedTimelineFor } from "../journey";

interface DashboardProps {
  onNavigate: (page: string, data?: unknown) => void;
  user: User | null;
  application: Application;
}

export default function Dashboard({ onNavigate, user, application }: DashboardProps) {
  const steps = simplifiedTimelineFor(application);
  const copy = nextActionCopy(application);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const existingLl = application.intent === "existing-ll";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-5 pt-10 pb-24">
        <div className="mb-10">
          <p className="text-sm text-gray-500 mb-1">{greeting},</p>
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900">{user?.name?.split(" ")[0] || "there"}</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-5">
                Your journey
              </p>
              <div className="flex flex-col gap-0">
                {steps.map((step, i) => (
                  <TimelineStep key={step.id} step={step} isLast={i === steps.length - 1} />
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col gap-5">
            <div className="bg-teal-600 rounded-2xl p-6 text-white">
              <div className="text-xs font-medium text-teal-200 uppercase tracking-widest mb-3">
                Your next step
              </div>
              <h2 className="text-xl font-semibold mb-2">{copy.title}</h2>
              <p className="text-sm text-teal-100 leading-relaxed mb-1">
                <span className="font-medium text-white">What you need to do:</span> {copy.need}
              </p>
              <p className="text-sm text-teal-100 leading-relaxed mb-1">
                <span className="font-medium text-white">Why it matters:</span> {copy.why}
              </p>
              <p className="text-sm text-teal-100 leading-relaxed mb-5">
                <span className="font-medium text-white">What happens next:</span> {copy.after}
              </p>
              <button
                onClick={() => onNavigate("apply")}
                className="px-5 py-2.5 bg-white text-teal-700 text-sm font-semibold rounded-xl hover:bg-teal-50 transition-colors"
              >
                Continue →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: "📄", label: "Documents", focus: "documents" },
                { icon: "💳", label: "Payments", focus: "payment" },
                { icon: "📅", label: "Appointments", focus: "appointment" },
                { icon: "✨", label: "Guided help", page: "guided" },
                { icon: "🆘", label: "I'm stuck", page: "help" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => item.page ? onNavigate(item.page) : onNavigate("apply", { focus: item.focus })}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-center"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-medium text-gray-700">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">
                Application summary
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Stat label="Application ID" value={application.id} />
                <Stat label="Application type" value={existingLl ? "Existing Learner's Licence → Driving Licence" : "First Learner's Licence"} />
                <Stat label="State" value={application.state || "To be selected"} />
                <Stat label="RTO" value={application.rto || "To be selected"} />
                <Stat label="Current step" value={copy.title} />
                <Stat label="Status" value={steps.find((step) => step.status === "active")?.label || copy.title} highlight />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineStep({ step, isLast }: { step: { label: string; status: "done" | "active" | "upcoming" }; isLast: boolean }) {
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
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 z-10 ${dotClass[step.status]}`}>
          {icon[step.status]}
        </div>
        {!isLast && <div className={`w-px flex-1 my-0.5 ${step.status === "done" ? "bg-teal-200" : "bg-gray-100"}`} style={{ minHeight: "20px" }} />}
      </div>
      <div className="pb-4">
        <span className={`text-sm leading-tight ${step.status === "active" ? "font-semibold text-teal-700" : step.status === "done" ? "text-gray-500" : "text-gray-400"}`}>
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
      <p className={`text-sm font-medium ${highlight ? "text-amber-600" : "text-gray-800"}`}>{value}</p>
    </div>
  );
}
