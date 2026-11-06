export const COOKIE_CONSENT_KEY = "vn-cookie-consent";
export const COOKIE_CONSENT_EVENT = "vn:cookie-consent";
export const COOKIE_CONSENT_OPEN_EVENT = "vn:cookie-consent-open";

export type CookieConsent = "all" | "essential";

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    if (value === "all" || value === "essential") return value;
  } catch {
    // Ignore storage access errors (private mode, blocked storage).
  }
  return null;
}

export function writeCookieConsent(value: CookieConsent) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {
    // Ignore storage write errors.
  }
  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_EVENT, { detail: { value } }),
  );
}

export function openCookiePreferences() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT));
}
