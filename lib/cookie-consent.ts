export type CookieConsentChoice = "all" | "necessary";
export const COOKIE_CONSENT_STORAGE_KEY = "demumumind-cookie-consent";
export const COOKIE_CONSENT_COOKIE_KEY = "demumumind_cookie_consent";
export const COOKIE_CONSENT_EVENT = "demumumind-cookie-consent-change";
export const COOKIE_CONSENT_OPEN_EVENT = "demumumind-cookie-consent-open";
export const COOKIE_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const COOKIE_CONSENT_SYNC_ENDPOINT = process.env.NEXT_PUBLIC_COOKIE_CONSENT_ENDPOINT?.trim() || "/api/cookie-consent";
export function parseCookieConsent(value: string | null | undefined): CookieConsentChoice | null {
    if (value === "all" || value === "necessary") {
        return value;
    }
    return null;
}
function buildCookieWriteSuffix(maxAgeSeconds: number): string {
    if (typeof window === "undefined") {
        return `; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
    }
    const securePart = window.location.protocol === "https:" ? "; secure" : "";
    return `; path=/; max-age=${maxAgeSeconds}; samesite=lax${securePart}`;
}
function persistCookieConsentLocally(value: CookieConsentChoice) {
    if (typeof document === "undefined") {
        return;
    }
    document.cookie = `${COOKIE_CONSENT_COOKIE_KEY}=${encodeURIComponent(value)}${buildCookieWriteSuffix(COOKIE_CONSENT_MAX_AGE_SECONDS)}`;
}
function clearCookieConsentLocally() {
    if (typeof document === "undefined") {
        return;
    }
    document.cookie = `${COOKIE_CONSENT_COOKIE_KEY}=;${buildCookieWriteSuffix(0)}`;
}
async function syncCookieConsentToEndpoint(value: CookieConsentChoice | null) {
    if (typeof window === "undefined") {
        return;
    }
    const endpoint = COOKIE_CONSENT_SYNC_ENDPOINT;
    if (!endpoint) {
        return;
    }
    try {
        const requestInit: RequestInit = {
            method: value === null ? "DELETE" : "POST",
            credentials: "include",
            keepalive: true,
            cache: "no-store",
            headers: value === null ? undefined : { "content-type": "application/json" },
            body: value === null ? undefined : JSON.stringify({ choice: value }),
        };
        await fetch(endpoint, requestInit);
    }
    catch {
        // Cookie sync endpoint is best-effort only.
    }
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
    try {
        return decodeURIComponent(entry.slice(name.length + 1));
    }
    catch {
        return entry.slice(name.length + 1);
    }
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
    persistCookieConsentLocally(value);
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: { value } }));
    void syncCookieConsentToEndpoint(value);
}
export function clearCookieConsent() {
    if (typeof window === "undefined" || typeof document === "undefined") {
        return;
    }
    window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    clearCookieConsentLocally();
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: { value: null } }));
    void syncCookieConsentToEndpoint(null);
}
export function openCookieConsentSettings() {
    if (typeof window === "undefined") {
        return;
    }
    window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT));
}
