import type { Metadata } from "next";
import Link from "next/link";
import { loginAdminAction } from "@/app/admin/actions";
import { PageFrame } from "@/components/page-templates";
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
  const errorMessage =
    error === "invalid"
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
  const authModeHint =
    authMode === "hybrid"
      ? tr(locale, "Current mode: hybrid (Supabase admin-role + fallback token).", "Current mode: hybrid (Supabase admin-role + fallback token).")
      : authMode === "supabase"
        ? tr(locale, "Current mode: Supabase admin-role only.", "Current mode: Supabase admin-role only.")
        : tr(locale, "Current mode: token only.", "Current mode: token only.");

  return (
    <PageFrame variant="ops">
      <main className="bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_24%),radial-gradient(circle_at_84%_16%,hsl(var(--accent)/0.14),transparent_18%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_70%)]" />
          <div className="section-shell grid min-h-[72vh] gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_420px] lg:items-center lg:py-24">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
                {tr(locale, "DemumuMind Operations", "DemumuMind Operations")}
              </p>
              <p className="mt-5 font-serif text-[clamp(3rem,9vw,6rem)] leading-none tracking-[-0.06em] text-foreground">
                Admin Access
              </p>
              <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
                {tr(locale, "Open moderation with the right role, or the emergency token when needed.", "Open moderation with the right role, or the emergency token when needed.")}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {tr(locale, "This page is restricted to operational access. Choose the configured auth path below and continue directly into the moderation workspace.", "This page is restricted to operational access. Choose the configured auth path below and continue directly into the moderation workspace.")}
              </p>
            </div>

            <section className="border border-border/60 bg-background/78 p-6 backdrop-blur-sm sm:p-7">
              <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
                {tr(locale, "Authentication mode", "Authentication mode")}
              </p>
              <p className="mt-3 border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                {authModeHint}
              </p>

              {errorMessage ? (
                <p className="mt-4 border border-border bg-accent px-3 py-2 text-sm text-foreground">{errorMessage}</p>
              ) : null}

              {supabaseLoginEnabled ? (
                <div className="mt-5 space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {tr(locale, "Supabase role login", "Supabase role login")}
                  </p>
                  <Button asChild className="h-11 w-full rounded-none px-6">
                    <Link href={supabaseAuthPath}>
                      {tr(locale, "Continue with Supabase auth", "Continue with Supabase auth")}
                    </Link>
                  </Button>
                </div>
              ) : null}

              {tokenLoginEnabled ? (
                <form action={loginAdminAction} className="mt-6 space-y-4 border-t border-border/60 pt-5">
                  <input type="hidden" name="redirect" value={safeRedirectPath} />
                  <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    defaultValue="admin"
                    tabIndex={-1}
                    readOnly
                    aria-hidden="true"
                    className="sr-only"
                  />

                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {tr(locale, "Emergency token login", "Emergency token login")}
                  </p>

                  <div className="space-y-1.5">
                    <Label htmlFor="token">{tr(locale, "Admin token", "Admin token")}</Label>
                    <Input id="token" name="token" type="password" autoComplete="current-password" required className="border-border bg-background" />
                  </div>

                  <Button type="submit" variant="outline" className="h-11 w-full rounded-none border-border/80 bg-transparent px-6">
                    {tr(locale, "Sign in with token", "Sign in with token")}
                  </Button>
                </form>
              ) : null}

              {!supabaseLoginEnabled && !tokenLoginEnabled ? (
                <p className="mt-4 border border-border bg-accent px-3 py-2 text-xs text-muted-foreground">
                  {tr(locale, "No admin auth method is enabled. Configure ADMIN_AUTH_MODE and credentials.", "No admin auth method is enabled. Configure ADMIN_AUTH_MODE and credentials.")}
                </p>
              ) : null}
            </section>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
