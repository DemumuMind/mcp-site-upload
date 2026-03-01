import { tr, type Locale } from "@/lib/i18n";

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function getAuthTypeLabel(locale: Locale, authType: string): string {
  if (authType === "oauth") return tr(locale, "OAuth", "OAuth");
  if (authType === "api_key") return tr(locale, "API key", "API key");
  return tr(locale, "No auth", "No auth");
}

export function formatQueuedAt(locale: Locale, value?: string): string {
  if (!value) return tr(locale, "Unknown", "Unknown");
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return tr(locale, "Unknown", "Unknown");
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}
