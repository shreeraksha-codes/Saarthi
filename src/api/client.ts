export type ApplicationIntent = "first-ll" | "existing-ll";

export interface User { id: string; phone: string; name: string | null; email: string | null; }
export interface Application { id: string; userId: string; intent: ApplicationIntent; status: string; currentStep: string; state: string | null; rto: string | null; createdAt: string; updatedAt: string; }
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
