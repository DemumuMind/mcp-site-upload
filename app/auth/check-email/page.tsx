import type { Metadata } from "next";
import { PageFrame, PageHero, PageSection, PageShell } from "@/components/page-templates";
import { AuthCheckEmailPanel } from "@/components/auth-check-email-panel";
import { normalizeInternalPath, type AuthCheckEmailFlow } from "@/lib/auth-redirects";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
type AuthCheckEmailPageProps = {
    searchParams: Promise<{
        flow?: string;
        email?: string;
        next?: string;
    }>;
};
function parseFlow(value?: string): AuthCheckEmailFlow {
    return value === "reset" ? "reset" : "signup";
}
export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    return {
        title: tr(locale, "Check your email", "Check your email"),
        description: tr(locale, "Open the email from DemumuMind MCP to continue authentication.", "Open the email from DemumuMind MCP to continue authentication."),
    };
}
export default async function AuthCheckEmailPage({ searchParams }: AuthCheckEmailPageProps) {
    const locale = await getLocale();
    const { flow, email, next } = await searchParams;
    const parsedFlow = parseFlow(flow);
    const safeNextPath = normalizeInternalPath(next);
    const normalizedEmail = typeof email === "string" ? email.trim().slice(0, 254) : "";
    return (<PageFrame variant="content">
      <PageShell className="max-w-5xl px-4 sm:px-6">
        <PageHero animated={false} badgeTone="violet" eyebrow={tr(locale, "Authentication", "Authentication")} title={tr(locale, "Check your email", "Check your email")} description={tr(locale, "Use the link sent to your inbox to continue.", "Use the link sent to your inbox to continue.")}/>
        <PageSection className="min-h-[40vh]">
          <AuthCheckEmailPanel flow={parsedFlow} email={normalizedEmail} nextPath={safeNextPath}/>
        </PageSection>
      </PageShell>
    </PageFrame>);
}
