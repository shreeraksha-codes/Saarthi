import { useState } from "react";

interface HelpProps {
  onNavigate: (page: string) => void;
}

const problems = [
  {
    id: "waiting",
    label: "I've been waiting too long",
    answer:
      "Processing times vary by RTO — typically 3–7 working days for a Learner's Licence after your visit. If it's been more than 10 days, contact your RTO directly with your application reference (AP2024-00387). You can also check Parivahan's official portal for status updates.",
    action: "Check application status",
  },
  {
    id: "rejected-doc",
    label: "My document was rejected",
    answer:
      "Documents are usually rejected if they're blurry, cropped, or don't match the name on your application. Re-upload a clear, complete scan or photo. Make sure the document is in colour and all four corners are visible.",
    action: "Re-upload document",
  },
  {
    id: "payment",
    label: "My payment status looks wrong",
    answer:
      "Payment failures sometimes take 2–3 working days to resolve. If money was deducted but status shows 'pending', check your bank statement for a reversal. In most cases, the payment processes automatically. If not, contact your bank's support line.",
    action: "View payment record",
  },
  {
    id: "stuck",
    label: "I can't continue my application",
    answer:
      "This sometimes happens when a required field is missing or a document isn't verified yet. Check the Documents section for any items marked as 'action needed'. If everything looks correct, try refreshing the page or contact support.",
    action: "View application",
  },
  {
    id: "lost",
    label: "I don't know what to do next",
    answer:
      "Go to My Journey — it shows your current step and has a clear 'Continue' button to take you to exactly what you need to do. If the next step isn't clear, the Resources section has plain-language guides for every part of the process.",
    action: "Go to My Journey",
  },
];

export default function Help({ onNavigate }: HelpProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const problem = problems.find((p) => p.id === selected);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-5 pt-14 pb-24">
        <p className="text-xs font-medium tracking-widest text-teal-600 uppercase mb-6">Support</p>
        <h1 className="font-serif text-3xl md:text-4xl text-gray-900 mb-3">
          I'm stuck. Help me.
        </h1>
        <p className="text-base text-gray-500 mb-10">
          Tell us what's going on — we'll tell you what to do next.
        </p>

        <div className="flex flex-col gap-2">
          {problems.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(selected === p.id ? null : p.id)}
              className={`flex items-center justify-between gap-4 px-5 py-4 rounded-xl border text-left transition-all ${
                selected === p.id
                  ? "border-teal-300 bg-teal-50"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <span className={`text-sm font-medium ${selected === p.id ? "text-teal-800" : "text-gray-800"}`}>
                {p.label}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className={`shrink-0 transition-transform ${selected === p.id ? "rotate-90 text-teal-600" : "text-gray-300"}`}
              >
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>

        {problem && (
          <div className="mt-5 p-5 rounded-2xl bg-teal-600 text-white">
            <p className="text-sm leading-relaxed mb-4 text-teal-50">{problem.answer}</p>
            <button
              onClick={() => onNavigate("dashboard")}
              className="px-4 py-2 bg-white text-teal-700 text-sm font-medium rounded-lg hover:bg-teal-50 transition-colors"
            >
              {problem.action} →
            </button>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-xs text-gray-400 leading-relaxed">
            This is a prototype — there's no real support team behind it. In the real Sarathi
            service, you'd be able to call your RTO or raise a grievance on the Parivahan portal.
          </p>
        </div>
      </div>
    </div>
  );
}
