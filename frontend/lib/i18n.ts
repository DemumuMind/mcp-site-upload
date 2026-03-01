export const LOCALE_COOKIE = "demumumind_locale";
export type Locale = "en";
const DEFAULT_LOCALE: Locale = "en";
export function isLocale(value: string | null | undefined): value is Locale {
    return value === DEFAULT_LOCALE;
}
export function tr<T>(locale: Locale, enValue: T, _ruValue: T): T {
    void _ruValue;
    return enValue;
}
export function getDefaultLocale(): Locale {
    return DEFAULT_LOCALE;
}
