export type ApplicationIntent = "first-ll" | "existing-ll";

export interface User { id: string; phone: string; name: string | null; email: string | null; }
export interface DocumentState { type: "identity" | "address" | "photo-signature"; status: "needed" | "ready" | "rejected" | "replaced"; updatedAt: string; }
export interface Payment { id: string; reference: string; method: string; amount: number; status: "pending" | "successful" | "failed"; createdAt: string; updatedAt: string; }
export interface LearnerTest { score: number; total: number; passed: boolean; createdAt: string; }
export interface LearnerLicence { reference: string; issuedAt: string; validUntil: string; eligibleForDlAt: string; }
export interface Appointment { id: string; slot: string; status: "booked" | "cancelled"; createdAt: string; updatedAt: string; }
export interface DrivingTest { score: number; total: number; passed: boolean; createdAt: string; }
export interface DrivingLicence { reference: string; issuedAt: string; deliveryStatus: "issued" | "printed" | "dispatched" | "delivered"; updatedAt: string; }
export interface DlJourney { data: Record<string, string>; status: string; updatedAt: string; payment: Payment | null; appointment: Appointment | null; drivingTest: DrivingTest | null; licence: DrivingLicence | null; }
export interface Application { id: string; userId: string; intent: ApplicationIntent; status: string; currentStep: string; state: string | null; rto: string | null; createdAt: string; updatedAt: string; details: Record<string, string | boolean>; documents: DocumentState[]; payment: Payment | null; test: LearnerTest | null; licence: LearnerLicence | null; dl: DlJourney | null; }
export interface JourneyEvent { id: string; eventType: string; label: string; createdAt: string; }

export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(path, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...options?.headers } });
    if (!response.ok) { const body = await response.json().catch(() => ({})); throw new ApiError(body.error || "We couldn't connect right now.", response.status); }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  } catch (error) { if (error instanceof ApiError) throw error; throw new ApiError("We couldn't connect right now. Please try again.", 0); }
}

export function startAuth(input: { phone: string; intent?: ApplicationIntent; name?: string; email?: string }) { return request<{ message: string; expiresInSeconds: number }>("/api/auth/start", { method: "POST", body: JSON.stringify(input) }); }
export function verifyOtp(otp: string) { return request<{ user: User; application: Application | null }>("/api/auth/verify", { method: "POST", body: JSON.stringify({ otp }) }); }
export function logout() { return request<void>("/api/auth/logout", { method: "POST" }); }
export function getCurrentUser() { return request<{ user: User }>("/api/me"); }
export function getCurrentApplication() { return request<{ application: Application }>("/api/applications/current"); }
export function createApplication(intent: ApplicationIntent) { return request<{ application: Application }>("/api/applications", { method: "POST", body: JSON.stringify({ intent }) }); }
export function updateApplication(id: string, updates: Partial<Pick<Application, "status" | "currentStep" | "state" | "rto">>) { return request<{ application: Application }>(`/api/applications/${id}`, { method: "PATCH", body: JSON.stringify(updates) }); }
export function getJourney(id: string) { return request<{ events: JourneyEvent[] }>(`/api/applications/${id}/journey`); }
export function getApplication(id: string) { return request<{ application: Application }>(`/api/applications/${id}/full`); }
export function saveApplicationDetails(id: string, details: Record<string, string | boolean>) { return request<{ application: Application }>(`/api/applications/${id}/details`, { method: "PATCH", body: JSON.stringify(details) }); }
export function updateDocument(id: string, type: DocumentState["type"], status: DocumentState["status"]) { return request<{ application: Application }>(`/api/applications/${id}/documents/${type}`, { method: "PUT", body: JSON.stringify({ status }) }); }
export function createPayment(id: string, method: string, outcome: "successful" | "failed") { return request<{ payment: Payment; application: Application }>(`/api/applications/${id}/payment`, { method: "POST", body: JSON.stringify({ method, outcome }) }); }
export function submitApplication(id: string) { return request<{ application: Application }>(`/api/applications/${id}/submit`, { method: "POST" }); }
export function submitLearnerTest(id: string, answers: number[]) { return request<{ application: Application }>(`/api/applications/${id}/learner-test`, { method: "POST", body: JSON.stringify({ answers }) }); }
export function issueLearnerLicence(id: string) { return request<{ application: Application }>(`/api/applications/${id}/issue-learner-licence`, { method: "POST" }); }
export function fastForwardWait(id: string) { return request<{ application: Application }>(`/api/applications/${id}/demo/fast-forward-wait`, { method: "POST" }); }
export function startDl(id: string) { return request<{ application: Application }>(`/api/applications/${id}/dl`, { method: "POST" }); }
export function saveDl(id: string, data: Record<string, string>) { return request<{ application: Application }>(`/api/applications/${id}/dl`, { method: "PATCH", body: JSON.stringify(data) }); }
export function createDlPayment(id: string, method: string, outcome: "successful" | "failed") { return request<{ payment: Payment; application: Application }>(`/api/applications/${id}/dl/payment`, { method: "POST", body: JSON.stringify({ method, outcome }) }); }
export function getAppointmentSlots() { return request<{ slots: string[] }>("/api/appointments/availability"); }
export function bookAppointment(applicationId: string, slot: string) { return request<{ application: Application }>("/api/appointments", { method: "POST", body: JSON.stringify({ applicationId, slot }) }); }
export function cancelAppointment(id: string) { return request<{ application: Application }>(`/api/appointments/${id}`, { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) }); }
export function startDrivingTest(applicationId: string) { return request<{ application: Application }>("/api/tests/driving/start", { method: "POST", body: JSON.stringify({ applicationId }) }); }
export function submitDrivingTest(applicationId: string, checks: boolean[], outcome?: "passed" | "failed") { return request<{ application: Application }>("/api/tests/driving/submit", { method: "POST", body: JSON.stringify({ applicationId, checks, outcome }) }); }
export function issueDrivingLicence(id: string) { return request<{ application: Application }>(`/api/applications/${id}/dl/issue`, { method: "POST" }); }
export function advanceDelivery(id: string) { return request<{ application: Application }>(`/api/applications/${id}/delivery/advance`, { method: "POST" }); }
export function guidedApplicationMessage(applicationId: string, field: string, message: string, confirm = false, extractedValue?: string) { return request<{ assistantMessage: string; extractedField: string | null; extractedValue: string | null; requiresConfirmation: boolean; needsClarification: boolean; mode: "llm" | "fallback" | "confirmed"; saved: boolean; application: Application }>("/api/ai/application-message", { method: "POST", body: JSON.stringify({ applicationId, field, message, confirm, extractedValue }) }); }
