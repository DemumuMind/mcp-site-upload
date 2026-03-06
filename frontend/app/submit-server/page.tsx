import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { PageFrame } from "@/components/page-templates";
import { SubmitServerWizard } from "@/components/submit-server-wizard";
import { Button } from "@/components/ui/button";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

const highlights = [
  {
    icon: Workflow,
    title: "3-step workflow",
    description: "Basics -> Technical details -> Review and submit.",
  },
  {
    icon: ShieldCheck,
    title: "Authenticated submission flow",
    description: "Sign in first, then complete the guided flow and submit with your account context.",
  },
  {
    icon: ClipboardCheck,
    title: "Moderation-ready payload",
    description: "Structured metadata helps reviewers validate your server faster.",
  },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: tr(locale, "Submit Server", "Submit Server"),
    description: tr(
      locale,
      "Submit an MCP server through a guided 3-step workflow with draft recovery and moderation-ready metadata.",
      "Submit an MCP server through a guided 3-step workflow with draft recovery and moderation-ready metadata.",
    ),
  };
}

export default async function SubmitServerPage() {
  const locale = await getLocale();

  return (
    <PageFrame>
      <main className="bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_24%),radial-gradient(circle_at_78%_20%,hsl(var(--accent)/0.14),transparent_20%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_62%)]" />
          <div className="section-shell flex min-h-[72vh] flex-col justify-center py-16 sm:py-20 lg:py-24">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-primary uppercase">
              <Sparkles className="size-3" />
              {tr(locale, "Server Submission", "Server Submission")}
            </p>
            <p className="mt-5 font-serif text-[clamp(3.1rem,10vw,7rem)] leading-none tracking-[-0.06em] text-foreground">DemumuMind</p>
            <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
              {tr(locale, "Submit your MCP server", "Submit your MCP server")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {tr(
                locale,
                "Use the guided flow to prepare a high-signal submission for moderation. Submission access is limited to authenticated users.",
                "Use the guided flow to prepare a high-signal submission for moderation. Submission access is limited to authenticated users.",
              )}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-11 rounded-none px-6">
                <Link href="/catalog">
                  {tr(locale, "Open catalog", "Open catalog")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 rounded-none border-border/80 bg-transparent px-6">
                <Link href="/account">{tr(locale, "View my account", "View my account")}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b border-border/60">
          <div className="section-shell py-16">
            <div className="mb-8">
              <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
                {tr(locale, "Submission flow", "Submission flow")}
              </p>
              <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {tr(locale, "Prepare a moderation-ready entry.", "Prepare a moderation-ready entry.")}
              </h2>
            </div>
            <div className="grid gap-px border-y border-border/60 bg-border/60 lg:grid-cols-3">
              {highlights.map((item) => (
                <article key={item.title} className="bg-background px-0 py-6 lg:px-6">
                  <div className="inline-flex size-10 items-center justify-center border border-border/70 text-primary">
                    <item.icon className="size-4" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-foreground">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="section-shell grid gap-10 py-16 lg:grid-cols-[0.34fr_0.66fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
                {tr(locale, "Before you start", "Before you start")}
              </p>
              <div className="mt-6 border-y border-border/60 text-sm text-muted-foreground">
                <div className="border-b border-border/60 py-4">
                  {tr(locale, "Sign in with the account you want attached to the submission.", "Sign in with the account you want attached to the submission.")}
                </div>
                <div className="border-b border-border/60 py-4">
                  {tr(locale, "Prepare technical details so moderation can validate the server quickly.", "Prepare technical details so moderation can validate the server quickly.")}
                </div>
                <div className="py-4">
                  {tr(locale, "Review the final payload before sending it to the catalog team.", "Review the final payload before sending it to the catalog team.")}
                </div>
              </div>
            </div>

            <div className="border border-border/60 p-4 sm:p-6">
              <SubmitServerWizard />
            </div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
