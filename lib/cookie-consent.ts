export type CookieConsentChoice = "all" | "necessary";

export type CookieConsentProfile = {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
};

export const COOKIE_CONSENT_STORAGE_KEY = "demumumind-cookie-consent";
export const COOKIE_CONSENT_PROFILE_STORAGE_KEY = "demumumind-cookie-consent-profile";

export const COOKIE_CONSENT_COOKIE_KEY = "demumumind_cookie_consent";
export const COOKIE_CONSENT_PROFILE_COOKIE_KEY = "demumumind_cookie_consent_profile";

export const COOKIE_CONSENT_EVENT = "demumumind-cookie-consent-change";
export const COOKIE_CONSENT_OPEN_EVENT = "demumumind-cookie-consent-open";

export const COOKIE_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const DEFAULT_COOKIE_CONSENT_PROFILE: CookieConsentProfile = Object.freeze({
  necessary: true,
  preferences: false,
  analytics: false,
});

const COOKIE_CONSENT_SYNC_ENDPOINT = process.env.NEXT_PUBLIC_COOKIE_CONSENT_ENDPOINT?.trim() || "/api/cookie-consent";

type CookieConsentEventDetail = {
  value: CookieConsentChoice | null;
  profile: CookieConsentProfile | null;
};

function normalizeCookieConsentProfile(input?: Partial<CookieConsentProfile> | null): CookieConsentProfile {
  return {
    necessary: true,
    preferences: Boolean(input?.preferences),
    analytics: Boolean(input?.analytics),
  };
}

export function cookieConsentChoiceToProfile(choice: CookieConsentChoice): CookieConsentProfile {
  if (choice === "all") {
    return {
      necessary: true,
      preferences: true,
      analytics: true,
    };
  }

  return {
    ...DEFAULT_COOKIE_CONSENT_PROFILE,
  };
}

export function cookieConsentProfileToChoice(profile: CookieConsentProfile): CookieConsentChoice {
  if (profile.preferences && profile.analytics) {
    return "all";
  }

  return "necessary";
}

export function parseCookieConsent(value: string | null | undefined): CookieConsentChoice | null {
  if (value === "all" || value === "necessary") {
    return value;
  }

  return null;
}

export function parseCookieConsentProfile(value: string | null | undefined): CookieConsentProfile | null {
  if (!value) {
    return null;
  }

  const directChoice = parseCookieConsent(value);
  if (directChoice) {
    return cookieConsentChoiceToProfile(directChoice);
  }

  try {
    const parsed = JSON.parse(value) as Partial<CookieConsentProfile>;
    return normalizeCookieConsentProfile(parsed);
  } catch {
    return null;
  }
}

function buildCookieWriteSuffix(maxAgeSeconds: number): string {
  if (typeof window === "undefined") {
    return `; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
  }

  const securePart = window.location.protocol === "https:" ? "; secure" : "";
  return `; path=/; max-age=${maxAgeSeconds}; samesite=lax${securePart}`;
}

function persistCookieValue(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}${buildCookieWriteSuffix(maxAgeSeconds)}`;
}

function clearCookieValue(name: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=;${buildCookieWriteSuffix(0)}`;
}

async function syncCookieConsentToEndpoint(value: CookieConsentChoice | null, profile: CookieConsentProfile | null) {
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
      body: value === null ? undefined : JSON.stringify({ choice: value, profile }),
    };

    await fetch(endpoint, requestInit);
  } catch {
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
  } catch {
    return entry.slice(name.length + 1);
  }
}

function dispatchCookieConsentEvent(detail: CookieConsentEventDetail) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent<CookieConsentEventDetail>(COOKIE_CONSENT_EVENT, { detail }));
}

export function getCookieConsentProfile(): CookieConsentProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const localProfile = parseCookieConsentProfile(window.localStorage.getItem(COOKIE_CONSENT_PROFILE_STORAGE_KEY));
  if (localProfile) {
    return localProfile;
  }

  const cookieProfile = parseCookieConsentProfile(readCookieValue(COOKIE_CONSENT_PROFILE_COOKIE_KEY));
  if (cookieProfile) {
    return cookieProfile;
  }

  const localChoice = parseCookieConsent(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
  if (localChoice) {
    return cookieConsentChoiceToProfile(localChoice);
  }

  const cookieChoice = parseCookieConsent(readCookieValue(COOKIE_CONSENT_COOKIE_KEY));
  if (cookieChoice) {
    return cookieConsentChoiceToProfile(cookieChoice);
  }

  return null;
}

export function getCookieConsent(): CookieConsentChoice | null {
  const profile = getCookieConsentProfile();
  if (profile) {
    return cookieConsentProfileToChoice(profile);
  }

  return null;
}

export function setCookieConsentProfile(input: Partial<CookieConsentProfile>) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const profile = normalizeCookieConsentProfile(input);
  const choice = cookieConsentProfileToChoice(profile);

  window.localStorage.setItem(COOKIE_CONSENT_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, choice);

  persistCookieValue(COOKIE_CONSENT_PROFILE_COOKIE_KEY, JSON.stringify(profile), COOKIE_CONSENT_MAX_AGE_SECONDS);
  persistCookieValue(COOKIE_CONSENT_COOKIE_KEY, choice, COOKIE_CONSENT_MAX_AGE_SECONDS);

  dispatchCookieConsentEvent({ value: choice, profile });
  void syncCookieConsentToEndpoint(choice, profile);
}

export function setCookieConsent(value: CookieConsentChoice) {
  setCookieConsentProfile(cookieConsentChoiceToProfile(value));
}

export function clearCookieConsent() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  window.localStorage.removeItem(COOKIE_CONSENT_PROFILE_STORAGE_KEY);
  window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);

  clearCookieValue(COOKIE_CONSENT_PROFILE_COOKIE_KEY);
  clearCookieValue(COOKIE_CONSENT_COOKIE_KEY);

  dispatchCookieConsentEvent({ value: null, profile: null });
  void syncCookieConsentToEndpoint(null, null);
}

export function openCookieConsentSettings() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT));
}
