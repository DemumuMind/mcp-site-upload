import { cookies } from "next/headers";
import { getDefaultLocale, isLocale, type Locale, LOCALE_COOKIE } from "@/lib/i18n";
export async function getLocale(): Promise<Locale> {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
    if (isLocale(cookieLocale)) {
        return cookieLocale;
    }
    return getDefaultLocale();
}
