"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPasswordChecklistItems,
} from "@/lib/auth/password-ui";
import { tr, type Locale } from "@/lib/i18n";
import type { PasswordStrengthScore } from "@/lib/password-strength";
import type { EmailAuthMode } from "@/components/auth-sign-in-panel/use-email-auth";
import {
  ConfirmPasswordField,
  EmailAuthModeLinks,
  EmailField,
  PasswordField,
} from "@/components/auth-sign-in-panel/email-auth-form-primitives";
import type {
  EmailAuthErrors,
  EmailAuthValues,
} from "@/components/auth-sign-in-panel/email-auth-form.types";

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
        <EmailField
          email={emailAuthValues.email}
          error={emailAuthErrors.email}
          onChange={value => updateEmailField("email", value)}
        />

        {!isResetRequestMode ? (
          <PasswordField
            locale={locale}
            isSignUpMode={isSignUpMode}
            password={emailAuthValues.password}
            error={emailAuthErrors.password}
            passwordStrengthScore={emailPasswordStrengthScore}
            signupChecklistItems={signupChecklistItems}
            onChange={value => updateEmailField("password", value)}
          />
        ) : null}

        {isSignUpMode ? (
          <ConfirmPasswordField
            locale={locale}
            confirmPassword={emailAuthValues.confirmPassword}
            error={emailAuthErrors.confirmPassword}
            onChange={value => updateEmailField("confirmPassword", value)}
          />
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

      <EmailAuthModeLinks locale={locale} mode={emailAuthMode} onSwitchMode={onSwitchMode} />
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
