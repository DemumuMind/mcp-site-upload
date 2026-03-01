"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getPasswordChecklistItems,
  getPasswordStrengthLabel,
  PasswordStrengthChecklist,
} from "@/lib/auth/password-ui";
import { tr, type Locale } from "@/lib/i18n";
import { PASSWORD_MIN_LENGTH, type PasswordStrengthScore } from "@/lib/password-strength";
import type { EmailAuthMode } from "@/components/auth-sign-in-panel/use-email-auth";

type OAuthButtonsSectionProps = {
  locale: Locale;
  pendingOAuthProvider: "google" | "github" | null;
  isEmailPending: boolean;
  onSignInWithProvider: (provider: "google" | "github") => void;
  oauthButtonClass: string;
};

function OAuthProviderButton({
  provider,
  pendingOAuthProvider,
  isEmailPending,
  onSignIn,
  buttonClassName,
  label,
  icon,
  iconClassName,
}: {
  provider: "google" | "github";
  pendingOAuthProvider: "google" | "github" | null;
  isEmailPending: boolean;
  onSignIn: (provider: "google" | "github") => void;
  buttonClassName: string;
  label: string;
  icon: string;
  iconClassName?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => onSignIn(provider)}
      disabled={pendingOAuthProvider !== null || isEmailPending}
      className={buttonClassName}
    >
      {pendingOAuthProvider === provider ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <span
          className={`inline-flex size-6 items-center justify-center rounded-full border border-border/60 bg-card font-bold text-foreground ${iconClassName ?? "text-xs"}`}
        >
          {icon}
        </span>
      )}
      <span>{label}</span>
    </Button>
  );
}

export function AuthHeroIntro({
  locale,
  description,
}: {
  locale: Locale;
  description: string;
}) {
  return (
    <>
      <span className="inline-flex rounded-full border border-primary/40 bg-card px-3 py-1 text-[10px] font-semibold tracking-[0.22em] text-foreground uppercase">
        {tr(locale, "Secure access", "Secure access")}
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {tr(locale, "Welcome to DemumuMind MCP", "Welcome to DemumuMind MCP")}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/85 sm:text-base">{description}</p>
    </>
  );
}

export function OAuthButtonsSection({
  locale,
  pendingOAuthProvider,
  isEmailPending,
  onSignInWithProvider,
  oauthButtonClass,
}: OAuthButtonsSectionProps) {
  return (
    <div className="mt-8">
      <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
        {tr(locale, "Continue with social login", "Continue with social login")}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <OAuthProviderButton
          provider="google"
          pendingOAuthProvider={pendingOAuthProvider}
          isEmailPending={isEmailPending}
          onSignIn={onSignInWithProvider}
          buttonClassName={oauthButtonClass}
          label={tr(locale, "Continue with Google", "Continue with Google")}
          icon="G"
        />
        <OAuthProviderButton
          provider="github"
          pendingOAuthProvider={pendingOAuthProvider}
          isEmailPending={isEmailPending}
          onSignIn={onSignInWithProvider}
          buttonClassName={oauthButtonClass}
          label={tr(locale, "Continue with GitHub", "Continue with GitHub")}
          icon="GH"
          iconClassName="text-[10px]"
        />
      </div>
    </div>
  );
}

type EmailAuthValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

type EmailAuthErrors = Partial<Record<keyof EmailAuthValues, string>>;

