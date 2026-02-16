"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Cookie, RotateCcw, ShieldCheck } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  COOKIE_CONSENT_EVENT,
  DEFAULT_COOKIE_CONSENT_PROFILE,
  clearCookieConsent,
  cookieConsentProfileToChoice,
  getCookieConsentProfile,
  setCookieConsent,
  setCookieConsentProfile,
  type CookieConsentChoice,
  type CookieConsentProfile,
} from "@/lib/cookie-consent";
import { tr } from "@/lib/i18n";

function profilesEqual(a: CookieConsentProfile | null, b: CookieConsentProfile | null): boolean {
  if (!a && !b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  return a.preferences === b.preferences && a.analytics === b.analytics;
}

export function CookieSettingsPage() {
  const locale = useLocale();

  const [savedProfile, setSavedProfile] = useState<CookieConsentProfile | null>(() => getCookieConsentProfile());
  const [draftProfile, setDraftProfile] = useState<CookieConsentProfile>(() => getCookieConsentProfile() ?? { ...DEFAULT_COOKIE_CONSENT_PROFILE });

  useEffect(() => {
    function syncConsent(event: Event) {
      const customEvent = event as CustomEvent<{
        value?: CookieConsentChoice | null;
        profile?: CookieConsentProfile | null;
      }>;

      if (customEvent.detail?.profile) {
        setSavedProfile(customEvent.detail.profile);
        setDraftProfile(customEvent.detail.profile);
        return;
      }

      if (customEvent.detail?.value === null) {
        setSavedProfile(null);
        setDraftProfile({ ...DEFAULT_COOKIE_CONSENT_PROFILE });
        return;
      }

      const profile = getCookieConsentProfile();
      setSavedProfile(profile);
      setDraftProfile(profile ?? { ...DEFAULT_COOKIE_CONSENT_PROFILE });
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, syncConsent as EventListener);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, syncConsent as EventListener);
    };
  }, []);

  const savedChoice = savedProfile ? cookieConsentProfileToChoice(savedProfile) : null;
  const defaultChoice = cookieConsentProfileToChoice(DEFAULT_COOKIE_CONSENT_PROFILE);

  const consentLabel =
    savedChoice === "all"
      ? tr(locale, "All optional cookies are enabled", "All optional cookies are enabled")
      : savedChoice === "necessary"
        ? tr(locale, "Necessary cookies only", "Necessary cookies only")
        : tr(locale, "No preference saved yet", "No preference saved yet");

  const hasUnsavedChanges = useMemo(() => {
    const baseline = savedProfile ?? DEFAULT_COOKIE_CONSENT_PROFILE;
    return !profilesEqual(draftProfile, baseline);
  }, [draftProfile, savedProfile]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-primary/30 bg-card p-5">
        <Badge className="mb-3 border-primary/35 bg-primary/10 text-primary">
          <Cookie className="size-3" />
          {tr(locale, "Current consent status", "Current consent status")}
        </Badge>
        <p className="text-sm leading-7 text-foreground">{consentLabel}</p>
        <p className="mt-1 text-xs leading-6 text-muted-foreground">
          {tr(
            locale,
            `Default policy: ${defaultChoice === "necessary" ? "Necessary cookies only" : "All cookies"}`,
            `Default policy: ${defaultChoice === "necessary" ? "Necessary cookies only" : "All cookies"}`,
          )}
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-blacksmith bg-card px-4 py-3">
          <p className="font-medium text-foreground">{tr(locale, "Strictly necessary", "Strictly necessary")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {tr(locale, "Required for core navigation, authentication, and platform security.", "Required for core navigation, authentication, and platform security.")}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary">{tr(locale, "Always enabled", "Always enabled")}</p>
        </div>

        <div className="rounded-xl border border-blacksmith bg-card px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-foreground">{tr(locale, "Preferences and UX", "Preferences and UX")}</p>
            <button
              type="button"
              onClick={() => {
                setDraftProfile((prev) => ({ ...prev, preferences: !prev.preferences }));
              }}
              className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/20"
            >
              {draftProfile.preferences ? tr(locale, "Enabled", "Enabled") : tr(locale, "Disabled", "Disabled")}
            </button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {tr(locale, "Stores optional interface preferences (for example personalized UI choices).", "Stores optional interface preferences (for example personalized UI choices).")}
          </p>
        </div>

        <div className="rounded-xl border border-blacksmith bg-card px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-foreground">{tr(locale, "Analytics (optional)", "Analytics (optional)")}</p>
            <button
              type="button"
              onClick={() => {
                setDraftProfile((prev) => ({ ...prev, analytics: !prev.analytics }));
              }}
              className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/20"
            >
              {draftProfile.analytics ? tr(locale, "Enabled", "Enabled") : tr(locale, "Disabled", "Disabled")}
            </button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {tr(locale, "Used only to measure product usage and performance trends.", "Used only to measure product usage and performance trends.")}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          className="h-11 bg-primary hover:bg-cyan-400"
          onClick={() => {
            setCookieConsentProfile(draftProfile);
            setSavedProfile(draftProfile);
          }}
          disabled={!hasUnsavedChanges}
        >
          <CheckCircle2 className="size-4" />
          {tr(locale, "Save selected cookies", "Save selected cookies")}
        </Button>

        <Button
          type="button"
          className="h-11 bg-blue-500 hover:bg-blue-400"
          onClick={() => {
            const nextProfile: CookieConsentProfile = {
              necessary: true,
              preferences: true,
              analytics: true,
            };
            setCookieConsent("all");
            setSavedProfile(nextProfile);
            setDraftProfile(nextProfile);
          }}
        >
          <ShieldCheck className="size-4" />
          {tr(locale, "Accept all cookies", "Accept all cookies")}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-11 border-blacksmith bg-card text-foreground hover:bg-accent sm:col-span-2"
          onClick={() => {
            const nextProfile = { ...DEFAULT_COOKIE_CONSENT_PROFILE };
            setCookieConsent("necessary");
            setSavedProfile(nextProfile);
            setDraftProfile(nextProfile);
          }}
        >
          <ShieldCheck className="size-4" />
          {tr(locale, "Use necessary only", "Use necessary only")}
        </Button>
      </div>

      <Button
        type="button"
        variant="ghost"
        className="h-10 text-muted-foreground hover:bg-card hover:text-foreground"
        onClick={() => {
          clearCookieConsent();
          setSavedProfile(null);
          setDraftProfile({ ...DEFAULT_COOKIE_CONSENT_PROFILE });
        }}
      >
        <RotateCcw className="size-4" />
        {tr(locale, "Reset cookie preference", "Reset cookie preference")}
      </Button>
    </div>
  );
}

