export const AUTH_CHANGED_EVENT = "auth-changed";

/** Whether the browser has a persisted SPF session (localStorage `cookie`). */
export function isClientLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const cookie = localStorage.getItem("cookie");
    return Boolean(cookie && cookie.trim());
  } catch {
    return false;
  }
}

/**
 * Clears persisted auth (localStorage) and notifies listeners (e.g. Navbar).
 * Safe to call from client-only code; no-ops when `window` is unavailable.
 */
export function clearClientSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("name");
    localStorage.removeItem("cookie");
  } finally {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

/**
 * If the response is 401 Unauthorized, clears the client session.
 * Use after authenticated API calls when the session may have expired.
 * @returns whether the response was 401 (session was cleared)
 */
export function handleUnauthorizedResponse(res: Response): boolean {
  if (res.status !== 401) return false;
  clearClientSession();
  return true;
}
