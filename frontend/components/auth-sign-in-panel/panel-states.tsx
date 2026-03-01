"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthStatusCard } from "@/components/auth-status-card";
import { AuthHeroIntro } from "@/components/auth-sign-in-panel/sections";
import { tr, type Locale } from "@/lib/i18n";

export function getAuthErrorMessage(
  locale: Locale,
  errorCode?: string,
  authErrorCode?: string,
  authErrorDescription?: string,
): string | null {
  if (authErrorCode === "otp_expired") {
    return tr(
      locale,
      "This email link has expired or was already used. Request a new confirmation/reset email and open the latest one.",
      "This email link has expired or was already used. Request a new confirmation/reset email and open the latest one.",
    );
  }
  if (authErrorCode === "access_denied") {
    return tr(
      locale,
      "Access denied for this auth link. Please start sign-in again and use the newest email link.",
      "Access denied for this auth link. Please start sign-in again and use the newest email link.",
    );
  }
  if (authErrorDescription?.trim()) return authErrorDescription.replace(/\+/g, " ");
  if (!errorCode) return null;
  if (errorCode === "missing_code") {
    return tr(
      locale,
      "Authentication code is missing. Please try signing in again.",
      "Authentication code is missing. Please try signing in again.",
    );
  }
  if (errorCode === "callback_error") {
    return tr(
      locale,
      "Sign-in callback failed or link has expired. Start a new sign-in attempt.",
      "Sign-in callback failed or link has expired. Start a new sign-in attempt.",
    );
  }
  if (errorCode === "config_error") {
    return tr(
      locale,
      "Auth callback is not configured. Check Supabase environment variables.",
      "Auth callback is not configured. Check Supabase environment variables.",
    );
  }
  return tr(locale, "Authentication failed. Please try again.", "Authentication failed. Please try again.");
}

export function LoadingSignInPanel({ locale }: { locale: Locale }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-[0_24px_56px_-36px_hsl(var(--foreground)/0.35)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
      <div className="relative p-6 sm:p-10">
        <AuthHeroIntro locale={locale} description={tr(locale, "Loading sign-in panel...", "Loading sign-in panel...")} />
      </div>
    </section>
  );
}

export function AuthNotConfiguredPanel({ locale }: { locale: Locale }) {
  return (
    <AuthStatusCard
      containerClassName="rounded-[1.75rem] border border-amber-300/35 bg-card shadow-[0_20px_45px_-30px_rgba(251,191,36,0.7)]"
      topBorderClassName="bg-gradient-to-r from-transparent via-amber-300/40 to-transparent"
      title={tr(locale, "Auth is not configured", "Auth is not configured")}
      titleClassName="text-2xl font-semibold text-amber-100"
      message={tr(
        locale,
        "Set NEXT_PUBLIC_SUPABASE_URL and a Supabase publishable key (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) to enable login.",
        "Set NEXT_PUBLIC_SUPABASE_URL and a Supabase publishable key (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) to enable login.",
      )}
      messageClassName="mt-2 max-w-2xl text-sm text-amber-50/85"
      action={
        <Button asChild className="mt-6 h-10 rounded-xl bg-amber-300 text-primary-foreground hover:bg-amber-200">
          <Link href="/">{tr(locale, "Back to catalog", "Back to catalog")}</Link>
        </Button>
      }
    />
  );
}

export function SignedInPanel({
  locale,
  safeNextPath,
  email,
  onSignOut,
}: {
  locale: Locale;
  safeNextPath: string;
  email?: string;
  onSignOut: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-card p-6 shadow-[0_24px_56px_-36px_hsl(var(--foreground)/0.35)] sm:p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="relative">
        <h1 className="text-2xl font-semibold text-foreground">{tr(locale, "You are signed in", "You are signed in")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {tr(locale, "Account:", "Account:")}{" "}
          <span className="font-medium text-foreground">{email || tr(locale, "authenticated user", "authenticated user")}</span>
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary">
            <Link href={safeNextPath}>{tr(locale, "Continue", "Continue")}</Link>
          </Button>
          <Button type="button" variant="outline" onClick={onSignOut} className="h-10 rounded-xl border-border/60 bg-card hover:bg-accent">
            {tr(locale, "Sign out", "Sign out")}
          </Button>
        </div>
      </div>
    </div>
  );
}
