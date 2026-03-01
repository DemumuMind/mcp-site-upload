"use client";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { LoaderCircle } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { AuthStatusCard } from "@/components/auth-status-card";
import { useEmailAuthController } from "@/components/auth-sign-in-panel/use-email-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { getPasswordStrengthLabel, PasswordStrengthChecklist, } from "@/lib/auth/password-ui";
import { normalizeInternalPath } from "@/lib/auth-redirects";
import { tr, type Locale } from "@/lib/i18n";
import { PASSWORD_MIN_LENGTH } from "@/lib/password-strength";
type AuthSignInPanelProps = {
    nextPath: string;
    errorCode?: string;
    authErrorCode?: string;
    authErrorDescription?: string;
};
function getAuthErrorMessage(locale: Locale, errorCode?: string, authErrorCode?: string, authErrorDescription?: string): string | null {
    if (authErrorCode === "otp_expired") {
        return tr(locale, "This email link has expired or was already used. Request a new confirmation/reset email and open the latest one.", "This email link has expired or was already used. Request a new confirmation/reset email and open the latest one.");
    }
    if (authErrorCode === "access_denied") {
        return tr(locale, "Access denied for this auth link. Please start sign-in again and use the newest email link.", "Access denied for this auth link. Please start sign-in again and use the newest email link.");
    }
    if (authErrorDescription?.trim()) {
        return authErrorDescription.replace(/\+/g, " ");
    }
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
type OAuthProviderButtonProps = {
    provider: "google" | "github";
    pendingOAuthProvider: "google" | "github" | null;
    isEmailPending: boolean;
    onSignIn: (provider: "google" | "github") => void;
    buttonClassName: string;
    label: string;
    icon: string;
    iconClassName?: string;
};
function OAuthProviderButton({ provider, pendingOAuthProvider, isEmailPending, onSignIn, buttonClassName, label, icon, iconClassName, }: OAuthProviderButtonProps) {
    return (<Button type="button" variant="outline" onClick={() => onSignIn(provider)} disabled={pendingOAuthProvider !== null || isEmailPending} className={buttonClassName}>
      {pendingOAuthProvider === provider ? (<LoaderCircle className="size-4 animate-spin"/>) : (<span className={`inline-flex size-6 items-center justify-center rounded-full border border-border/60 bg-card font-bold text-foreground ${iconClassName ?? "text-xs"}`}>
          {icon}
        </span>)}
      <span>{label}</span>
    </Button>);
}
function AuthHeroIntro({ locale, description }: {
    locale: Locale;
    description: string;
}) {
    return (<>
      <span className="inline-flex rounded-full border border-primary/40 bg-card px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground">
        {tr(locale, "Secure access", "Secure access")}
      </span>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {tr(locale, "Welcome to DemumuMind MCP", "Welcome to DemumuMind MCP")}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/85 sm:text-base">
        {description}
      </p>
    </>);
}
export function AuthSignInPanel({ nextPath, errorCode, authErrorCode, authErrorDescription }: AuthSignInPanelProps) {
    const locale = useLocale();
    const hasMounted = useSyncExternalStore((onStoreChange) => {
        onStoreChange();
        return () => undefined;
    }, () => true, () => false);
    const safeNextPath = useMemo(() => normalizeInternalPath(nextPath), [nextPath]);
    const callbackErrorMessage = useMemo(() => getAuthErrorMessage(locale, errorCode, authErrorCode, authErrorDescription), [authErrorCode, authErrorDescription, errorCode, locale]);
    const isEmailLinkError = authErrorCode === "otp_expired" || authErrorCode === "access_denied";
    const { isConfigured, isLoading, user } = useSupabaseUser();
    const {
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
    } = useEmailAuthController({
        locale,
        safeNextPath,
    });
    const oauthButtonClass = "h-12 w-full justify-start rounded-xl border border-border/60 bg-card px-4 text-left text-sm font-semibold text-foreground transition hover:border-primary/50 hover:bg-accent focus-visible:ring-primary/40";
    const primaryActionButtonClass = "h-11 w-full rounded-xl bg-primary text-primary-foreground transition hover:bg-primary/90";
    if (!hasMounted) {
        return (<section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-[0_24px_56px_-36px_hsl(var(--foreground)/0.35)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"/>
        <div className="relative p-6 sm:p-10">
          <AuthHeroIntro locale={locale} description={tr(locale, "Loading sign-in panel...", "Loading sign-in panel...")}/>
        </div>
      </section>);
    }
    if (!isConfigured) {
        return (<AuthStatusCard containerClassName="rounded-[1.75rem] border border-amber-300/35 bg-card shadow-[0_20px_45px_-30px_rgba(251,191,36,0.7)]" topBorderClassName="bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" title={tr(locale, "Auth is not configured", "Auth is not configured")} titleClassName="text-2xl font-semibold text-amber-100" message={tr(locale, "Set NEXT_PUBLIC_SUPABASE_URL and a Supabase publishable key (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) to enable login.", "Set NEXT_PUBLIC_SUPABASE_URL and a Supabase publishable key (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) to enable login.")} messageClassName="mt-2 max-w-2xl text-sm text-amber-50/85" action={<Button asChild className="mt-6 h-10 rounded-xl bg-amber-300 text-primary-foreground hover:bg-amber-200">
              <Link href="/">{tr(locale, "Back to catalog", "Back to catalog")}</Link>
            </Button>}/>);
    }
    if (user) {
        return (<div className="relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-card p-6 shadow-[0_24px_56px_-36px_hsl(var(--foreground)/0.35)] sm:p-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"/>
        <div className="relative">
          <h1 className="text-2xl font-semibold text-foreground">
            {tr(locale, "You are signed in", "You are signed in")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {tr(locale, "Account:", "Account:")}{" "}
            <span className="font-medium text-foreground">
              {user.email || tr(locale, "authenticated user", "authenticated user")}
            </span>
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary">
              <Link href={safeNextPath}>{tr(locale, "Continue", "Continue")}</Link>
            </Button>
            <Button type="button" variant="outline" onClick={() => {
                void signOut();
            }} className="h-10 rounded-xl border-border/60 bg-card hover:bg-accent">
              {tr(locale, "Sign out", "Sign out")}
            </Button>
          </div>
        </div>
      </div>);
    }
    return (<section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-[0_24px_56px_-36px_hsl(var(--foreground)/0.35)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"/>
      <div className="relative p-6 sm:p-10">
        <AuthHeroIntro locale={locale} description={tr(locale, "Sign in to submit MCP servers and manage your integrations.", "Sign in to submit MCP servers and manage your integrations.")}/>

        {callbackErrorMessage ? (<p className="mt-5 rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-100">
            {callbackErrorMessage}
          </p>) : null}
        {isEmailLinkError ? (<div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-amber-300/40 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-100">
            <span>{tr(locale, "Enter your email and request a fresh confirmation link.", "Enter your email and request a fresh confirmation link.")}</span>
            <Button type="button" variant="outline" className="h-8 rounded-lg border-amber-200/40 bg-transparent px-3 text-amber-100 hover:bg-amber-500/15" disabled={!emailAuthValues.email.trim()} onClick={() => {
            if (typeof window === "undefined") {
                return;
            }
            window.location.assign(getCheckEmailPath("signup", emailAuthValues.email.trim()));
        }}>
              {tr(locale, "Open check-email page", "Open check-email page")}
            </Button>
          </div>) : null}
        {oauthProviderMessage ? (<p className="mt-3 rounded-xl border border-amber-300/45 bg-amber-400/10 px-3 py-2.5 text-sm text-amber-100">
            {oauthProviderMessage}
          </p>) : null}

        {isLoading ? (<p className="mt-3 text-xs text-muted-foreground/70">
            {tr(locale, "Checking your session...", "Checking your session...")}
          </p>) : null}

        <div className="mt-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {tr(locale, "Continue with social login", "Continue with social login")}
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <OAuthProviderButton provider="google" pendingOAuthProvider={pendingOAuthProvider} isEmailPending={isEmailPending} onSignIn={(provider) => {
            void signInWithProvider(provider);
        }} buttonClassName={oauthButtonClass} label={tr(locale, "Continue with Google", "Continue with Google")} icon="G"/>

            <OAuthProviderButton provider="github" pendingOAuthProvider={pendingOAuthProvider} isEmailPending={isEmailPending} onSignIn={(provider) => {
            void signInWithProvider(provider);
        }} buttonClassName={oauthButtonClass} label={tr(locale, "Continue with GitHub", "Continue with GitHub")} icon="GH" iconClassName="text-[10px]"/>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border/60 bg-card p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {isSignUpMode
            ? tr(locale, "Register with email", "Register with email")
            : isResetRequestMode
                ? tr(locale, "Password reset", "Password reset")
                : tr(locale, "Login with email", "Login with email")}
          </p>

          <form className="mt-4 grid gap-3" onSubmit={submitEmailAuth}>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-foreground">
                Email
              </Label>
              <Input id="email" type="email" autoComplete="email" required value={emailAuthValues.email} onChange={(event) => updateEmailField("email", event.target.value)} placeholder="you@example.com" className="h-11 rounded-xl border-border/60 bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"/>
              {emailAuthErrors.email ? (<p className="text-xs text-rose-300">{emailAuthErrors.email}</p>) : null}
            </div>

            {!isResetRequestMode ? (<div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm text-foreground">
                  {tr(locale, "Password", "Password")}
                </Label>
                <Input id="password" type="password" autoComplete={isSignUpMode ? "new-password" : "current-password"} required value={emailAuthValues.password} onChange={(event) => updateEmailField("password", event.target.value)} placeholder={tr(locale, isSignUpMode
                ? `At least ${PASSWORD_MIN_LENGTH} characters`
                : "Enter your password", isSignUpMode
                ? `At least ${PASSWORD_MIN_LENGTH} characters`
                : "Enter your password")} className="h-11 rounded-xl border-border/60 bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"/>
                {isSignUpMode ? (<PasswordStrengthChecklist score={emailPasswordStrengthScore} strengthLabel={getPasswordStrengthLabel(locale, emailPasswordStrengthScore)} checklistItems={signupChecklistItems}/>) : null}
                {emailAuthErrors.password ? (<p className="text-xs text-rose-300">{emailAuthErrors.password}</p>) : null}
              </div>) : null}

            {isSignUpMode ? (<div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm text-foreground">
                  {tr(locale, "Confirm password", "Confirm password")}
                </Label>
                <Input id="confirmPassword" type="password" autoComplete="new-password" required value={emailAuthValues.confirmPassword} onChange={(event) => updateEmailField("confirmPassword", event.target.value)} placeholder={tr(locale, "Repeat password", "Repeat password")} className="h-11 rounded-xl border-border/60 bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/40"/>
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

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {emailAuthMode === "sign-in" ? (<>
                <button type="button" onClick={() => switchEmailAuthMode("sign-up")} className="underline underline-offset-4 transition hover:text-foreground">
                  {tr(locale, "No account? Sign up", "No account? Sign up")}
                </button>
                <button type="button" onClick={() => switchEmailAuthMode("reset-request")} className="underline underline-offset-4 transition hover:text-foreground">
                  {tr(locale, "Forgot password?", "Forgot password?")}
                </button>
              </>) : null}

            {emailAuthMode === "sign-up" ? (<button type="button" onClick={() => switchEmailAuthMode("sign-in")} className="underline underline-offset-4 transition hover:text-foreground">
                {tr(locale, "Already have an account? Sign in", "Already have an account? Sign in")}
              </button>) : null}

            {emailAuthMode === "reset-request" ? (<button type="button" onClick={() => switchEmailAuthMode("sign-in")} className="underline underline-offset-4 transition hover:text-foreground">
                {tr(locale, "Remembered your password? Sign in", "Remembered your password? Sign in")}
              </button>) : null}
          </div>
        </div>

        {emailMessage ? (<p className="mt-4 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm text-primary">
            {emailMessage}
          </p>) : null}

        <p className="mt-6 border-t border-border/60 pt-4 text-xs leading-6 text-muted-foreground">
          {tr(locale, "By signing in, you agree to our", "By signing in, you agree to our")}{" "}
          <Link href="/terms" className="font-semibold text-foreground underline underline-offset-4 transition hover:text-foreground">
            {tr(locale, "Terms", "Terms")}
          </Link>{" "}
          {tr(locale, "and", "and")}{" "}
          <Link href="/privacy" className="font-semibold text-foreground underline underline-offset-4 transition hover:text-foreground">
            {tr(locale, "Privacy Policy", "Privacy Policy")}
          </Link>
          .
        </p>
      </div>
    </section>);
}
