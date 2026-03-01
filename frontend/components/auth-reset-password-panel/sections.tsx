"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getPasswordStrengthLabel,
  PasswordStrengthChecklist,
} from "@/lib/auth/password-ui";
import { tr, type Locale } from "@/lib/i18n";
import { PASSWORD_MIN_LENGTH, type PasswordStrengthScore } from "@/lib/password-strength";

type ResetValues = {
  newPassword: string;
  confirmPassword: string;
};

type ResetErrors = Partial<Record<keyof ResetValues, string>>;

export function ResetCompletedSection({
  locale,
  secondsLeft,
  onGoToLogin,
}: {
  locale: Locale;
  secondsLeft: number;
  onGoToLogin: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-[0_24px_56px_-36px_hsl(var(--foreground)/0.35)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
      <div className="relative p-6 sm:p-10">
        <span className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-[10px] font-semibold tracking-[0.22em] text-primary uppercase">
          {tr(locale, "Password updated", "Password updated")}
        </span>
        <div className="mt-4 flex items-center gap-3">
          <CheckCircle2 className="size-6 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {tr(locale, "Success! Your password is ready.", "Success! Your password is ready.")}
          </h1>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/85 sm:text-base">
          {tr(locale, "You will be redirected to login automatically.", "You will be redirected to login automatically.")}{" "}
          {tr(locale, "Redirect in", "Redirect in")} {secondsLeft}
          {tr(locale, "s.", "s.")}
        </p>
        <div className="mt-5">
          <Button type="button" className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" onClick={onGoToLogin}>
            {tr(locale, "Go to login now", "Go to login now")}
          </Button>
        </div>
      </div>
    </section>
  );
}

export function ResetPasswordFormSection({
  locale,
  values,
  errors,
  passwordStrengthScore,
  passwordChecklistItems,
  isPending,
  onUpdateField,
  onSubmit,
}: {
  locale: Locale;
  values: ResetValues;
  errors: ResetErrors;
  passwordStrengthScore: PasswordStrengthScore;
  passwordChecklistItems: ReturnType<typeof import("@/lib/auth/password-ui").getPasswordChecklistItems>;
  isPending: boolean;
  onUpdateField: (field: keyof ResetValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-[0_24px_56px_-36px_hsl(var(--foreground)/0.35)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
      <div className="relative p-6 sm:p-10">
        <span className="inline-flex rounded-full border border-primary/40 bg-card px-3 py-1 text-[10px] font-semibold tracking-[0.22em] text-foreground uppercase">
          {tr(locale, "Password recovery", "Password recovery")}
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {tr(locale, "Set a new password", "Set a new password")}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/85 sm:text-base">
          {tr(
            locale,
            "This page is linked to your recovery email. Enter and confirm your new password.",
            "This page is linked to your recovery email. Enter and confirm your new password.",
          )}
        </p>

        <form className="mt-6 grid gap-3 rounded-2xl border border-border/60 bg-card p-4 sm:p-5" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-sm text-foreground">
              {tr(locale, "New password", "New password")}
            </Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              required
              value={values.newPassword}
              onChange={event => onUpdateField("newPassword", event.target.value)}
              placeholder={tr(locale, `At least ${PASSWORD_MIN_LENGTH} characters`, `At least ${PASSWORD_MIN_LENGTH} characters`)}
              className="h-11 rounded-xl border-border/60 bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
            />
            <PasswordStrengthChecklist
              score={passwordStrengthScore}
              strengthLabel={getPasswordStrengthLabel(locale, passwordStrengthScore)}
              checklistItems={passwordChecklistItems}
            />
            {errors.newPassword ? <p className="text-xs text-rose-300">{errors.newPassword}</p> : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm text-foreground">
              {tr(locale, "Confirm password", "Confirm password")}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={values.confirmPassword}
              onChange={event => onUpdateField("confirmPassword", event.target.value)}
              placeholder={tr(locale, "Repeat password", "Repeat password")}
              className="h-11 rounded-xl border-border/60 bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
            />
            {errors.confirmPassword ? <p className="text-xs text-rose-300">{errors.confirmPassword}</p> : null}
          </div>

          <Button type="submit" disabled={isPending} className="h-11 rounded-xl bg-primary text-primary-foreground transition hover:bg-primary/90">
            {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {tr(locale, "Update password", "Update password")}
          </Button>
        </form>

        <p className="mt-5 text-xs text-muted-foreground">
          <Link href="/auth" className="underline underline-offset-4 transition hover:text-foreground">
            {tr(locale, "Back to login", "Back to login")}
          </Link>
        </p>
      </div>
    </section>
  );
}
