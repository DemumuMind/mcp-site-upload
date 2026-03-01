"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getPasswordChecklistItems } from "@/lib/auth/password-ui";
import { tr, type Locale } from "@/lib/i18n";
import {
  getPasswordStrengthScore,
  PASSWORD_MIN_LENGTH,
  type PasswordStrengthScore,
} from "@/lib/password-strength";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export const REDIRECT_DELAY_SECONDS = 5;

type ResetValues = {
  newPassword: string;
  confirmPassword: string;
};

type ResetErrors = Partial<Record<keyof ResetValues, string>>;

function validateResetValues(locale: Locale, values: ResetValues): ResetErrors {
  const errors: ResetErrors = {};
  if (!values.newPassword) {
    errors.newPassword = tr(locale, "Password is required.", "Password is required.");
  } else if (values.newPassword.length < PASSWORD_MIN_LENGTH) {
    errors.newPassword = tr(
      locale,
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
    );
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = tr(locale, "Please confirm your password.", "Please confirm your password.");
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = tr(locale, "Passwords do not match.", "Passwords do not match.");
  }
  return errors;
}

function hasValidationErrors(errors: ResetErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function useResetPasswordController(locale: Locale) {
  const router = useRouter();
  const [isRecoveryInitializing, setIsRecoveryInitializing] = useState(true);
  const [values, setValues] = useState<ResetValues>({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ResetErrors>({});
  const [isPending, setIsPending] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_DELAY_SECONDS);

  const passwordStrengthScore: PasswordStrengthScore = useMemo(
    () => getPasswordStrengthScore(values.newPassword),
    [values.newPassword],
  );
  const passwordChecklistItems = useMemo(
    () => getPasswordChecklistItems(locale, values.newPassword),
    [locale, values.newPassword],
  );

  useEffect(() => {
    let isMounted = true;
    async function initializeRecoverySessionFromHash() {
      const supabaseClient = createSupabaseBrowserClient();
      if (!supabaseClient || typeof window === "undefined") {
        if (isMounted) setIsRecoveryInitializing(false);
        return;
      }
      const hash = window.location.hash;
      const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const recoveryType = hashParams.get("type");

      if (recoveryType === "recovery" && accessToken && refreshToken) {
        const { error } = await supabaseClient.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          toast.error(error.message);
        } else {
          const cleanUrl = `${window.location.pathname}${window.location.search}`;
          window.history.replaceState(null, "", cleanUrl);
        }
      }
      if (isMounted) setIsRecoveryInitializing(false);
    }
    void initializeRecoverySessionFromHash();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isCompleted) return;
    const countdownInterval = window.setInterval(() => {
      setSecondsLeft(previousValue => (previousValue > 0 ? previousValue - 1 : 0));
    }, 1000);
    const redirectTimer = window.setTimeout(() => {
      router.replace("/auth");
    }, REDIRECT_DELAY_SECONDS * 1000);
    return () => {
      window.clearInterval(countdownInterval);
      window.clearTimeout(redirectTimer);
    };
  }, [isCompleted, router]);

  function updateField(field: keyof ResetValues, value: string) {
    setValues(previousState => ({
      ...previousState,
      [field]: value,
    }));
    setErrors(previousState => {
      if (!previousState[field]) return previousState;
      const nextState = { ...previousState };
      delete nextState[field];
      return nextState;
    });
  }

  async function submitPasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabaseClient = createSupabaseBrowserClient();
    if (!supabaseClient) return;

    const validationErrors = validateResetValues(locale, values);
    if (hasValidationErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsPending(true);
    setErrors({});
    setIsCompleted(false);
    const { error } = await supabaseClient.auth.updateUser({
      password: values.newPassword,
    });
    setIsPending(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    setValues({
      newPassword: "",
      confirmPassword: "",
    });
    setSecondsLeft(REDIRECT_DELAY_SECONDS);
    setIsCompleted(true);
    toast.success(tr(locale, "Password updated.", "Password updated."));
  }

  return {
    isRecoveryInitializing,
    values,
    errors,
    isPending,
    isCompleted,
    secondsLeft,
    passwordStrengthScore,
    passwordChecklistItems,
    updateField,
    submitPasswordReset,
    goToAuth: () => router.replace("/auth"),
  };
}
