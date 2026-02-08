"use client";

import { openCookieConsentSettings } from "@/lib/cookie-consent";

type CookieSettingsButtonProps = {
  label: string;
};

export function CookieSettingsButton({ label }: CookieSettingsButtonProps) {
  return (
    <button
      type="button"
      onClick={() => {
        openCookieConsentSettings();
      }}
      className="rounded-sm text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
    >
      {label}
    </button>
  );
}
