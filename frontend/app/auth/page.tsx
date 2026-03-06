import type { Metadata } from "next";
import { AuthSignInPanel } from "@/components/auth-sign-in-panel";
import { PageFrame } from "@/components/page-templates";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: tr(locale, "Login", "Login"), description: tr(locale, "Sign in to submit MCP servers to the catalog.", "Sign in to submit MCP servers to the catalog.") };
}

type AuthPageProps = { searchParams: Promise<{ next?: string; error?: string; error_code?: string; error_description?: string; }>; };

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const locale = await getLocale();
  const { next, error, error_code, error_description } = await searchParams;
  const nextPath = typeof next === "string" ? next : "/";
  const errorCode = typeof error === "string" ? error : undefined;
  const authErrorCode = typeof error_code === "string" ? error_code : undefined;
  const authErrorDescription = typeof error_description === "string" ? error_description : undefined;

  return (
    <PageFrame variant="content">
      <main className="bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_24%),radial-gradient(circle_at_82%_20%,hsl(var(--accent)/0.14),transparent_20%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_66%)]" />
          <div className="section-shell flex min-h-[44vh] flex-col justify-center py-10 sm:min-h-[52vh] sm:py-14 lg:min-h-[68vh] lg:py-24">
            <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">{tr(locale, "DemumuMind Access", "DemumuMind Access")}</p>
            <p className="mt-4 font-serif text-[clamp(2.5rem,9vw,7rem)] leading-none tracking-[-0.06em] text-foreground">DemumuMind</p>
            <h1 className="mt-3 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">{tr(locale, "Sign in once. Submit, manage, and ship from one account.", "Sign in once. Submit, manage, and ship from one account.")}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-relaxed">{tr(locale, "Use your DemumuMind account to submit MCP servers, monitor your profile, and keep ownership of every catalog action in one place.", "Use your DemumuMind account to submit MCP servers, monitor your profile, and keep ownership of every catalog action in one place.")}</p>
          </div>
        </section>
        <section><div className="section-shell py-8 sm:py-12 lg:py-14"><AuthSignInPanel nextPath={nextPath} errorCode={errorCode} authErrorCode={authErrorCode} authErrorDescription={authErrorDescription} /></div></section>
      </main>
    </PageFrame>
  );
}
