"use client";
import { openCookieConsentSettings } from "@/lib/cookie-consent";
type CookieSettingsButtonProps = {
    label: string;
};
export function CookieSettingsButton({ label }: CookieSettingsButtonProps) {
    return (<button type="button" onClick={() => {
            openCookieConsentSettings();
        }} className="inline-flex min-h-11 min-w-11 items-center rounded-sm py-1 text-violet-200 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950 sm:min-h-0 sm:py-0">
      {label}
    </button>);
}
