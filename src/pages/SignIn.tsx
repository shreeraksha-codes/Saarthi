import { useState } from "react";

interface SignInProps {
  onNavigate: (page: string, data?: unknown) => void;
  navData?: unknown;
}

export default function SignIn({ onNavigate, navData }: SignInProps) {
  const [mode, setMode] = useState<"signin" | "create">("signin");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate("dashboard", navData);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-serif text-2xl text-teal-600">Sarathi</span>
          <p className="text-sm text-gray-500 mt-2">
            {mode === "signin"
              ? "Sign in to continue your journey"
              : "Create an account to get started"}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex p-1 bg-gray-100 rounded-xl mb-7">
          <button
            onClick={() => setMode("signin")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === "signin"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode("create")}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              mode === "create"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "create" && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Priya Mehta"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition placeholder-gray-300"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Mobile number</label>
            <div className="flex">
              <span className="flex items-center px-3.5 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-sm text-gray-500">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="98765 43210"
                className="flex-1 px-4 py-3 rounded-r-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition placeholder-gray-300"
              />
            </div>
          </div>

          {mode === "create" && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Date of birth</label>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-gray-700"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 active:bg-teal-800 transition-colors text-sm mt-1"
          >
            {mode === "signin" ? "Send OTP →" : "Create account →"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
          By continuing, you agree to our Terms of Service.
          <br />
          This is a simulated prototype — no real data is collected.
        </p>
      </div>
    </div>
  );
}
