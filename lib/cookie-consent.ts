export type CookieConsentChoice = "all" | "necessary";
export const COOKIE_CONSENT_STORAGE_KEY = "demumumind-cookie-consent";
export const COOKIE_CONSENT_COOKIE_KEY = "demumumind_cookie_consent";
export const COOKIE_CONSENT_EVENT = "demumumind-cookie-consent-change";
export const COOKIE_CONSENT_OPEN_EVENT = "demumumind-cookie-consent-open";
export const COOKIE_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
export function parseCookieConsent(value: string | null | undefined): CookieConsentChoice | null {
    if (value === "all" || value === "necessary") {
        return value;
    }
    return null;
}
function readCookieValue(name: string): string | null {
    if (typeof document === "undefined") {
        return null;
    }
    const entry = document.cookie
        .split(";")
        .map((item) => item.trim())
        .find((item) => item.startsWith(`${name}=`));
    if (!entry) {
        return null;
    }
    return entry.slice(name.length + 1);
}
export function getCookieConsent(): CookieConsentChoice | null {
    if (typeof window === "undefined") {
        return null;
    }
    const localValue = parseCookieConsent(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
    if (localValue) {
        return localValue;
    }
    return parseCookieConsent(readCookieValue(COOKIE_CONSENT_COOKIE_KEY));
}
export function setCookieConsent(value: CookieConsentChoice) {
    if (typeof window === "undefined" || typeof document === "undefined") {
        return;
    }
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
    document.cookie = `${COOKIE_CONSENT_COOKIE_KEY}=${value}; path=/; max-age=${COOKIE_CONSENT_MAX_AGE_SECONDS}; samesite=lax`;
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: { value } }));
}
export function openCookieConsentSettings() {
    if (typeof window === "undefined") {
        return;
    }
    window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT));
}
