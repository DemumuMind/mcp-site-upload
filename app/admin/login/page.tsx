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
        <PageHero animated={false} badgeTone="emerald" eyebrow={tr(locale, "Operations", "Operations")} title={tr(locale, "Admin access", "Admin access")} description={tr(locale, "Use your admin role or emergency token to open moderation dashboard.", "Use your admin role or emergency token to open moderation dashboard.")}/>
        <PageSection className="bg-indigo-900/70">
        <h1 className="text-xl font-semibold text-violet-50">
          {tr(locale, "Admin access", "Admin access")}
        </h1>
        <p className="mt-2 text-sm text-violet-200">
          {tr(locale, "Use your admin role or emergency token to open moderation dashboard.", "Use your admin role or emergency token to open moderation dashboard.")}
        </p>
        <p className="mt-2 rounded-md border border-cyan-400/25 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200">
          {authModeHint}
        </p>

        {errorMessage ? (<p className="mt-3 rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {errorMessage}
          </p>) : null}

        {supabaseLoginEnabled ? (<div className="mt-5 space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-violet-300">
              {tr(locale, "Supabase role login", "Supabase role login")}
            </p>
            <Button asChild className="w-full bg-blue-500 hover:bg-blue-400">
              <Link href={supabaseAuthPath}>
                {tr(locale, "Continue with Supabase auth", "Continue with Supabase auth")}
              </Link>
            </Button>
          </div>) : null}

        {tokenLoginEnabled ? (<form action={loginAdminAction} className="mt-5 space-y-3">
            <input type="hidden" name="redirect" value={safeRedirectPath}/>
            <input type="text" name="username" autoComplete="username" defaultValue="admin" tabIndex={-1} readOnly aria-hidden="true" className="sr-only"/>

            <p className="text-xs font-medium uppercase tracking-[0.14em] text-violet-300">
              {tr(locale, "Emergency token login", "Emergency token login")}
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="token">{tr(locale, "Admin token", "Admin token")}</Label>
              <Input id="token" name="token" type="password" autoComplete="current-password" required className="border-white/10 bg-indigo-950/80"/>
            </div>

            <Button type="submit" variant="outline" className="w-full border-white/20 bg-white/[0.03]">
              {tr(locale, "Sign in with token", "Sign in with token")}
            </Button>
          </form>) : null}

        {!supabaseLoginEnabled && !tokenLoginEnabled ? (<p className="mt-4 rounded-md border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            {tr(locale, "No admin auth method is enabled. Configure ADMIN_AUTH_MODE and credentials.", "No admin auth method is enabled. Configure ADMIN_AUTH_MODE and credentials.")}
          </p>) : null}
        </PageSection>
      </PageShell>
    </PageFrame>);
}
