interface LandingProps {
  onNavigate: (page: string) => void;
  onStart: () => void;
}

const journeySteps = [
  { label: "Apply", desc: "Fill in details online" },
  { label: "Learner's Licence", desc: "Pass the theory test" },
  { label: "30-day wait", desc: "Practice on the road" },
  { label: "Driving Licence", desc: "Book your driving test" },
  { label: "Driving Test", desc: "Show your skills" },
  { label: "Licence delivered", desc: "Right to your door" },
];

export default function Landing({ onNavigate, onStart }: LandingProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-5 pt-10 pb-12 md:pt-12 md:pb-16">
        <div className="max-w-2xl">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-teal-700 uppercase mb-3">
            Driving Licence Services
          </h2>
          <span className="inline-block text-xs font-medium tracking-widest text-gray-400 uppercase mb-6">
            Independent Prototype · Not a Government Website
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-tight mb-6">
            Your driving licence journey,{" "}
            <span className="text-teal-600 italic">made simple.</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-xl">
            From your first learner's licence to your full driving licence — know what
            you need, what happens next, and where you are in the journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onStart}
              className="px-6 py-3.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 active:bg-teal-800 transition-colors text-base"
            >
              Start your application →
            </button>
            <button
              onClick={() => onNavigate("resources")}
              className="px-6 py-3.5 text-teal-700 font-medium rounded-xl border border-teal-200 hover:border-teal-300 hover:bg-teal-50 transition-colors text-base"
            >
              Explore Resources
            </button>
          </div>
        </div>
      </section>

      {/* Journey Steps */}
      <section className="border-t border-gray-100 bg-gray-50 py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-5">
          <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-10">
            The journey at a glance
          </p>
          <div className="relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-6 left-6 right-6 h-px bg-teal-100" />
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-0 relative">
              {journeySteps.map((step, i) => (
                <div key={i} className="flex flex-col items-start md:items-center md:px-2">
                  <div className="relative z-10 w-12 h-12 rounded-full bg-white border-2 border-teal-200 flex items-center justify-center mb-3 shadow-sm">
                    <span className="text-teal-600 font-medium text-sm">{i + 1}</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-800 md:text-center leading-tight mb-1">
                    {step.label}
                  </div>
                  <div className="text-xs text-gray-400 md:text-center leading-snug">
                    {step.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What this handles */}
      <section className="max-w-5xl mx-auto px-5 py-20 md:py-24">
        <div className="grid md:grid-cols-3 gap-8">
          <Feature
            number="01"
            title="Know what you need"
            body="Clear document checklists, fee breakdowns, and eligibility checks — before you even start."
          />
          <Feature
            number="02"
            title="Track where you are"
            body="One view shows exactly which step you're on and what to do next. No guesswork."
          />
          <Feature
            number="03"
            title="Prepare for every step"
            body="Practice tests, RTO checklists, and plain-language guides so you're never caught off guard."
          />
        </div>
      </section>

      {/* Trust / Disclaimer */}
      <section className="border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-5 py-10">
          <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
            <span className="font-medium text-gray-500">Independent prototype.</span>{" "}
            Government services shown here are simulated and are not connected to Parivahan,
            the Sarathi portal, or any government system. This is a hackathon project
            reimagining the citizen experience.
          </p>
        </div>
      </section>
    </div>
  );
}

function Feature({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div>
      <div className="text-xs font-medium text-gold-500 tracking-widest mb-3">{number}</div>
      <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
    </div>
  );
}
