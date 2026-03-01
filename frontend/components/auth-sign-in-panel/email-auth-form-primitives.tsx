"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getPasswordChecklistItems,
  getPasswordStrengthLabel,
  PasswordStrengthChecklist,
} from "@/lib/auth/password-ui";
import { tr, type Locale } from "@/lib/i18n";
import {
  PASSWORD_MIN_LENGTH,
  type PasswordStrengthScore,
} from "@/lib/password-strength";
import type { EmailAuthMode } from "@/components/auth-sign-in-panel/use-email-auth";
import type {
  EmailAuthErrors,
  EmailAuthValues,
} from "@/components/auth-sign-in-panel/email-auth-form.types";

type EmailFieldProps = {
  email: string;
  error?: string;
  onChange: (value: string) => void;
};

export function EmailField({ email, error, onChange }: EmailFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="email" className="text-sm text-foreground">
        Email
      </Label>
      <Input
        id="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={event => onChange(event.target.value)}
        placeholder="you@example.com"
        className="h-11 rounded-xl border-border/60 bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
      />
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}

type PasswordFieldProps = {
  locale: Locale;
  isSignUpMode: boolean;
  password: string;
  error?: string;
  passwordStrengthScore: PasswordStrengthScore;
  signupChecklistItems: ReturnType<typeof getPasswordChecklistItems>;
  onChange: (value: string) => void;
};

export function PasswordField({
  locale,
  isSignUpMode,
  password,
  error,
  passwordStrengthScore,
  signupChecklistItems,
  onChange,
}: PasswordFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="password" className="text-sm text-foreground">
        {tr(locale, "Password", "Password")}
      </Label>
      <Input
        id="password"
        type="password"
        autoComplete={isSignUpMode ? "new-password" : "current-password"}
        required
        value={password}
        onChange={event => onChange(event.target.value)}
        placeholder={tr(
          locale,
          isSignUpMode
            ? `At least ${PASSWORD_MIN_LENGTH} characters`
            : "Enter your password",
          isSignUpMode
            ? `At least ${PASSWORD_MIN_LENGTH} characters`
            : "Enter your password",
        )}
        className="h-11 rounded-xl border-border/60 bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
      />
      {isSignUpMode ? (
        <PasswordStrengthChecklist
          score={passwordStrengthScore}
          strengthLabel={getPasswordStrengthLabel(locale, passwordStrengthScore)}
          checklistItems={signupChecklistItems}
        />
      ) : null}
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}

type ConfirmPasswordFieldProps = {
  locale: Locale;
  confirmPassword: string;
  error?: string;
  onChange: (value: string) => void;
};

export function ConfirmPasswordField({
  locale,
  confirmPassword,
  error,
  onChange,
}: ConfirmPasswordFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="confirmPassword" className="text-sm text-foreground">
        {tr(locale, "Confirm password", "Confirm password")}
      </Label>
      <Input
        id="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={event => onChange(event.target.value)}
        placeholder={tr(locale, "Repeat password", "Repeat password")}
        className="h-11 rounded-xl border-border/60 bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"
      />
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}

type EmailAuthModeLinksProps = {
  locale: Locale;
  mode: EmailAuthMode;
  onSwitchMode: (nextMode: EmailAuthMode) => void;
};

export function EmailAuthModeLinks({
  locale,
  mode,
  onSwitchMode,
}: EmailAuthModeLinksProps) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
      {mode === "sign-in" ? (
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

      {mode === "sign-up" ? (
        <button
          type="button"
          onClick={() => onSwitchMode("sign-in")}
          className="underline underline-offset-4 transition hover:text-foreground"
        >
          {tr(locale, "Already have an account? Sign in", "Already have an account? Sign in")}
        </button>
      ) : null}

      {mode === "reset-request" ? (
        <button
          type="button"
          onClick={() => onSwitchMode("sign-in")}
          className="underline underline-offset-4 transition hover:text-foreground"
        >
          {tr(locale, "Remembered your password? Sign in", "Remembered your password? Sign in")}
        </button>
      ) : null}
    </div>
  );
}

export type { EmailAuthErrors, EmailAuthValues };
