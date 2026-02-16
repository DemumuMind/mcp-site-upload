"use client";
import Link from "next/link";
import { type FormEvent, useMemo, useState, useSyncExternalStore } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { buildAuthCallbackRedirect, buildCheckEmailPath, buildResetPasswordRedirect, normalizeInternalPath, } from "@/lib/auth-redirects";
import { tr, type Locale } from "@/lib/i18n";
import { getPasswordRuleChecks, getPasswordStrengthScore, PASSWORD_MIN_LENGTH, type PasswordStrengthScore, } from "@/lib/password-strength";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
type AuthSignInPanelProps = {
    nextPath: string;
    errorCode?: string;
};
type EmailAuthMode = "sign-in" | "sign-up" | "reset-request";
type EmailAuthValues = {
    email: string;
    password: string;
    confirmPassword: string;
};
type EmailAuthErrors = Partial<Record<keyof EmailAuthValues, string>>;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isEmailNotConfirmedErrorMessage(message: string | undefined): boolean {
    const normalizedMessage = message?.trim().toLowerCase();
    if (!normalizedMessage) {
        return false;
    }
    return (normalizedMessage.includes("email not confirmed") ||
        normalizedMessage.includes("email_not_confirmed"));
}
function isUnsupportedOAuthProviderErrorMessage(message: string | undefined): boolean {
    const normalizedMessage = message?.trim().toLowerCase();
    if (!normalizedMessage) {
        return false;
    }
    return normalizedMessage.includes("unsupported provider") || normalizedMessage.includes("provider is not enabled");
}
function getAuthErrorMessage(locale: Locale, errorCode?: string): string | null {
    if (!errorCode) {
        return null;
    }
    if (errorCode === "missing_code") {
        return tr(locale, "Authentication code is missing. Please try signing in again.", "Authentication code is missing. Please try signing in again.");
    }
    if (errorCode === "callback_error") {
        return tr(locale, "Sign-in callback failed or link has expired. Start a new sign-in attempt.", "Sign-in callback failed or link has expired. Start a new sign-in attempt.");
    }
    if (errorCode === "config_error") {
        return tr(locale, "Auth callback is not configured. Check Supabase environment variables.", "Auth callback is not configured. Check Supabase environment variables.");
    }
    return tr(locale, "Authentication failed. Please try again.", "Authentication failed. Please try again.");
}
function validateEmailAuthValues(locale: Locale, values: EmailAuthValues, mode: EmailAuthMode): EmailAuthErrors {
    const errors: EmailAuthErrors = {};
    const trimmedEmail = values.email.trim();
    if (!trimmedEmail) {
        errors.email = tr(locale, "Email is required.", "Email is required.");
    }
    else if (!EMAIL_PATTERN.test(trimmedEmail)) {
        errors.email = tr(locale, "Enter a valid email address.", "Enter a valid email address.");
    }
    if (mode === "sign-in" || mode === "sign-up") {
        if (!values.password) {
            errors.password = tr(locale, "Password is required.", "Password is required.");
        }
    }
    if (mode === "sign-up") {
        if (values.password.length < PASSWORD_MIN_LENGTH) {
            errors.password = tr(locale, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
        }
        if (!values.confirmPassword) {
            errors.confirmPassword = tr(locale, "Please confirm your password.", "Please confirm your password.");
        }
        else if (values.confirmPassword !== values.password) {
            errors.confirmPassword = tr(locale, "Passwords do not match.", "Passwords do not match.");
        }
    }
    return errors;
}
function hasValidationErrors(errors: EmailAuthErrors): boolean {
    return Object.values(errors).some(Boolean);
}
function getStrengthLabel(locale: Locale, score: PasswordStrengthScore): string {
    if (score <= 1) {
        return tr(locale, "Weak password", "Weak password");
    }
    if (score === 2) {
        return tr(locale, "Medium password", "Medium password");
    }
    if (score === 3) {
        return tr(locale, "Good password", "Good password");
    }
    return tr(locale, "Strong password", "Strong password");
}
function getStrengthColorClass(score: PasswordStrengthScore): string {
    if (score <= 1) {
        return "bg-rose-400/90";
    }
    if (score === 2) {
        return "bg-amber-400/90";
    }
    if (score === 3) {
        return "bg-sky-400/90";
    }
    return "bg-emerald-400/90";
}
function getStrengthTextClass(score: PasswordStrengthScore): string {
    if (score <= 1) {
        return "text-rose-300";
    }
    if (score === 2) {
        return "text-amber-300";
    }
    if (score === 3) {
        return "text-sky-300";
    }
    return "text-emerald-300";
}
function getPasswordChecklistItems(locale: Locale, password: string) {
    const checks = getPasswordRuleChecks(password);
    return [
        {
            key: "length",
            passed: checks.minLength,
            label: tr(locale, `At least ${PASSWORD_MIN_LENGTH} characters`, `At least ${PASSWORD_MIN_LENGTH} characters`),
        },
        {
            key: "lowercase",
            passed: checks.hasLowercase,
            label: tr(locale, "At least one lowercase letter", "At least one lowercase letter"),
        },
        {
            key: "uppercase",
            passed: checks.hasUppercase,
            label: tr(locale, "At least one uppercase letter", "At least one uppercase letter"),
        },
        {
            key: "number",
            passed: checks.hasNumber,
            label: tr(locale, "At least one number", "At least one number"),
        },
        {
            key: "symbol",
            passed: checks.hasSymbol,
            label: tr(locale, "At least one symbol", "At least one symbol"),
        },
    ] as const;
}
export function AuthSignInPanel({ nextPath, errorCode }: AuthSignInPanelProps) {
    const locale = useLocale();
    const hasMounted = useSyncExternalStore((onStoreChange) => {
        onStoreChange();
        return () => undefined;
    }, () => true, () => false);
    const safeNextPath = useMemo(() => normalizeInternalPath(nextPath), [nextPath]);
    const callbackErrorMessage = useMemo(() => getAuthErrorMessage(locale, errorCode), [errorCode, locale]);
    const { isConfigured, isLoading, user } = useSupabaseUser();
    const [pendingOAuthProvider, setPendingOAuthProvider] = useState<"google" | "github" | null>(null);
    const [isEmailPending, setIsEmailPending] = useState(false);
    const [emailAuthMode, setEmailAuthMode] = useState<EmailAuthMode>("sign-in");
    const [emailAuthValues, setEmailAuthValues] = useState<EmailAuthValues>({
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [emailAuthErrors, setEmailAuthErrors] = useState<EmailAuthErrors>({});
    const [emailMessage, setEmailMessage] = useState<string | null>(null);
    const [oauthProviderMessage, setOauthProviderMessage] = useState<string | null>(null);
    const emailPasswordStrengthScore = useMemo(() => getPasswordStrengthScore(emailAuthValues.password), [emailAuthValues.password]);
    const signupChecklistItems = useMemo(() => getPasswordChecklistItems(locale, emailAuthValues.password), [locale, emailAuthValues.password]);
    const oauthButtonClass = "h-12 w-full justify-start rounded-xl border border-indigo-600/65 bg-indigo-900/75 px-4 text-left text-sm font-semibold text-violet-50 transition hover:border-violet-300/70 hover:bg-indigo-900 focus-visible:ring-violet-200/40";
    const primaryActionButtonClass = "h-11 w-full rounded-xl bg-violet-50 text-indigo-950 transition hover:bg-white";
    function getOAuthOrSignupRedirectTo(): string | undefined {
        if (typeof window === "undefined") {
            return undefined;
        }
        return buildAuthCallbackRedirect(window.location.origin, safeNextPath);
    }
    function getResetRedirectTo(): string | undefined {
        if (typeof window === "undefined") {
            return undefined;
        }
        return buildResetPasswordRedirect(window.location.origin);
    }
    function getCheckEmailPath(flow: "signup" | "reset", email: string): string {
        return buildCheckEmailPath({
            flow,
            email,
            nextPath: safeNextPath,
        });
    }
    function updateEmailField(field: keyof EmailAuthValues, value: string) {
        setEmailAuthValues((previousState) => ({
            ...previousState,
            [field]: value,
        }));
        setEmailAuthErrors((previousState) => {
            if (!previousState[field]) {
                return previousState;
            }
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
        if (!supabaseClient) {
            return;
        }
        setPendingOAuthProvider(provider);
        setEmailMessage(null);
        setOauthProviderMessage(null);
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: getOAuthOrSignupRedirectTo(),
            },
        });
        if (error) {
            if (isUnsupportedOAuthProviderErrorMessage(error.message)) {
                const providerLabel = provider === "google" ? "Google" : "GitHub";
                const details = tr(locale, `${providerLabel} login is not enabled in Supabase Auth providers for this project. Enable the provider in Supabase Dashboard -> Authentication -> Providers, then retry.`, `${providerLabel} login is not enabled in Supabase Auth providers for this project. Enable the provider in Supabase Dashboard -> Authentication -> Providers, then retry.`);
                setOauthProviderMessage(details);
                toast.error(details);
            }
            else {
                toast.error(error.message);
            }
            setPendingOAuthProvider(null);
        }
    }
    async function submitEmailAuth(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const supabaseClient = createSupabaseBrowserClient();
        if (!supabaseClient) {
            return;
        }
        const normalizedValues: EmailAuthValues = {
            ...emailAuthValues,
            email: emailAuthValues.email.trim(),
        };
        const validationErrors = validateEmailAuthValues(locale, normalizedValues, emailAuthMode);
        if (hasValidationErrors(validationErrors)) {
            setEmailAuthErrors(validationErrors);
            return;
        }
        setIsEmailPending(true);
        setEmailAuthErrors({});
        setEmailMessage(null);
        if (emailAuthMode === "sign-in") {
            const { error } = await supabaseClient.auth.signInWithPassword({
                email: normalizedValues.email,
                password: normalizedValues.password,
            });
            setIsEmailPending(false);
            if (error) {
                if (isEmailNotConfirmedErrorMessage(error.message)) {
                    const confirmEmailMessage = tr(locale, "Email is not confirmed yet. Check your inbox or request another confirmation email.", "Email is not confirmed yet. Check your inbox or request another confirmation email.");
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
            toast.success(tr(locale, "Signed in successfully.", "Signed in successfully."));
            if (typeof window !== "undefined") {
                window.location.assign(safeNextPath);
            }
            return;
        }
        if (emailAuthMode === "sign-up") {
            const { data, error } = await supabaseClient.auth.signUp({
                email: normalizedValues.email,
                password: normalizedValues.password,
                options: {
                    emailRedirectTo: getOAuthOrSignupRedirectTo(),
                },
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
                if (typeof window !== "undefined") {
                    window.location.assign(safeNextPath);
                }
                return;
            }
            toast.success(tr(locale, "Confirmation email sent.", "Confirmation email sent."));
            if (typeof window !== "undefined") {
                window.location.assign(getCheckEmailPath("signup", normalizedValues.email));
            }
            return;
        }
        const { error } = await supabaseClient.auth.resetPasswordForEmail(normalizedValues.email, {
            redirectTo: getResetRedirectTo(),
        });
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
        if (!supabaseClient) {
            return;
        }
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            toast.error(error.message);
            return;
        }
        toast.success(tr(locale, "Signed out", "Signed out"));
    }
    if (!hasMounted) {
        return (<section className="relative overflow-hidden rounded-[2rem] border border-indigo-700/80 bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(2,6,23,0.98)_100%)] shadow-[0_30px_72px_-50px_rgba(2,6,23,0.95)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/35 to-transparent"/>
        <div className="relative p-6 sm:p-10">
          <span className="inline-flex rounded-full border border-violet-400/65 bg-indigo-900/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-100">
            {tr(locale, "Secure access", "Secure access")}
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-violet-50 sm:text-4xl">
            {tr(locale, "Welcome to DemumuMind MCP", "Welcome to DemumuMind MCP")}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-violet-100/85 sm:text-base">
            {tr(locale, "Loading sign-in panel…", "Loading sign-in panel…")}
          </p>
        </div>
      </section>);
    }
    if (!isConfigured) {
        return (<div className="relative overflow-hidden rounded-[1.75rem] border border-amber-300/35 bg-indigo-950 p-6 shadow-[0_20px_45px_-30px_rgba(251,191,36,0.7)] sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent"/>
        <div className="relative">
          <h1 className="text-2xl font-semibold text-amber-100">
            {tr(locale, "Auth is not configured", "Auth is not configured")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-amber-50/85">
            {tr(locale, "Set NEXT_PUBLIC_SUPABASE_URL and a Supabase publishable key (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) to enable login.", "Set NEXT_PUBLIC_SUPABASE_URL and a Supabase publishable key (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) to enable login.")}
          </p>
          <Button asChild className="mt-6 h-10 rounded-xl bg-amber-300 text-indigo-950 hover:bg-amber-200">
            <Link href="/">{tr(locale, "Back to catalog", "Back to catalog")}</Link>
          </Button>
        </div>
      </div>);
    }
    if (user) {
        return (<div className="relative overflow-hidden rounded-[1.75rem] border border-indigo-700/80 bg-indigo-950 p-6 shadow-[0_24px_56px_-36px_rgba(2,6,23,0.9)] sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/30 to-transparent"/>
        <div className="relative">
          <h1 className="text-2xl font-semibold text-violet-50">
            {tr(locale, "You are signed in", "You are signed in")}
          </h1>
          <p className="mt-2 text-sm text-violet-200">
            {tr(locale, "Account:", "Account:")}{" "}
            <span className="font-medium text-violet-50">
              {user.email || tr(locale, "authenticated user", "authenticated user")}
            </span>
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="h-10 rounded-xl bg-violet-50 text-indigo-950 hover:bg-white">
              <Link href={safeNextPath}>{tr(locale, "Continue", "Continue")}</Link>
            </Button>
            <Button type="button" variant="outline" onClick={() => {
                void signOut();
            }} className="h-10 rounded-xl border-indigo-600/70 bg-indigo-900/70 hover:bg-indigo-900">
              {tr(locale, "Sign out", "Sign out")}
            </Button>
          </div>
        </div>
      </div>);
    }
    const isSignUpMode = emailAuthMode === "sign-up";
    const isResetRequestMode = emailAuthMode === "reset-request";
    return (<section className="relative overflow-hidden rounded-[2rem] border border-indigo-700/80 bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(2,6,23,0.98)_100%)] shadow-[0_30px_72px_-50px_rgba(2,6,23,0.95)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/35 to-transparent"/>
      <div className="relative p-6 sm:p-10">
        <span className="inline-flex rounded-full border border-violet-400/65 bg-indigo-900/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-100">
          {tr(locale, "Secure access", "Secure access")}
        </span>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-violet-50 sm:text-4xl">
          {tr(locale, "Welcome to DemumuMind MCP", "Welcome to DemumuMind MCP")}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-violet-100/85 sm:text-base">
          {tr(locale, "Sign in to submit MCP servers and manage your integrations.", "Sign in to submit MCP servers and manage your integrations.")}
        </p>

        {callbackErrorMessage ? (<p className="mt-5 rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-100">
            {callbackErrorMessage}
          </p>) : null}
        {oauthProviderMessage ? (<p className="mt-3 rounded-xl border border-amber-300/45 bg-amber-400/10 px-3 py-2.5 text-sm text-amber-100">
            {oauthProviderMessage}
          </p>) : null}

        {isLoading ? (<p className="mt-3 text-xs text-violet-200/70">
            {tr(locale, "Checking your session...", "Checking your session...")}
          </p>) : null}

        <div className="mt-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-300">
            {tr(locale, "Continue with social login", "Continue with social login")}
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="outline" onClick={() => {
            void signInWithProvider("google");
        }} disabled={pendingOAuthProvider !== null || isEmailPending} className={oauthButtonClass}>
              {pendingOAuthProvider === "google" ? (<LoaderCircle className="size-4 animate-spin"/>) : (<span className="inline-flex size-6 items-center justify-center rounded-full border border-violet-400/70 bg-indigo-800 text-xs font-bold text-violet-100">
                  G
                </span>)}
              <span>{tr(locale, "Continue with Google", "Continue with Google")}</span>
            </Button>

            <Button type="button" variant="outline" onClick={() => {
            void signInWithProvider("github");
        }} disabled={pendingOAuthProvider !== null || isEmailPending} className={oauthButtonClass}>
              {pendingOAuthProvider === "github" ? (<LoaderCircle className="size-4 animate-spin"/>) : (<span className="inline-flex size-6 items-center justify-center rounded-full border border-violet-400/70 bg-indigo-800 text-[10px] font-bold text-violet-100">
                  GH
                </span>)}
              <span>{tr(locale, "Continue with GitHub", "Continue with GitHub")}</span>
            </Button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-indigo-700/80 bg-indigo-950/70 p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-300">
            {isSignUpMode
            ? tr(locale, "Register with email", "Register with email")
            : isResetRequestMode
                ? tr(locale, "Password reset", "Password reset")
                : tr(locale, "Login with email", "Login with email")}
          </p>

          <form className="mt-4 grid gap-3" onSubmit={submitEmailAuth}>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-violet-100">
                Email
              </Label>
              <Input id="email" type="email" autoComplete="email" required value={emailAuthValues.email} onChange={(event) => updateEmailField("email", event.target.value)} placeholder="you@example.com" className="h-11 rounded-xl border-indigo-600 bg-indigo-900/90 text-violet-50 placeholder:text-violet-400 focus-visible:ring-violet-200/35"/>
              {emailAuthErrors.email ? (<p className="text-xs text-rose-300">{emailAuthErrors.email}</p>) : null}
            </div>

            {!isResetRequestMode ? (<div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm text-violet-100">
                  {tr(locale, "Password", "Password")}
                </Label>
                <Input id="password" type="password" autoComplete={isSignUpMode ? "new-password" : "current-password"} required value={emailAuthValues.password} onChange={(event) => updateEmailField("password", event.target.value)} placeholder={tr(locale, isSignUpMode
                ? `At least ${PASSWORD_MIN_LENGTH} characters`
                : "Enter your password", isSignUpMode
                ? `At least ${PASSWORD_MIN_LENGTH} characters`
                : "Enter your password")} className="h-11 rounded-xl border-indigo-600 bg-indigo-900/90 text-violet-50 placeholder:text-violet-400 focus-visible:ring-violet-200/35"/>
                {isSignUpMode ? (<div className="space-y-1.5">
                    <div className="grid grid-cols-4 gap-1">
                      {[0, 1, 2, 3].map((index) => (<span key={index} className={`h-1.5 rounded-full ${index < emailPasswordStrengthScore
                        ? getStrengthColorClass(emailPasswordStrengthScore)
                        : "bg-indigo-700/80"}`}/>))}
                    </div>
                    <p className={`text-xs ${getStrengthTextClass(emailPasswordStrengthScore)}`}>
                      {getStrengthLabel(locale, emailPasswordStrengthScore)}
                    </p>
                    <ul className="space-y-1 text-xs">
                      {signupChecklistItems.map((item) => (<li key={item.key} className={`flex items-center gap-2 ${item.passed ? "text-emerald-300" : "text-violet-300"}`}>
                          <span className={`inline-flex size-4 items-center justify-center rounded-full border text-[10px] ${item.passed
                        ? "border-emerald-400/60 bg-emerald-400/20"
                        : "border-indigo-600/80 bg-indigo-800/80"}`}>
                            {item.passed ? "✓" : "•"}
                          </span>
                          <span>{item.label}</span>
                        </li>))}
                    </ul>
                  </div>) : null}
                {emailAuthErrors.password ? (<p className="text-xs text-rose-300">{emailAuthErrors.password}</p>) : null}
              </div>) : null}

            {isSignUpMode ? (<div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm text-violet-100">
                  {tr(locale, "Confirm password", "Confirm password")}
                </Label>
                <Input id="confirmPassword" type="password" autoComplete="new-password" required value={emailAuthValues.confirmPassword} onChange={(event) => updateEmailField("confirmPassword", event.target.value)} placeholder={tr(locale, "Repeat password", "Repeat password")} className="h-11 rounded-xl border-indigo-600 bg-indigo-900/90 text-violet-50 placeholder:text-violet-400 focus-visible:ring-violet-200/35"/>
                {emailAuthErrors.confirmPassword ? (<p className="text-xs text-rose-300">{emailAuthErrors.confirmPassword}</p>) : null}
              </div>) : null}

            <Button type="submit" disabled={isEmailPending || pendingOAuthProvider !== null} className={primaryActionButtonClass}>
              {isEmailPending ? <LoaderCircle className="size-4 animate-spin"/> : null}
              {isSignUpMode
            ? tr(locale, "Create account", "Create account")
            : isResetRequestMode
                ? tr(locale, "Send reset email", "Send reset email")
                : tr(locale, "Sign in", "Sign in")}
            </Button>
          </form>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-violet-200">
            {emailAuthMode === "sign-in" ? (<>
                <button type="button" onClick={() => switchEmailAuthMode("sign-up")} className="underline underline-offset-4 transition hover:text-white">
                  {tr(locale, "No account? Sign up", "No account? Sign up")}
                </button>
                <button type="button" onClick={() => switchEmailAuthMode("reset-request")} className="underline underline-offset-4 transition hover:text-white">
                  {tr(locale, "Forgot password?", "Forgot password?")}
                </button>
              </>) : null}

            {emailAuthMode === "sign-up" ? (<button type="button" onClick={() => switchEmailAuthMode("sign-in")} className="underline underline-offset-4 transition hover:text-white">
                {tr(locale, "Already have an account? Sign in", "Already have an account? Sign in")}
              </button>) : null}

            {emailAuthMode === "reset-request" ? (<button type="button" onClick={() => switchEmailAuthMode("sign-in")} className="underline underline-offset-4 transition hover:text-white">
                {tr(locale, "Remembered your password? Sign in", "Remembered your password? Sign in")}
              </button>) : null}
          </div>
        </div>

        {emailMessage ? (<p className="mt-4 rounded-xl border border-emerald-300/35 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-100">
            {emailMessage}
          </p>) : null}

        <p className="mt-6 border-t border-indigo-700/80 pt-4 text-xs leading-6 text-violet-300">
          {tr(locale, "By signing in, you agree to our", "By signing in, you agree to our")}{" "}
          <Link href="/terms" className="font-semibold text-violet-100 underline underline-offset-4 transition hover:text-white">
            {tr(locale, "Terms", "Terms")}
          </Link>{" "}
          {tr(locale, "and", "and")}{" "}
          <Link href="/privacy" className="font-semibold text-violet-100 underline underline-offset-4 transition hover:text-white">
            {tr(locale, "Privacy Policy", "Privacy Policy")}
          </Link>
          .
        </p>
      </div>
    </section>);
}
