"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Cookie, X } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import {
  COOKIE_CONSENT_EVENT,
  COOKIE_CONSENT_OPEN_EVENT,
  cookieConsentProfileToChoice,
  setCookieConsent,
  type CookieConsentChoice,
  type CookieConsentProfile,
} from "@/lib/cookie-consent";
import { tr } from "@/lib/i18n";

type CookieConsentBannerProps = {
  initialConsent: CookieConsentChoice | null;
  initialProfile: CookieConsentProfile | null;
};

export function CookieConsentBanner({ initialConsent, initialProfile }: CookieConsentBannerProps) {
  const locale = useLocale();

  const fallbackConsent = useMemo(() => {
    if (initialConsent) {
      return initialConsent;
    }

    if (initialProfile) {
      return cookieConsentProfileToChoice(initialProfile);
    }

    return null;
  }, [initialConsent, initialProfile]);

  const [consent, setConsent] = useState<CookieConsentChoice | null>(fallbackConsent);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isVisible = consent === null || isSettingsOpen;

  useEffect(() => {
    function handleOpenEvent() {
      setIsSettingsOpen(true);
    }

    function handleConsentChange(event: Event) {
      const customEvent = event as CustomEvent<{ value?: CookieConsentChoice | null }>;
      const nextValue = customEvent.detail?.value;

      if (nextValue === "all" || nextValue === "necessary" || nextValue === null) {
        setConsent(nextValue);
      }
    }

    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, handleOpenEvent);
    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentChange as EventListener);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, handleOpenEvent);
      window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentChange as EventListener);
    };
  }, []);

  function chooseConsent(value: CookieConsentChoice) {
    setCookieConsent(value);
    setConsent(value);
    setIsSettingsOpen(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-3 z-[90] sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-[min(540px,calc(100vw-2rem))]">
      <section
        role="dialog"
        aria-live="polite"
        aria-label={tr(locale, "Cookie consent", "Cookie consent")}
        className="pointer-events-auto rounded-3xl border border-indigo-500/55 bg-[#332f8f] p-4 shadow-[0_22px_64px_rgba(4,10,40,0.5)]"
      >
        <div className="flex items-start gap-2.5">
          <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-indigo-400/70 bg-indigo-700/45 text-foreground">
            <Cookie className="size-4" />
          </div>
          <div className="flex-1">
            <h2 className="text-[1.95rem] font-semibold leading-none text-foreground">
              {tr(locale, "We value your privacy", "We value your privacy")}
            </h2>
            <p className="mt-2 text-[1.03rem] leading-8 text-muted-foreground/95">
              {tr(
                locale,
                "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.",
                "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.",
              )}
            </p>
            {consent !== null && isSettingsOpen ? (
              <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground">
                {tr(locale, "You can update your cookie preferences at any time.", "You can update your cookie preferences at any time.")}
              </p>
            ) : null}
          </div>
          {consent !== null && isSettingsOpen ? (
            <button
              type="button"
              onClick={() => {
                setIsSettingsOpen(false);
              }}
              className="inline-flex size-8 items-center justify-center rounded-full border border-indigo-400/70 bg-indigo-700/45 text-foreground transition hover:bg-indigo-700/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-900"
              aria-label={tr(locale, "Close cookie settings", "Close cookie settings")}
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="mt-4 space-y-2.5">
          <button
            type="button"
            onClick={() => {
              chooseConsent("all");
            }}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-[15px] border border-transparent bg-white px-4 text-[1.05rem] font-medium text-black transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-900"
          >
            {tr(locale, "Accept All", "Accept All")}
          </button>
          <button
            type="button"
            onClick={() => {
              chooseConsent("necessary");
            }}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-[15px] border border-indigo-500 bg-transparent px-4 text-[1.05rem] font-semibold text-foreground transition hover:bg-indigo-700/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-900"
          >
            {tr(locale, "Necessary Cookies Only", "Necessary Cookies Only")}
          </button>
        </div>

        <div className="mt-3 text-center">
          <Link
            href="/cookie-settings"
            className="inline-flex items-center justify-center text-sm font-medium text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
          >
            {tr(locale, "Manage Preferences", "Manage Preferences")}
          </Link>
        </div>
      </section>
    </div>
  );
}

