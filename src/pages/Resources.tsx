interface ResourcesProps {
  onNavigate: (page: string) => void;
}

const resources = [
  {
    id: "journey",
    title: "How the licence journey works",
    desc: "A clear, step-by-step walkthrough of the entire process from start to delivery.",
    time: "5 min read",
    tag: "Overview",
  },
  {
    id: "documents",
    title: "Documents you may need",
    desc: "Identity, address, and age proof — what's accepted, what's not, and how to prepare.",
    time: "3 min read",
    tag: "Checklist",
  },
  {
    id: "ll-guide",
    title: "Learner's Licence guide",
    desc: "Eligibility, application steps, theory test format, and what to expect at the RTO.",
    time: "6 min read",
    tag: "Guide",
  },
  {
    id: "dl-guide",
    title: "Driving Licence guide",
    desc: "What changes after your LL, the 30-day rule, and how the driving test works.",
    time: "6 min read",
    tag: "Guide",
  },
  {
    id: "road-signs",
    title: "Road signs",
    desc: "Mandatory, cautionary, and informatory signs — illustrated and explained simply.",
    time: "10 min read",
    tag: "Reference",
  },
  {
    id: "practice",
    title: "Practice test",
    desc: "30-question mock test modelled on the actual learner's licence question bank.",
    time: "Practice",
    tag: "Interactive",
  },
  {
    id: "rto-checklist",
    title: "RTO visit checklist",
    desc: "What to carry, what to wear, what to expect, and common mistakes to avoid.",
    time: "2 min read",
    tag: "Checklist",
  },
  {
    id: "driving-test-prep",
    title: "Driving test preparation",
    desc: "What the examiner looks for, the 8-point test route, and how to practise effectively.",
    time: "4 min read",
    tag: "Guide",
  },
  {
    id: "fees",
    title: "Fees and payments",
    desc: "State-wise fee tables, accepted payment modes, and what each fee covers.",
    time: "3 min read",
    tag: "Reference",
  },
  {
    id: "faq",
    title: "Common problems / FAQs",
    desc: "Rejected documents, delayed applications, payment failures — and how to fix them.",
    time: "5 min read",
    tag: "Help",
  },
];

const tagColors: Record<string, string> = {
  Overview: "bg-teal-50 text-teal-700",
  Checklist: "bg-amber-50 text-amber-700",
  Guide: "bg-blue-50 text-blue-700",
  Reference: "bg-purple-50 text-purple-700",
  Interactive: "bg-green-50 text-green-700",
  Help: "bg-red-50 text-red-700",
};

export default function Resources({ onNavigate }: ResourcesProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-5 pt-14 pb-24">
        <div className="mb-12">
          <p className="text-xs font-medium tracking-widest text-teal-600 uppercase mb-4">
            Learning Centre
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-3">Resources</h1>
          <p className="text-base text-gray-500 max-w-lg">
            Everything you need to know about getting your driving licence — in plain language,
            not government jargon.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((r) => (
            <button
              key={r.id}
              className="group text-left p-5 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-sm transition-all duration-200 bg-white"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span
                  className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${tagColors[r.tag] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {r.tag}
                </span>
                <span className="text-xs text-gray-400 shrink-0">{r.time}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1.5 group-hover:text-teal-700 transition-colors leading-snug">
                {r.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">{r.desc}</p>
            </button>
          ))}
        </div>

        <div className="mt-14 p-6 rounded-2xl bg-teal-600 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-base mb-1">Ready to apply?</h3>
              <p className="text-sm text-teal-100">
                Start your application — we'll guide you through every step.
              </p>
            </div>
            <button
              onClick={() => onNavigate("entry")}
              className="shrink-0 px-5 py-2.5 bg-white text-teal-700 text-sm font-medium rounded-lg hover:bg-teal-50 transition-colors"
            >
              Apply for a Licence →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
