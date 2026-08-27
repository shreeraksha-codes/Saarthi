import { useState } from "react";
import { type Application, type ApplicationIntent, type User, startAuth, verifyOtp } from "../api/client";

interface SignInProps { onNavigate: (page: string, data?: unknown) => void; onAuthenticated: (user: User, application: Application | null) => void; navData?: unknown; }

function getIntent(data: unknown): ApplicationIntent | undefined {
  if (typeof data === "object" && data !== null && "intent" in data) {
    const intent = (data as { intent?: string }).intent;
    return intent === "first-ll" || intent === "existing-ll" ? intent : undefined;
  }
  return undefined;
}

export default function SignIn({ onNavigate, onAuthenticated, navData }: SignInProps) {
  const [mode, setMode] = useState<"signin" | "create">("signin");
  const [phone, setPhone] = useState(""); const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [otp, setOtp] = useState("");
  const [stage, setStage] = useState<"mobile" | "otp">("mobile"); const [loading, setLoading] = useState(false); const [error, setError] = useState<string | null>(null);
  const intent = getIntent(navData);
  const handleStart = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError(null);
    try { await startAuth({ phone, intent, name: mode === "create" ? name : undefined, email: mode === "create" ? email : undefined }); setStage("otp"); }
    catch (error) { setError(error instanceof Error ? error.message : "We couldn't connect right now."); } finally { setLoading(false); }
  };
  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError(null);
    try { const result = await verifyOtp(otp); onAuthenticated(result.user, result.application); }
    catch (error) { setError(error instanceof Error ? error.message : "We couldn't connect right now."); } finally { setLoading(false); }
  };
  return <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5 py-16"><div className="w-full max-w-sm">
    <div className="text-center mb-8"><span className="font-serif text-2xl text-teal-600">Sarathi</span><p className="text-sm text-gray-500 mt-2">{stage === "otp" ? "Confirm your mobile number" : mode === "signin" ? "Sign in to continue your journey" : "Create an account to get started"}</p></div>
    {stage === "mobile" ? <>
      <div className="flex p-1 bg-gray-100 rounded-xl mb-7"><button type="button" onClick={() => setMode("signin")} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "signin" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Sign in</button><button type="button" onClick={() => setMode("create")} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === "create" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Create account</button></div>
      <form onSubmit={handleStart} className="flex flex-col gap-4">{mode === "create" && <><Input label="Full name" value={name} onChange={setName} placeholder="Priya Mehta" required /><Input label="Email address (optional)" value={email} onChange={setEmail} placeholder="priya@example.com" type="email" /></>}<div><label htmlFor="mobile-number" className="block text-xs font-medium text-gray-700 mb-1.5">Mobile number</label><div className="flex"><span className="flex items-center px-3.5 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-sm text-gray-500">+91</span><input id="mobile-number" required inputMode="numeric" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98765 43210" className="flex-1 px-4 py-3 rounded-r-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition placeholder-gray-300" /></div></div>{error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<button type="submit" disabled={loading} className="w-full py-3.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 active:bg-teal-800 transition-colors text-sm mt-1 disabled:opacity-50">{loading ? "Please wait…" : "Send OTP →"}</button></form>
    </> : <form onSubmit={handleVerify} className="flex flex-col gap-4"><div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Demo authentication — no real SMS is sent. Use <strong>123456</strong> to continue.</div><div><label htmlFor="demo-otp" className="block text-xs font-medium text-gray-700 mb-1.5">6-digit demo OTP</label><input id="demo-otp" required inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="123456" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition placeholder-gray-300" /></div>{error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<button type="submit" disabled={loading || otp.length !== 6} className="w-full py-3.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 active:bg-teal-800 transition-colors text-sm disabled:opacity-50">{loading ? "Verifying…" : "Verify and continue →"}</button><button type="button" onClick={() => { setStage("mobile"); setError(null); }} className="text-sm text-teal-700 hover:text-teal-800">Use a different number</button></form>}
    <button type="button" onClick={() => onNavigate(intent ? "entry" : "landing")} className="mt-6 w-full text-center text-sm text-gray-500 hover:text-gray-800">← Go back</button><p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">This is a simulated prototype — no real data is collected.</p>
  </div></div>;
}

function Input({ label, value, onChange, placeholder, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string; required?: boolean }) { const id = label.toLowerCase().replace(/[^a-z]+/g, "-"); return <div><label htmlFor={id} className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label><input id={id} type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition placeholder-gray-300" /></div>; }
