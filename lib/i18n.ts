export const LOCALE_COOKIE = "demumumind_locale";
export const LOCALES = ["en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];

const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string | null | undefined): value is Locale {
  if (!value) {
    return false;
  }

  return LOCALES.includes(value as Locale);
}

export function getLocaleFromDocumentCookie(cookieValue: string): Locale {
  const localeCookie = cookieValue
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE}=`));

  const value = localeCookie?.split("=")[1] || "";

  if (isLocale(value)) {
    return value;
  }

  return DEFAULT_LOCALE;
}

export function tr<T>(locale: Locale, enValue: T, ruValue: T): T {
  return locale === "ru" ? ruValue : enValue;
}

export function getDefaultLocale(): Locale {
  return DEFAULT_LOCALE;
}