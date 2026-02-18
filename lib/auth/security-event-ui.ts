import { tr, type Locale } from "@/lib/i18n";

export function getSecurityEventLabel(locale: Locale, eventType: string): string {
  if (eventType === "login_success") {
    return tr(locale, "Successful login", "Successful login");
  }
  if (eventType === "login_failure") {
    return tr(locale, "Failed login", "Failed login");
  }
  if (eventType === "login_rate_limited") {
    return tr(locale, "Rate limit triggered", "Rate limit triggered");
  }
  if (eventType === "password_reset_request") {
    return tr(locale, "Password reset requested", "Password reset requested");
  }
  if (eventType === "password_reset_success") {
    return tr(locale, "Password reset completed", "Password reset completed");
  }
  if (eventType === "logout") {
    return tr(locale, "Sign out", "Sign out");
  }
  return eventType;
}

export function getSecurityEventBadgeClass(eventType: string): string {
  if (eventType === "login_success" || eventType === "password_reset_success") {
    return "border-emerald-400/35 bg-emerald-500/10 text-emerald-200";
  }
  if (eventType === "login_failure" || eventType === "login_rate_limited") {
    return "border-rose-400/35 bg-rose-500/10 text-rose-200";
  }
  return "border-violet-300/30 bg-indigo-900/60 text-violet-200";
}
