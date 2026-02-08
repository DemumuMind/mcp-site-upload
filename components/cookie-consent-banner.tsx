"use client";

import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";

import {
  COOKIE_CONSENT_OPEN_EVENT,
  COOKIE_CONSENT_EVENT,
  type CookieConsentChoice,
  setCookieConsent,
} from "@/lib/cookie-consent";

type CookieConsentBannerProps = {
  initialConsent: CookieConsentChoice | null;
};

export function CookieConsentBanner({ initialConsent }: CookieConsentBannerProps) {
  const [consent, setConsent] = useState<CookieConsentChoice | null>(initialConsent);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isVisible = consent === null || isSettingsOpen;

  useEffect(() => {
    function handleOpenEvent() {
      setIsSettingsOpen(true);
    }

    function handleConsentChange(event: Event) {
      const customEvent = event as CustomEvent<{ value?: CookieConsentChoice }>;
      if (customEvent.detail?.value === "all" || customEvent.detail?.value === "necessary") {
        setConsent(customEvent.detail.value);
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
    <div className="pointer-events-none fixed inset-x-3 bottom-3 z-[90] sm:inset-x-auto sm:left-4 sm:bottom-4 sm:w-[min(540px,calc(100vw-2rem))]">
      <section className="pointer-events-auto rounded-xl border border-slate-300 bg-[#f6f7fa] p-3 shadow-[0_20px_60px_rgba(15,23,42,0.28)] dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start gap-2.5">
          <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
            <Cookie className="size-4" />
          </div>
          <div className="flex-1">
            <h2 className="text-[1.03rem] font-semibold text-slate-800 dark:text-slate-100">
              We value your privacy
            </h2>
            <p className="mt-1 text-[1.05rem] leading-8 text-slate-600 dark:text-slate-300">
              We use cookies to enhance your browsing experience, serve personalized content, and
              analyze our traffic.
            </p>
            {consent !== null && isSettingsOpen ? (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                You can update your cookie preferences at any time.
              </p>
            ) : null}
          </div>
          {consent !== null && isSettingsOpen ? (
            <button
              type="button"
              onClick={() => {
                setIsSettingsOpen(false);
              }}
              className="inline-flex size-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f7fa] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus-visible:ring-white dark:focus-visible:ring-offset-slate-900"
              aria-label="Close cookie settings"
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
            className="inline-flex min-h-12 w-full items-center justify-center rounded-[10px] border border-black bg-black px-4 text-[1.05rem] font-semibold text-white transition hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f7fa] dark:border-white dark:bg-white dark:text-black dark:hover:bg-slate-100 dark:focus-visible:ring-white dark:focus-visible:ring-offset-slate-900"
          >
            Accept All
          </button>
          <button
            type="button"
            onClick={() => {
              chooseConsent("necessary");
            }}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-[10px] border border-slate-300 bg-transparent px-4 text-[1.05rem] font-medium text-slate-800 transition hover:bg-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f7fa] dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Necessary Cookies Only
          </button>
        </div>
      </section>
    </div>
  );
}
