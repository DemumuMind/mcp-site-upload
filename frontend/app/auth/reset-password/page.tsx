import type { Metadata } from "next";
import { AuthResetPasswordPanel } from "@/components/auth-reset-password-panel";
import { PageFrame } from "@/components/page-templates";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "Reset password", "Reset password"),
    description: tr(locale, "Set a new password for your account after opening the recovery email link.", "Set a new password for your account after opening the recovery email link."),
  };
}

export default async function AuthResetPasswordPage() {
  const locale = await getLocale();

  return (
    <PageFrame variant="content">
      <main className="bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_22%),radial-gradient(circle_at_84%_16%,hsl(var(--accent)/0.14),transparent_18%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_70%)]" />
          <div className="section-shell flex min-h-[62vh] flex-col justify-center py-16 sm:py-20">
            <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
              {tr(locale, "DemumuMind Recovery", "DemumuMind Recovery")}
            </p>
            <p className="mt-5 font-serif text-[clamp(3rem,10vw,6.5rem)] leading-none tracking-[-0.06em] text-foreground">
              DemumuMind
            </p>
            <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
              {tr(locale, "Set a new password and return to your MCP workflow.", "Set a new password and return to your MCP workflow.")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {tr(locale, "This step only completes after you open the recovery email. Once the session is active, choose a stronger password and get back into your account.", "This step only completes after you open the recovery email. Once the session is active, choose a stronger password and get back into your account.")}
            </p>
          </div>
        </section>

        <section>
          <div className="section-shell py-10 sm:py-14">
            <AuthResetPasswordPanel />
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
