import type { Metadata } from "next";
import { AuthCheckEmailPanel } from "@/components/auth-check-email-panel";
import { PageFrame } from "@/components/page-templates";
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

  return (
    <PageFrame variant="content">
      <main className="bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--accent)/0.16),transparent_26%),radial-gradient(circle_at_78%_18%,hsl(var(--primary)/0.18),transparent_18%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_68%)]" />
          <div className="section-shell flex min-h-[62vh] flex-col justify-center py-16 sm:py-20">
            <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
              {tr(locale, "DemumuMind Access", "DemumuMind Access")}
            </p>
            <p className="mt-5 font-serif text-[clamp(3rem,10vw,6.5rem)] leading-none tracking-[-0.06em] text-foreground">
              DemumuMind
            </p>
            <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
              {parsedFlow === "reset"
                ? tr(locale, "Your reset link is on the way.", "Your reset link is on the way.")
                : tr(locale, "Your sign-in confirmation is waiting in the inbox.", "Your sign-in confirmation is waiting in the inbox.")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {tr(locale, "Open the latest DemumuMind email to continue authentication. If it does not arrive, resend from the panel below without leaving the flow.", "Open the latest DemumuMind email to continue authentication. If it does not arrive, resend from the panel below without leaving the flow.")}
            </p>
          </div>
        </section>

        <section>
          <div className="section-shell py-10 sm:py-14">
            <AuthCheckEmailPanel flow={parsedFlow} email={normalizedEmail} nextPath={safeNextPath} />
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
