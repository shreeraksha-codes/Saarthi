interface ApplicationEntryProps {
  onNavigate: (page: string, data?: unknown) => void;
}

const options = [
  {
    id: "first-ll",
    title: "My first Learner's Licence",
    desc: "I've never had a driving licence before. I want to get started.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    id: "existing-ll",
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

export default function ApplicationEntry({ onNavigate }: ApplicationEntryProps) {
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

        <div className="flex flex-col gap-3">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onNavigate("signin", { intent: opt.id })}
              className="group flex items-start gap-4 p-5 rounded-2xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50/40 text-left transition-all duration-200"
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
              <div className="shrink-0 self-center text-gray-300 group-hover:text-teal-400 transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-xs text-gray-400 text-center">
            You'll be asked to sign in or create an account in the next step.
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
