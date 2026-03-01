"use client";

import { type FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  buildAuthCallbackRedirect,
  buildCheckEmailPath,
  buildResetPasswordRedirect,
} from "@/lib/auth-redirects";
import {
  getPasswordChecklistItems,
} from "@/lib/auth/password-ui";
import { tr, type Locale } from "@/lib/i18n";
import {
  getPasswordStrengthScore,
  PASSWORD_MIN_LENGTH,
} from "@/lib/password-strength";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type EmailAuthMode = "sign-in" | "sign-up" | "reset-request";

type EmailAuthValues = {
  email: string;
  password: string;
  confirmPassword: string;
};

type EmailAuthErrors = Partial<Record<keyof EmailAuthValues, string>>;

type SecurityPrecheckResult = {
  ok: boolean;
  failedAttemptsInWindow?: number;
  maxFailedAttempts?: number;
  retryAfterSeconds?: number;
};

type SecurityLoginResult = {
  ok: boolean;
  alert?: {
    type: "failed_attempts";
    failedAttemptsInWindow: number;
    windowSeconds: number;
    threshold: number;
  } | null;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmailNotConfirmedErrorMessage(message: string | undefined): boolean {
  const normalizedMessage = message?.trim().toLowerCase();
  if (!normalizedMessage) return false;
  return (
    normalizedMessage.includes("email not confirmed") ||
    normalizedMessage.includes("email_not_confirmed")
  );
}

function isUnsupportedOAuthProviderErrorMessage(message: string | undefined): boolean {
  const normalizedMessage = message?.trim().toLowerCase();
  if (!normalizedMessage) return false;
  return (
    normalizedMessage.includes("unsupported provider") ||
    normalizedMessage.includes("provider is not enabled")
  );
}

function validateEmailAuthValues(
  locale: Locale,
  values: EmailAuthValues,
  mode: EmailAuthMode,
): EmailAuthErrors {
  const errors: EmailAuthErrors = {};
  const trimmedEmail = values.email.trim();

  if (!trimmedEmail) {
    errors.email = tr(locale, "Email is required.", "Email is required.");
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = tr(
      locale,
      "Enter a valid email address.",
      "Enter a valid email address.",
    );
  }

  if (mode === "sign-in" || mode === "sign-up") {
    if (!values.password) {
      errors.password = tr(locale, "Password is required.", "Password is required.");
    }
  }

  if (mode === "sign-up") {
    if (values.password.length < PASSWORD_MIN_LENGTH) {
      errors.password = tr(
        locale,
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
      );
    }
    if (!values.confirmPassword) {
      errors.confirmPassword = tr(
        locale,
        "Please confirm your password.",
        "Please confirm your password.",
      );
    } else if (values.confirmPassword !== values.password) {
      errors.confirmPassword = tr(
        locale,
        "Passwords do not match.",
        "Passwords do not match.",
      );
    }
  }

  return errors;
}

function hasValidationErrors(errors: EmailAuthErrors): boolean {
  return Object.values(errors).some(Boolean);
}

async function runLoginSecurityPrecheck(
  email: string,
): Promise<SecurityPrecheckResult | null> {
  try {
    const response = await fetch("/api/auth/security", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "precheck", email }),
    });
    if (!response.ok) return null;
    return (await response.json()) as SecurityPrecheckResult;
  } catch {
    return null;
  }
}

async function reportLoginSecurityResult(input: {
  email: string;
  success: boolean;
  userId?: string | null;
  reason?: string;
}): Promise<SecurityLoginResult | null> {
  try {
    const response = await fetch("/api/auth/security", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "login-result",
        email: input.email,
        success: input.success,
        userId: input.userId ?? null,
        reason: input.reason,
      }),
    });
    if (!response.ok) return null;
    return (await response.json()) as SecurityLoginResult;
  } catch {
    return null;
  }
}

