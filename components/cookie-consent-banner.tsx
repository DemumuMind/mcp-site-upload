"use client";
import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { COOKIE_CONSENT_OPEN_EVENT, COOKIE_CONSENT_EVENT, type CookieConsentChoice, setCookieConsent, } from "@/lib/cookie-consent";
import { tr } from "@/lib/i18n";
type CookieConsentBannerProps = {
    initialConsent: CookieConsentChoice | null;
};
export function CookieConsentBanner({ initialConsent }: CookieConsentBannerProps) {
    const locale = useLocale();
    const [consent, setConsent] = useState<CookieConsentChoice | null>(initialConsent);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const isVisible = consent === null || isSettingsOpen;
    useEffect(() => {
        function handleOpenEvent() {
            setIsSettingsOpen(true);
        }
        function handleConsentChange(event: Event) {
            const customEvent = event as CustomEvent<{
                value?: CookieConsentChoice | null;
            }>;
            if (customEvent.detail?.value === null) {
                setConsent(null);
                return;
            }
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
    return (<div className="pointer-events-none fixed inset-x-3 bottom-3 z-[90] sm:inset-x-auto sm:left-4 sm:bottom-4 sm:w-[min(540px,calc(100vw-2rem))]">
      <section className="pointer-events-auto rounded-xl border border-violet-200 bg-[#f6f7fa] p-3 shadow-[0_20px_60px_rgba(15,23,42,0.28)] dark:border-indigo-700 dark:bg-indigo-900">
        <div className="flex items-start gap-2.5">
          <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-violet-200 bg-white text-indigo-700 dark:border-indigo-600 dark:bg-indigo-800 dark:text-violet-100">
            <Cookie className="size-4"/>
          </div>
          <div className="flex-1">
            <h2 className="text-[1.03rem] font-semibold text-indigo-800 dark:text-violet-50">
              {tr(locale, "We value your privacy", "We value your privacy")}
            </h2>
            <p className="mt-1 text-[1.05rem] leading-8 text-indigo-600 dark:text-violet-200">
              {tr(locale, "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.", "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.")}
            </p>
            {consent !== null && isSettingsOpen ? (<p className="mt-2 text-sm text-violet-400 dark:text-violet-300">
                {tr(locale, "You can update your cookie preferences at any time.", "You can update your cookie preferences at any time.")}
              </p>) : null}
          </div>
          {consent !== null && isSettingsOpen ? (<button type="button" onClick={() => {
                setIsSettingsOpen(false);
            }} className="inline-flex size-8 items-center justify-center rounded-full border border-violet-200 bg-white text-indigo-700 transition hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f7fa] dark:border-indigo-600 dark:bg-indigo-800 dark:text-violet-100 dark:hover:bg-indigo-700 dark:focus-visible:ring-white dark:focus-visible:ring-offset-indigo-900" aria-label={tr(locale, "Close cookie settings", "Close cookie settings")}>
              <X className="size-4"/>
            </button>) : null}
        </div>

        <div className="mt-4 space-y-2.5">
          <button type="button" onClick={() => {
            chooseConsent("all");
        }} className="inline-flex min-h-12 w-full items-center justify-center rounded-[10px] border border-black bg-black px-4 text-[1.05rem] font-semibold text-white transition hover:bg-indigo-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f7fa] dark:border-white dark:bg-white dark:text-black dark:hover:bg-violet-50 dark:focus-visible:ring-white dark:focus-visible:ring-offset-indigo-900">
            {tr(locale, "Accept All", "Accept All")}
          </button>
          <button type="button" onClick={() => {
            chooseConsent("necessary");
        }} className="inline-flex min-h-12 w-full items-center justify-center rounded-[10px] border border-violet-200 bg-transparent px-4 text-[1.05rem] font-medium text-indigo-800 transition hover:bg-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f7fa] dark:border-indigo-600 dark:text-violet-100 dark:hover:bg-indigo-800">
            {tr(locale, "Necessary Cookies Only", "Necessary Cookies Only")}
          </button>
        </div>
      </section>
    </div>);
}
