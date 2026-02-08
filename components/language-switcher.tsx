"use client";

import { useRouter } from "next/navigation";

import { useLocale } from "@/components/locale-provider";
import { LOCALE_COOKIE, tr, type Locale } from "@/lib/i18n";

function setLocaleCookie(locale: Locale) {
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${oneYear}; samesite=lax`;
}

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  function handleSwitch(nextLocale: Locale) {
    if (nextLocale === locale) {
      return;
    }

    setLocaleCookie(nextLocale);
    router.refresh();
  }

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/70 p-1">
      <button
        type="button"
        onClick={() => handleSwitch("en")}
        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition ${
          locale === "en"
            ? "bg-blue-500 text-white"
            : "text-slate-300 hover:bg-white/10 hover:text-white"
        }`}
        aria-label={tr(locale, "Switch language to English", "Переключить язык на английский")}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => handleSwitch("ru")}
        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition ${
          locale === "ru"
            ? "bg-blue-500 text-white"
            : "text-slate-300 hover:bg-white/10 hover:text-white"
        }`}
        aria-label={tr(locale, "Switch language to Russian", "Переключить язык на русский")}
      >
        RU
      </button>
    </div>
  );
}
