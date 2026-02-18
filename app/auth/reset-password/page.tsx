import type { Metadata } from "next";
import { PageFrame, PageHero, PageSection, PageShell } from "@/components/page-templates";
import { AuthResetPasswordPanel } from "@/components/auth-reset-password-panel";
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
    return (<PageFrame variant="content">
      <PageShell className="max-w-5xl px-4 sm:px-6">
        <PageHero surface="calm" animated={false} badgeTone="violet" eyebrow={tr(locale, "Recovery", "Recovery")} title={tr(locale, "Reset password", "Reset password")} description={tr(locale, "Create a new password to regain access to your account.", "Create a new password to regain access to your account.")}/>
        <PageSection surface="calm" className="min-h-[40vh]">
          <AuthResetPasswordPanel />
        </PageSection>
      </PageShell>
    </PageFrame>);
}