type EmailAuthFormSectionProps = {
  locale: Locale;
  emailAuthMode: EmailAuthMode;
  isSignUpMode: boolean;
  isResetRequestMode: boolean;
  emailAuthValues: EmailAuthValues;
  emailAuthErrors: EmailAuthErrors;
  emailPasswordStrengthScore: PasswordStrengthScore;
  signupChecklistItems: ReturnType<typeof getPasswordChecklistItems>;
  isEmailPending: boolean;
  pendingOAuthProvider: "google" | "github" | null;
  primaryActionButtonClass: string;
  updateEmailField: (field: keyof EmailAuthValues, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSwitchMode: (nextMode: EmailAuthMode) => void;
};

export function EmailAuthFormSection({
  locale,
  emailAuthMode,
  isSignUpMode,
  isResetRequestMode,
  emailAuthValues,
  emailAuthErrors,
  emailPasswordStrengthScore,
  signupChecklistItems,
  isEmailPending,
  pendingOAuthProvider,
  primaryActionButtonClass,
  updateEmailField,
  onSubmit,
  onSwitchMode,
}: EmailAuthFormSectionProps) {
  return (
    <div className="mt-6 rounded-2xl border border-border/60 bg-card p-4 sm:p-5">
      <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
        {isSignUpMode
          ? tr(locale, "Register with email", "Register with email")
          : isResetRequestMode
            ? tr(locale, "Password reset", "Password reset")
            : tr(locale, "Login with email", "Login with email")}
      </p>

      <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm text-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={emailAuthValues.email}
            onChange={event => updateEmailField("email", event.target.value)}
            placeholder="you@example.com"
            className="h-11 rounded-xl border-border/60 bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
          />
          {emailAuthErrors.email ? <p className="text-xs text-rose-300">{emailAuthErrors.email}</p> : null}
        </div>

        {!isResetRequestMode ? (
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm text-foreground">
              {tr(locale, "Password", "Password")}
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete={isSignUpMode ? "new-password" : "current-password"}
              required
              value={emailAuthValues.password}
              onChange={event => updateEmailField("password", event.target.value)}
              placeholder={tr(
                locale,
                isSignUpMode ? `At least ${PASSWORD_MIN_LENGTH} characters` : "Enter your password",
                isSignUpMode ? `At least ${PASSWORD_MIN_LENGTH} characters` : "Enter your password",
              )}
              className="h-11 rounded-xl border-border/60 bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
            />
            {isSignUpMode ? (
              <PasswordStrengthChecklist
                score={emailPasswordStrengthScore}
                strengthLabel={getPasswordStrengthLabel(locale, emailPasswordStrengthScore)}
                checklistItems={signupChecklistItems}
              />
            ) : null}
            {emailAuthErrors.password ? <p className="text-xs text-rose-300">{emailAuthErrors.password}</p> : null}
          </div>
        ) : null}

        {isSignUpMode ? (
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm text-foreground">
              {tr(locale, "Confirm password", "Confirm password")}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={emailAuthValues.confirmPassword}
              onChange={event => updateEmailField("confirmPassword", event.target.value)}
              placeholder={tr(locale, "Repeat password", "Repeat password")}
              className="h-11 rounded-xl border-border/60 bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
            />
            {emailAuthErrors.confirmPassword ? (
              <p className="text-xs text-rose-300">{emailAuthErrors.confirmPassword}</p>
            ) : null}
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={isEmailPending || pendingOAuthProvider !== null}
          className={primaryActionButtonClass}
        >
          {isEmailPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {isSignUpMode
            ? tr(locale, "Create account", "Create account")
            : isResetRequestMode
              ? tr(locale, "Send reset email", "Send reset email")
              : tr(locale, "Sign in", "Sign in")}
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
        {emailAuthMode === "sign-in" ? (
          <>
            <button
              type="button"
              onClick={() => onSwitchMode("sign-up")}
              className="underline underline-offset-4 transition hover:text-foreground"
            >
              {tr(locale, "No account? Sign up", "No account? Sign up")}
            </button>
            <button
              type="button"
              onClick={() => onSwitchMode("reset-request")}
              className="underline underline-offset-4 transition hover:text-foreground"
            >
              {tr(locale, "Forgot password?", "Forgot password?")}
            </button>
          </>
        ) : null}

        {emailAuthMode === "sign-up" ? (
          <button
            type="button"
            onClick={() => onSwitchMode("sign-in")}
            className="underline underline-offset-4 transition hover:text-foreground"
          >
            {tr(locale, "Already have an account? Sign in", "Already have an account? Sign in")}
          </button>
        ) : null}

        {emailAuthMode === "reset-request" ? (
          <button
            type="button"
            onClick={() => onSwitchMode("sign-in")}
            className="underline underline-offset-4 transition hover:text-foreground"
          >
            {tr(locale, "Remembered your password? Sign in", "Remembered your password? Sign in")}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function AuthLegalFooter({ locale }: { locale: Locale }) {
  return (
    <p className="mt-6 border-t border-border/60 pt-4 text-xs leading-6 text-muted-foreground">
      {tr(locale, "By signing in, you agree to our", "By signing in, you agree to our")}{" "}
      <Link
        href="/terms"
        className="font-semibold text-foreground underline underline-offset-4 transition hover:text-foreground"
      >
        {tr(locale, "Terms", "Terms")}
      </Link>{" "}
      {tr(locale, "and", "and")}{" "}
      <Link
        href="/privacy"
        className="font-semibold text-foreground underline underline-offset-4 transition hover:text-foreground"
      >
        {tr(locale, "Privacy Policy", "Privacy Policy")}
      </Link>
      .
    </p>
  );
}
