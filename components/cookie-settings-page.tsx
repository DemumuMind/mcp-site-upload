"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Cookie, RotateCcw, ShieldCheck } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  COOKIE_CONSENT_EVENT,
  clearCookieConsent,
  getCookieConsent,
  setCookieConsent,
  type CookieConsentChoice,
} from "@/lib/cookie-consent";
import { tr } from "@/lib/i18n";

export function CookieSettingsPage() {
  const locale = useLocale();
  const [consent, setConsent] = useState<CookieConsentChoice | null>(() => getCookieConsent());

  useEffect(() => {
    function syncConsent(event: Event) {
      const customEvent = event as CustomEvent<{ value?: CookieConsentChoice | null }>;
      if (customEvent.detail?.value === "all" || customEvent.detail?.value === "necessary" || customEvent.detail?.value === null) {
        setConsent(customEvent.detail.value);
        return;
      }

      setConsent(getCookieConsent());
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, syncConsent as EventListener);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, syncConsent as EventListener);
    };
  }, []);

  const consentLabel =
    consent === "all"
      ? tr(locale, "All cookies accepted", "All cookies accepted")
      : consent === "necessary"
        ? tr(locale, "Necessary cookies only", "Necessary cookies only")
        : tr(locale, "No preference saved yet", "No preference saved yet");

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-cyan-400/20 bg-indigo-950/72 p-5">
        <Badge className="mb-3 border-cyan-400/35 bg-cyan-500/10 text-cyan-200">
          <Cookie className="size-3" />
          {tr(locale, "Current consent status", "Current consent status")}
        </Badge>
        <p className="text-sm leading-7 text-violet-100">{consentLabel}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          className="h-11 bg-blue-500 hover:bg-blue-400"
          onClick={() => {
            setCookieConsent("all");
            setConsent("all");
          }}
        >
          <CheckCircle2 className="size-4" />
          {tr(locale, "Accept all cookies", "Accept all cookies")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 border-white/20 bg-indigo-900/70 text-violet-50 hover:bg-indigo-900"
          onClick={() => {
            setCookieConsent("necessary");
            setConsent("necessary");
          }}
        >
          <ShieldCheck className="size-4" />
          {tr(locale, "Use necessary only", "Use necessary only")}
        </Button>
      </div>

      <Button
        type="button"
        variant="ghost"
        className="h-10 text-violet-200 hover:bg-white/8 hover:text-white"
        onClick={() => {
          clearCookieConsent();
          setConsent(null);
        }}
      >
        <RotateCcw className="size-4" />
        {tr(locale, "Reset cookie preference", "Reset cookie preference")}
      </Button>
    </div>
  );
}
