export const LOCALE_COOKIE = "demumumind_locale";
export const LOCALES = ["en"] as const;
export type Locale = "en";
const DEFAULT_LOCALE: Locale = "en";
export function isLocale(value: string | null | undefined): value is Locale {
    return value === DEFAULT_LOCALE;
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
export function tr<T>(locale: Locale, enValue: T, _ruValue: T): T {
    void _ruValue;
    return enValue;
}
export function getDefaultLocale(): Locale {
    return DEFAULT_LOCALE;
}
