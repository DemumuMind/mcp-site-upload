export type CookieConsentChoice = "all" | "necessary";

export type CookieConsentProfile = {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
};

function cookieConsentChoiceToProfile(choice: CookieConsentChoice): CookieConsentProfile {
  if (choice === "all") {
    return {
      necessary: true,
      preferences: true,
      analytics: true,
    };
  }

  return {
    necessary: true,
    preferences: false,
    analytics: false,
  };
}

function cookieConsentProfileToChoice(profile: CookieConsentProfile): CookieConsentChoice {
  if (profile.preferences && profile.analytics) {
    return "all";
  }

  return "necessary";
}

function parseCookieConsent(value: string | null | undefined): CookieConsentChoice | null {
  if (value === "all" || value === "necessary") {
    return value;
  }

  return null;
}

function parseCookieConsentProfile(value: string | null | undefined): CookieConsentProfile | null {
  if (!value) {
    return null;
  }

  const directChoice = parseCookieConsent(value);
  if (directChoice) {
    return cookieConsentChoiceToProfile(directChoice);
  }

  try {
    const parsed = JSON.parse(value) as Partial<CookieConsentProfile>;
    return {
      necessary: true,
      preferences: Boolean(parsed.preferences),
      analytics: Boolean(parsed.analytics),
    };
  } catch {
    return null;
  }
}

export type CookieConsentPayload = {
  choice?: string;
  profile?: Partial<CookieConsentProfile>;
};

function parseProfilePayload(value: unknown): CookieConsentProfile | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<CookieConsentProfile>;

  return {
    necessary: true,
    preferences: Boolean(candidate.preferences),
    analytics: Boolean(candidate.analytics),
  };
}

export function resolveConsentFromPayload(payload: CookieConsentPayload | null) {
  const payloadChoice = parseCookieConsent(payload?.choice);
  const payloadProfile = parseProfilePayload(payload?.profile);

  if (!payloadChoice && !payloadProfile) {
    return null;
  }

  const profile = payloadProfile ?? cookieConsentChoiceToProfile(payloadChoice!);
  const consent = payloadChoice ?? cookieConsentProfileToChoice(profile);

  return { consent, profile };
}

export async function executeCookieConsentPost(
  parseJsonBody: () => Promise<unknown>,
): Promise<{ status: number; body: Record<string, unknown> }> {
  let payload: CookieConsentPayload | null = null;
  try {
    payload = (await parseJsonBody()) as CookieConsentPayload;
  } catch {
    return {
      status: 400,
      body: {
        ok: false,
        message: "Invalid JSON payload",
      },
    };
  }

  const resolved = resolveConsentFromPayload(payload);
  if (!resolved) {
    return {
      status: 400,
      body: {
        ok: false,
        message: "Invalid consent payload",
      },
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      consent: resolved.consent,
      profile: resolved.profile,
    },
  };
}

export function executeCookieConsentGet(input: {
  consentCookieValue: string | undefined;
  profileCookieValue: string | undefined;
}) {
  const consent = parseCookieConsent(input.consentCookieValue);
  const profile =
    parseCookieConsentProfile(input.profileCookieValue) ??
    (consent ? cookieConsentChoiceToProfile(consent) : null);

  return {
    ok: true,
    consent,
    profile,
  };
}

export function executeCookieConsentDelete() {
  return {
    ok: true,
    consent: null as CookieConsentChoice | null,
    profile: null as CookieConsentProfile | null,
  };
}
