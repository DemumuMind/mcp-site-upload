"use client";

import Link from "next/link";
import { AuthStatusCard } from "@/components/auth-status-card";
import { useLocale } from "@/components/locale-provider";
import {
  ResetCompletedSection,
  ResetPasswordFormSection,
} from "@/components/auth-reset-password-panel/sections";
import { useResetPasswordController } from "@/components/auth-reset-password-panel/use-reset-password-controller";
import { Button } from "@/components/ui/button";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { tr } from "@/lib/i18n";

export function AuthResetPasswordPanel() {
  const locale = useLocale();
  const { isConfigured, isLoading, user } = useSupabaseUser();
  const controller = useResetPasswordController(locale);

  if (!isConfigured) {
    return (
      <AuthStatusCard
        containerClassName="rounded-[1.75rem] border border-amber-300/35 bg-card shadow-[0_20px_45px_-30px_rgba(251,191,36,0.7)]"
        topBorderClassName="bg-gradient-to-r from-transparent via-amber-300/40 to-transparent"
        title={tr(locale, "Auth is not configured", "Auth is not configured")}
        titleClassName="text-2xl font-semibold text-amber-100"
        message={tr(
          locale,
          "Set NEXT_PUBLIC_SUPABASE_URL and a Supabase publishable key (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) to reset passwords.",
          "Set NEXT_PUBLIC_SUPABASE_URL and a Supabase publishable key (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) to reset passwords.",
        )}
        messageClassName="mt-2 max-w-2xl text-sm text-amber-50/85"
        action={
          <Button asChild className="mt-6 h-10 rounded-xl bg-amber-300 text-primary-foreground hover:bg-amber-200">
            <Link href="/auth">{tr(locale, "Open login page", "Open login page")}</Link>
          </Button>
        }
      />
    );
  }

  if (isLoading || controller.isRecoveryInitializing) {
    return (
      <AuthStatusCard
        containerClassName="rounded-[1.75rem] border border-border/60 bg-card shadow-[0_24px_56px_-36px_hsl(var(--foreground)/0.35)]"
        title={tr(locale, "Checking recovery session...", "Checking recovery session...")}
        titleClassName="text-sm font-normal text-muted-foreground"
      />
    );
  }

  if (!user) {
    return (
      <AuthStatusCard
        containerClassName="rounded-[1.75rem] border border-border/60 bg-card shadow-[0_24px_56px_-36px_hsl(var(--foreground)/0.35)]"
        title={tr(locale, "Recovery session is missing", "Recovery session is missing")}
        message={tr(
          locale,
          "Open the reset link from your email first, or request a new reset email on the login page.",
          "Open the reset link from your email first, or request a new reset email on the login page.",
        )}
        messageClassName="mt-3 text-sm text-muted-foreground"
        action={
          <Button asChild className="mt-6 h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/auth">{tr(locale, "Back to login", "Back to login")}</Link>
          </Button>
        }
      />
    );
  }

  if (controller.isCompleted) {
    return (
      <ResetCompletedSection
        locale={locale}
        secondsLeft={controller.secondsLeft}
        onGoToLogin={controller.goToAuth}
      />
    );
  }

  return (
    <ResetPasswordFormSection
      locale={locale}
      values={controller.values}
      errors={controller.errors}
      passwordStrengthScore={controller.passwordStrengthScore}
      passwordChecklistItems={controller.passwordChecklistItems}
      isPending={controller.isPending}
      onUpdateField={controller.updateField}
      onSubmit={controller.submitPasswordReset}
    />
  );
}
