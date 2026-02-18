import type { Metadata } from "next";
import { PageFrame, PageShell, PageHero, PageSection } from "@/components/page-templates";
import { AuthSignInPanel } from "@/components/auth-sign-in-panel";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    return {
        title: tr(locale, "Login", "Login"),
        description: tr(locale, "Sign in to submit MCP servers to the catalog.", "Sign in to submit MCP servers to the catalog."),
    };
}
type AuthPageProps = {
    searchParams: Promise<{
        next?: string;
        error?: string;
        error_code?: string;
        error_description?: string;
    }>;
};
export default async function AuthPage({ searchParams }: AuthPageProps) {
    const locale = await getLocale();
    const { next, error, error_code, error_description } = await searchParams;
    const nextPath = typeof next === "string" ? next : "/";
    const errorCode = typeof error === "string" ? error : undefined;
    const authErrorCode = typeof error_code === "string" ? error_code : undefined;
    const authErrorDescription = typeof error_description === "string" ? error_description : undefined;
    return (<PageFrame variant="content">
      <PageShell className="max-w-5xl px-4 sm:px-6">
        <PageHero surface="calm" animated={false} badgeTone="violet" eyebrow={tr(locale, "Access", "Access")} title={tr(locale, "Sign in", "Sign in")} description={tr(locale, "Sign in to submit MCP servers and manage your account.", "Sign in to submit MCP servers and manage your account.")}/>
        <PageSection surface="calm" className="min-h-[40vh]">
          <AuthSignInPanel nextPath={nextPath} errorCode={errorCode} authErrorCode={authErrorCode} authErrorDescription={authErrorDescription}/>
        </PageSection>
      </PageShell>
    </PageFrame>);
}
