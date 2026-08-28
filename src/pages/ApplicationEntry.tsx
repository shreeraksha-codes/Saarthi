import { useState } from "react";
import { type Application, type ApplicationIntent, createApplication } from "../api/client";

interface ApplicationEntryProps {
  onNavigate: (page: string, data?: unknown) => void;
  loggedIn?: boolean;
  application?: Application | null;
  onApplication?: (application: Application) => void;
}

const options = [
  {
    id: "first-ll" as ApplicationIntent,
    title: "My first Learner's Licence",
    desc: "I've never had a driving licence before. I want to get started.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    id: "existing-ll" as ApplicationIntent,
    title: "I already have a Learner's Licence",
    desc: "My Learner's Licence is valid and I'm ready to apply for my full Driving Licence.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="3" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
];

export default function ApplicationEntry({ onNavigate, loggedIn, application, onApplication }: ApplicationEntryProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const choose = async (intent: ApplicationIntent) => {
    if (loggedIn) {
      if (application?.intent === intent) {
        onNavigate("dashboard");
        return;
      }
      setBusy(true); setError(null);
      try {
        const result = await createApplication(intent);
        onApplication?.(result.application);
        onNavigate("dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "We couldn't start your application.");
      } finally { setBusy(false); }
      return;
    }
    onNavigate("signin", { intent });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-5 pt-16 pb-24">
        <p className="text-xs font-medium tracking-widest text-teal-600 uppercase mb-8">
          Step 1 of 2
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-3">
          What are you applying for?
        </h1>
        <p className="text-base text-gray-500 mb-10">
          Pick the option that best describes your situation.
        </p>
        {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="flex flex-col gap-3">
          {options.map((opt) => (
            <button
              key={opt.id}
              disabled={busy}
              onClick={() => void choose(opt.id)}
              className="group flex items-start gap-4 p-5 rounded-2xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50/40 text-left transition-all duration-200 disabled:opacity-50"
            >
              <div className="shrink-0 w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 mb-0.5 group-hover:text-teal-700 transition-colors">
                  {opt.title}
                </div>
                <div className="text-sm text-gray-500 leading-snug">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-xs text-gray-400 text-center">
            {loggedIn ? "We'll open your saved journey or create this application using your current session." : "You'll be asked to sign in or create an account in the next step."}
          </p>
          <button
            onClick={() => onNavigate("resources")}
            className="text-sm text-teal-600 hover:text-teal-800 font-medium transition-colors"
          >
            Not sure where to start? → Explore Resources
          </button>
        </div>
      </div>
    </div>
  );
}
