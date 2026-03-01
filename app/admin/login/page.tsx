import type { Metadata } from "next";
import Link from "next/link";
import { loginAdminAction } from "@/app/admin/actions";
import { PageFrame, PageHero, PageSection, PageShell } from "@/components/page-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminAuthMode, isSupabaseAdminAuthEnabled, isTokenAdminAuthEnabled } from "@/lib/admin-auth";
import { normalizeInternalPath } from "@/lib/auth-redirects";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
export const metadata: Metadata = {
    title: "Admin Login",
    description: "Restricted admin access for moderation actions.",
};
type AdminLoginPageProps = {
    searchParams: Promise<{
        redirect?: string;
        error?: string;
    }>;
};
export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
    const locale = await getLocale();
    const { redirect, error } = await searchParams;
    const authMode = getAdminAuthMode();
    const tokenLoginEnabled = isTokenAdminAuthEnabled();
    const supabaseLoginEnabled = isSupabaseAdminAuthEnabled();
    const safeRedirectPath = normalizeInternalPath(redirect ?? "/admin");
    const supabaseAuthPath = `/auth?next=${encodeURIComponent(safeRedirectPath)}`;
    const errorMessage = error === "invalid"
        ? tr(locale, "Invalid admin token.", "Invalid admin token.")
        : error === "session"
            ? tr(locale, "Session expired. Sign in again.", "Session expired. Sign in again.")
            : error === "config"
                ? tr(locale, "Admin auth is not configured. Check environment variables.", "Admin auth is not configured. Check environment variables.")
                : error === "forbidden"
                    ? tr(locale, "You are authenticated, but your account does not have admin access.", "You are authenticated, but your account does not have admin access.")
                    : error === "disabled"
                        ? tr(locale, "Token-based admin login is disabled in current auth mode.", "Token-based admin login is disabled in current auth mode.")
                        : undefined;
    const authModeHint = authMode === "hybrid"
        ? tr(locale, "Current mode: hybrid (Supabase admin-role + fallback token).", "Current mode: hybrid (Supabase admin-role + fallback token).")
        : authMode === "supabase"
            ? tr(locale, "Current mode: Supabase admin-role only.", "Current mode: Supabase admin-role only.")
            : tr(locale, "Current mode: token only.", "Current mode: token only.");
    return (<PageFrame variant="ops">
      <PageShell className="max-w-md px-4">
        <PageHero surface="plain" animated={false} badgeTone="emerald" eyebrow={tr(locale, "Operations", "Operations")} title={tr(locale, "Admin access", "Admin access")} description={tr(locale, "Use your admin role or emergency token to open moderation dashboard.", "Use your admin role or emergency token to open moderation dashboard.")}/>
        <PageSection surface="plain" className="border border-border bg-card">
        <h1 className="text-xl font-semibold text-foreground">
          {tr(locale, "Admin access", "Admin access")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {tr(locale, "Use your admin role or emergency token to open moderation dashboard.", "Use your admin role or emergency token to open moderation dashboard.")}
        </p>
        <p className="mt-2 rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
          {authModeHint}
        </p>

        {errorMessage ? (<p className="mt-3 rounded-md border border-border bg-accent px-3 py-2 text-sm text-foreground">
            {errorMessage}
          </p>) : null}

        {supabaseLoginEnabled ? (<div className="mt-5 space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {tr(locale, "Supabase role login", "Supabase role login")}
            </p>
            <Button asChild className="w-full">
              <Link href={supabaseAuthPath}>
                {tr(locale, "Continue with Supabase auth", "Continue with Supabase auth")}
              </Link>
            </Button>
          </div>) : null}

        {tokenLoginEnabled ? (<form action={loginAdminAction} className="mt-5 space-y-3">
            <input type="hidden" name="redirect" value={safeRedirectPath}/>
            <input type="text" name="username" autoComplete="username" defaultValue="admin" tabIndex={-1} readOnly aria-hidden="true" className="sr-only"/>

            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {tr(locale, "Emergency token login", "Emergency token login")}
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="token">{tr(locale, "Admin token", "Admin token")}</Label>
              <Input id="token" name="token" type="password" autoComplete="current-password" required className="border-border bg-background"/>
            </div>

            <Button type="submit" variant="outline" className="w-full border-white/20 bg-white/[0.03]">
              {tr(locale, "Sign in with token", "Sign in with token")}
            </Button>
          </form>) : null}

        {!supabaseLoginEnabled && !tokenLoginEnabled ? (<p className="mt-4 rounded-md border border-border bg-accent px-3 py-2 text-xs text-muted-foreground">
            {tr(locale, "No admin auth method is enabled. Configure ADMIN_AUTH_MODE and credentials.", "No admin auth method is enabled. Configure ADMIN_AUTH_MODE and credentials.")}
          </p>) : null}
        </PageSection>
      </PageShell>
    </PageFrame>);
}


