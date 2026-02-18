"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { getPasswordChecklistItems, getPasswordStrengthLabel, PasswordStrengthChecklist, } from "@/lib/auth/password-ui";
import { tr, type Locale } from "@/lib/i18n";
import { getPasswordStrengthScore, PASSWORD_MIN_LENGTH } from "@/lib/password-strength";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
const REDIRECT_DELAY_SECONDS = 5;
type ResetValues = {
    newPassword: string;
    confirmPassword: string;
};
type ResetErrors = Partial<Record<keyof ResetValues, string>>;
function validateResetValues(locale: Locale, values: ResetValues): ResetErrors {
    const errors: ResetErrors = {};
    if (!values.newPassword) {
        errors.newPassword = tr(locale, "Password is required.", "Password is required.");
    }
    else if (values.newPassword.length < PASSWORD_MIN_LENGTH) {
        errors.newPassword = tr(locale, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
    }
    if (!values.confirmPassword) {
        errors.confirmPassword = tr(locale, "Please confirm your password.", "Please confirm your password.");
    }
    else if (values.confirmPassword !== values.newPassword) {
        errors.confirmPassword = tr(locale, "Passwords do not match.", "Passwords do not match.");
    }
    return errors;
}
function hasValidationErrors(errors: ResetErrors): boolean {
    return Object.values(errors).some(Boolean);
}
export function AuthResetPasswordPanel() {
    const router = useRouter();
    const locale = useLocale();
    const { isConfigured, isLoading, user } = useSupabaseUser();
    const [isRecoveryInitializing, setIsRecoveryInitializing] = useState(true);
    const [values, setValues] = useState<ResetValues>({
        newPassword: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState<ResetErrors>({});
    const [isPending, setIsPending] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(REDIRECT_DELAY_SECONDS);
    const passwordStrengthScore = useMemo(() => getPasswordStrengthScore(values.newPassword), [values.newPassword]);
    const passwordChecklistItems = useMemo(() => getPasswordChecklistItems(locale, values.newPassword), [locale, values.newPassword]);
    useEffect(() => {
        let isMounted = true;
        async function initializeRecoverySessionFromHash() {
            const supabaseClient = createSupabaseBrowserClient();
            if (!supabaseClient || typeof window === "undefined") {
                if (isMounted) {
                    setIsRecoveryInitializing(false);
                }
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
            if (isMounted) {
                setIsRecoveryInitializing(false);
            }
        }
        void initializeRecoverySessionFromHash();
        return () => {
            isMounted = false;
        };
    }, []);
    useEffect(() => {
        if (!isCompleted) {
            return;
        }
        const countdownInterval = window.setInterval(() => {
            setSecondsLeft((previousValue) => (previousValue > 0 ? previousValue - 1 : 0));
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
        setValues((previousState) => ({
            ...previousState,
            [field]: value,
        }));
        setErrors((previousState) => {
            if (!previousState[field]) {
                return previousState;
            }
            const nextState = { ...previousState };
            delete nextState[field];
            return nextState;
        });
    }
    async function submitPasswordReset(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const supabaseClient = createSupabaseBrowserClient();
        if (!supabaseClient) {
            return;
        }
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
    if (!isConfigured) {
        return (<div className="relative overflow-hidden rounded-[1.75rem] border border-amber-300/35 bg-card p-6 shadow-[0_20px_45px_-30px_rgba(251,191,36,0.7)] sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent"/>
        <div className="relative">
          <h1 className="text-2xl font-semibold text-amber-100">
            {tr(locale, "Auth is not configured", "Auth is not configured")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-amber-50/85">
            {tr(locale, "Set NEXT_PUBLIC_SUPABASE_URL and a Supabase publishable key (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) to reset passwords.", "Set NEXT_PUBLIC_SUPABASE_URL and a Supabase publishable key (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) to reset passwords.")}
          </p>
          <Button asChild className="mt-6 h-10 rounded-xl bg-amber-300 text-primary-foreground hover:bg-amber-200">
            <Link href="/auth">{tr(locale, "Open login page", "Open login page")}</Link>
          </Button>
        </div>
      </div>);
    }
    if (isLoading || isRecoveryInitializing) {
        return (<div className="relative overflow-hidden rounded-[1.75rem] border border-blacksmith bg-card p-6 shadow-[0_24px_56px_-36px_rgba(2,6,23,0.9)] sm:p-8">
        <p className="text-sm text-muted-foreground">
          {tr(locale, "Checking recovery session...", "Checking recovery session...")}
        </p>
      </div>);
    }
    if (!user) {
        return (<div className="relative overflow-hidden rounded-[1.75rem] border border-blacksmith bg-card p-6 shadow-[0_24px_56px_-36px_rgba(2,6,23,0.9)] sm:p-8">
        <h1 className="text-2xl font-semibold text-foreground">
          {tr(locale, "Recovery session is missing", "Recovery session is missing")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {tr(locale, "Open the reset link from your email first, or request a new reset email on the login page.", "Open the reset link from your email first, or request a new reset email on the login page.")}
        </p>
        <Button asChild className="mt-6 h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary">
          <Link href="/auth">{tr(locale, "Back to login", "Back to login")}</Link>
        </Button>
      </div>);
    }
    if (isCompleted) {
        return (<section className="relative overflow-hidden rounded-[2rem] border border-blacksmith bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(2,6,23,0.98)_100%)] shadow-[0_30px_72px_-50px_rgba(2,6,23,0.95)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"/>
        <div className="relative p-6 sm:p-10">
          <span className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            {tr(locale, "Password updated", "Password updated")}
          </span>
          <div className="mt-4 flex items-center gap-3">
            <CheckCircle2 className="size-6 text-primary"/>
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
            <Button type="button" className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary" onClick={() => router.replace("/auth")}>
              {tr(locale, "Go to login now", "Go to login now")}
            </Button>
          </div>
        </div>
      </section>);
    }
    return (<section className="relative overflow-hidden rounded-[2rem] border border-blacksmith bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(2,6,23,0.98)_100%)] shadow-[0_30px_72px_-50px_rgba(2,6,23,0.95)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"/>
      <div className="relative p-6 sm:p-10">
        <span className="inline-flex rounded-full border border-primary/40 bg-card px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground">
          {tr(locale, "Password recovery", "Password recovery")}
        </span>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {tr(locale, "Set a new password", "Set a new password")}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/85 sm:text-base">
          {tr(locale, "This page is linked to your recovery email. Enter and confirm your new password.", "This page is linked to your recovery email. Enter and confirm your new password.")}
        </p>

        <form className="mt-6 grid gap-3 rounded-2xl border border-blacksmith bg-card p-4 sm:p-5" onSubmit={submitPasswordReset}>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-sm text-foreground">
              {tr(locale, "New password", "New password")}
            </Label>
            <Input id="newPassword" type="password" autoComplete="new-password" required value={values.newPassword} onChange={(event) => updateField("newPassword", event.target.value)} placeholder={tr(locale, `At least ${PASSWORD_MIN_LENGTH} characters`, `At least ${PASSWORD_MIN_LENGTH} characters`)} className="h-11 rounded-xl border-blacksmith bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"/>
            <PasswordStrengthChecklist score={passwordStrengthScore} strengthLabel={getPasswordStrengthLabel(locale, passwordStrengthScore)} checklistItems={passwordChecklistItems}/>
            {errors.newPassword ? <p className="text-xs text-rose-300">{errors.newPassword}</p> : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm text-foreground">
              {tr(locale, "Confirm password", "Confirm password")}
            </Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password" required value={values.confirmPassword} onChange={(event) => updateField("confirmPassword", event.target.value)} placeholder={tr(locale, "Repeat password", "Repeat password")} className="h-11 rounded-xl border-blacksmith bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"/>
            {errors.confirmPassword ? (<p className="text-xs text-rose-300">{errors.confirmPassword}</p>) : null}
          </div>

          <Button type="submit" disabled={isPending} className="h-11 rounded-xl bg-primary text-primary-foreground transition hover:bg-primary">
            {isPending ? <LoaderCircle className="size-4 animate-spin"/> : null}
            {tr(locale, "Update password", "Update password")}
          </Button>
        </form>

        <p className="mt-5 text-xs text-muted-foreground">
          <Link href="/auth" className="underline underline-offset-4 transition hover:text-foreground">
            {tr(locale, "Back to login", "Back to login")}
          </Link>
        </p>
      </div>
    </section>);
}