export function useEmailAuthController({
  locale,
  safeNextPath,
}: {
  locale: Locale;
  safeNextPath: string;
}) {
  const [pendingOAuthProvider, setPendingOAuthProvider] = useState<
    "google" | "github" | null
  >(null);
  const [isEmailPending, setIsEmailPending] = useState(false);
  const [emailAuthMode, setEmailAuthMode] = useState<EmailAuthMode>("sign-in");
  const [emailAuthValues, setEmailAuthValues] = useState<EmailAuthValues>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [emailAuthErrors, setEmailAuthErrors] = useState<EmailAuthErrors>({});
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [oauthProviderMessage, setOauthProviderMessage] = useState<string | null>(
    null,
  );

  const emailPasswordStrengthScore = useMemo(
    () => getPasswordStrengthScore(emailAuthValues.password),
    [emailAuthValues.password],
  );
  const signupChecklistItems: ReturnType<typeof getPasswordChecklistItems> =
    useMemo(
    () => getPasswordChecklistItems(locale, emailAuthValues.password),
    [locale, emailAuthValues.password],
  );

  const isSignUpMode = emailAuthMode === "sign-up";
  const isResetRequestMode = emailAuthMode === "reset-request";

  function getOAuthRedirectTo(): string | undefined {
    if (typeof window === "undefined") return undefined;
    return buildAuthCallbackRedirect(window.location.origin, safeNextPath);
  }

  function getEmailSignupRedirectTo(): string | undefined {
    if (typeof window === "undefined") return undefined;
    return `${window.location.origin}/auth?next=${encodeURIComponent(safeNextPath)}`;
  }

  function getResetRedirectTo(): string | undefined {
    if (typeof window === "undefined") return undefined;
    return buildResetPasswordRedirect(window.location.origin);
  }

  function getCheckEmailPath(flow: "signup" | "reset", email: string): string {
    return buildCheckEmailPath({ flow, email, nextPath: safeNextPath });
  }

  function updateEmailField(field: keyof EmailAuthValues, value: string) {
    setEmailAuthValues((previousState) => ({ ...previousState, [field]: value }));
    setEmailAuthErrors((previousState) => {
      if (!previousState[field]) return previousState;
      const nextState = { ...previousState };
      delete nextState[field];
      return nextState;
    });
  }

  function switchEmailAuthMode(nextMode: EmailAuthMode) {
    setEmailAuthMode(nextMode);
    setEmailAuthErrors({});
    setEmailMessage(null);
    if (nextMode === "reset-request") {
      setEmailAuthValues((previousState) => ({
        ...previousState,
        password: "",
        confirmPassword: "",
      }));
      return;
    }
    if (nextMode === "sign-in") {
      setEmailAuthValues((previousState) => ({
        ...previousState,
        confirmPassword: "",
      }));
    }
  }

  async function signInWithProvider(provider: "google" | "github") {
    const supabaseClient = createSupabaseBrowserClient();
    if (!supabaseClient) return;

    setPendingOAuthProvider(provider);
    setEmailMessage(null);
    setOauthProviderMessage(null);

    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider,
      options: { redirectTo: getOAuthRedirectTo() },
    });

    if (!error) return;

    if (isUnsupportedOAuthProviderErrorMessage(error.message)) {
      const providerLabel = provider === "google" ? "Google" : "GitHub";
      const details = tr(
        locale,
        `${providerLabel} login is not enabled in Supabase Auth providers for this project. Enable the provider in Supabase Dashboard -> Authentication -> Providers, then retry.`,
        `${providerLabel} login is not enabled in Supabase Auth providers for this project. Enable the provider in Supabase Dashboard -> Authentication -> Providers, then retry.`,
      );
      setOauthProviderMessage(details);
      toast.error(details);
    } else {
      toast.error(error.message);
    }

    setPendingOAuthProvider(null);
  }

  async function submitEmailAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabaseClient = createSupabaseBrowserClient();
    if (!supabaseClient) return;

    const normalizedValues: EmailAuthValues = {
      ...emailAuthValues,
      email: emailAuthValues.email.trim(),
    };

    const validationErrors = validateEmailAuthValues(
      locale,
      normalizedValues,
      emailAuthMode,
    );
    if (hasValidationErrors(validationErrors)) {
      setEmailAuthErrors(validationErrors);
      return;
    }

    setIsEmailPending(true);
    setEmailAuthErrors({});
    setEmailMessage(null);

    if (emailAuthMode === "sign-in") {
      const precheckResult = await runLoginSecurityPrecheck(normalizedValues.email);
      if (precheckResult && !precheckResult.ok) {
        setIsEmailPending(false);
        const retryAfterSeconds = precheckResult.retryAfterSeconds ?? 0;
        const blockMessage = tr(
          locale,
          `Too many failed login attempts. Try again in ${retryAfterSeconds} seconds.`,
          `Too many failed login attempts. Try again in ${retryAfterSeconds} seconds.`,
        );
        setEmailMessage(blockMessage);
        toast.error(blockMessage);
        return;
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: normalizedValues.email,
        password: normalizedValues.password,
      });
      setIsEmailPending(false);

      if (error) {
        const securityResult = await reportLoginSecurityResult({
          email: normalizedValues.email,
          success: false,
          reason: error.message,
        });
        if (securityResult?.alert?.type === "failed_attempts") {
          const loginAlertMessage = tr(
            locale,
            `Security alert: ${securityResult.alert.failedAttemptsInWindow} failed login attempts in the last 15 minutes.`,
            `Security alert: ${securityResult.alert.failedAttemptsInWindow} failed login attempts in the last 15 minutes.`,
          );
          setEmailMessage(loginAlertMessage);
          toast.error(loginAlertMessage);
        }
        if (isEmailNotConfirmedErrorMessage(error.message)) {
          const confirmEmailMessage = tr(
            locale,
            "Email is not confirmed yet. Check your inbox or request another confirmation email.",
            "Email is not confirmed yet. Check your inbox or request another confirmation email.",
          );
          setEmailMessage(confirmEmailMessage);
          toast.error(confirmEmailMessage);
          if (typeof window !== "undefined") {
            window.location.assign(getCheckEmailPath("signup", normalizedValues.email));
          }
          return;
        }
        toast.error(error.message);
        return;
      }

      await reportLoginSecurityResult({
        email: normalizedValues.email,
        success: true,
        userId: data.user?.id ?? null,
      });
      toast.success(tr(locale, "Signed in successfully.", "Signed in successfully."));
      if (typeof window !== "undefined") window.location.assign(safeNextPath);
      return;
    }

    if (emailAuthMode === "sign-up") {
      const { data, error } = await supabaseClient.auth.signUp({
        email: normalizedValues.email,
        password: normalizedValues.password,
        options: { emailRedirectTo: getEmailSignupRedirectTo() },
      });
      setIsEmailPending(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      setEmailAuthValues((previousState) => ({
        ...previousState,
        password: "",
        confirmPassword: "",
      }));
      if (data.session) {
        toast.success(tr(locale, "Account created successfully.", "Account created successfully."));
        if (typeof window !== "undefined") window.location.assign(safeNextPath);
        return;
      }
      toast.success(tr(locale, "Confirmation email sent.", "Confirmation email sent."));
      if (typeof window !== "undefined") {
        window.location.assign(getCheckEmailPath("signup", normalizedValues.email));
      }
      return;
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(
      normalizedValues.email,
      { redirectTo: getResetRedirectTo() },
    );
    setIsEmailPending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(tr(locale, "Reset email sent.", "Reset email sent."));
    if (typeof window !== "undefined") {
      window.location.assign(getCheckEmailPath("reset", normalizedValues.email));
    }
  }

  async function signOut() {
    const supabaseClient = createSupabaseBrowserClient();
    if (!supabaseClient) return;
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(tr(locale, "Signed out", "Signed out"));
  }

  return {
    emailAuthMode,
    emailAuthValues,
    emailAuthErrors,
    emailMessage,
    oauthProviderMessage,
    pendingOAuthProvider,
    isEmailPending,
    isSignUpMode,
    isResetRequestMode,
    emailPasswordStrengthScore,
    signupChecklistItems,
    updateEmailField,
    switchEmailAuthMode,
    signInWithProvider,
    submitEmailAuth,
    signOut,
    getCheckEmailPath,
  };
}
