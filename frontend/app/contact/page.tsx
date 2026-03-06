import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Clock3, LifeBuoy, MessageSquareText } from "lucide-react";
import { PageFrame } from "@/components/page-templates";
import { Button } from "@/components/ui/button";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { legalEmail } from "@/lib/legal-content";

const channels = [
  {
    title: "General support",
    description: "Product questions, technical blockers, account access, and onboarding requests.",
    responseTarget: "Target reply: within 1 business day.",
    href: `mailto:${legalEmail}?subject=DemumuMind%20General%20Support`,
    cta: "Email support",
    icon: LifeBuoy,
  },
  {
    title: "Partnerships",
    description: "Enterprise onboarding, ecosystem partnerships, and co-marketing opportunities.",
    responseTarget: "Target reply: within 2 business days.",
    href: `mailto:${legalEmail}?subject=DemumuMind%20Partnership`,
    cta: "Contact partnerships",
    icon: BriefcaseBusiness,
  },
  {
    title: "Community",
    description: "Async Q&A, release notes, workflow patterns, and discussion threads.",
    responseTarget: "Community channels are monitored daily.",
    href: "/discord",
    cta: "Open Discord",
    icon: MessageSquareText,
  },
] as const;

const requestTemplate = [
  "Your team and project name",
  "What MCP outcome you are trying to ship",
  "Current blockers and constraints",
  "Links or screenshots that provide context",
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: tr(locale, "Contact", "Contact"),
    description: tr(
      locale,
      "Contact the DemumuMind team for support, partnerships, and workflow collaboration.",
      "Contact the DemumuMind team for support, partnerships, and workflow collaboration.",
    ),
  };
}

export default async function ContactPage() {
  const locale = await getLocale();

  return (
    <PageFrame>
      <main className="bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--accent)/0.14),transparent_24%),radial-gradient(circle_at_78%_22%,hsl(var(--primary)/0.16),transparent_20%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_60%)]" />
          <div className="section-shell grid min-h-[72vh] gap-10 py-16 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-24">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-primary uppercase">
                <Clock3 className="size-3" />
                {tr(locale, "Contact DemumuMind", "Contact DemumuMind")}
              </p>
              <p className="mt-5 font-serif text-[clamp(3.1rem,10vw,7rem)] leading-none tracking-[-0.06em] text-foreground">DemumuMind</p>
              <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
                {tr(locale, "Need help shipping MCP workflows?", "Need help shipping MCP workflows?")}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {tr(
                  locale,
                  "Share useful context in the first message and we will route your request faster to the right team.",
                  "Share useful context in the first message and we will route your request faster to the right team.",
                )}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="h-11 rounded-none px-6">
                  <Link href={`mailto:${legalEmail}?subject=DemumuMind%20Contact%20Request`}>
                    {legalEmail}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-11 rounded-none border-border/80 bg-transparent px-6">
                  <Link href="/discord">{tr(locale, "Open Discord", "Open Discord")}</Link>
                </Button>
              </div>
            </div>

            <div className="border border-border/60 bg-[linear-gradient(180deg,hsl(var(--surface-1))/0.9,hsl(var(--surface-0))/0.75)] p-6 sm:p-8">
              <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
                {tr(locale, "Response expectations", "Response expectations")}
              </p>
              <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-foreground">
                {tr(locale, "Trust-first support flow", "Trust-first support flow")}
              </h2>
              <div className="mt-6 space-y-0 border-y border-border/60">
                <div className="border-b border-border/60 py-4 text-sm text-muted-foreground">{tr(locale, "Mon-Fri - 09:00-18:00 UTC", "Mon-Fri - 09:00-18:00 UTC")}</div>
                <div className="border-b border-border/60 py-4 text-sm text-muted-foreground">
                  {tr(locale, "For urgent operational issues, include 'urgent' in your subject line.", "For urgent operational issues, include 'urgent' in your subject line.")}
                </div>
                <div className="py-4 text-sm text-muted-foreground">
                  {tr(locale, "We answer community questions asynchronously every day.", "We answer community questions asynchronously every day.")}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border/60">
          <div className="section-shell py-16">
            <div className="mb-8">
              <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
                {tr(locale, "Choose the right channel", "Choose the right channel")}
              </p>
              <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {tr(locale, "Contact lanes and ownership", "Contact lanes and ownership")}
              </h2>
            </div>
            <div className="grid gap-px border-y border-border/60 bg-border/60 lg:grid-cols-3">
              {channels.map((channel) => (
                <article key={channel.title} className="bg-background px-0 py-6 lg:px-6">
                  <div className="inline-flex size-10 items-center justify-center border border-border/70 text-primary">
                    <channel.icon className="size-4" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-foreground">{channel.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{channel.description}</p>
                  <p className="mt-5 border-t border-border/60 pt-4 text-xs tracking-[0.16em] text-muted-foreground uppercase">{channel.responseTarget}</p>
                  <Link href={channel.href} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary transition-transform hover:translate-x-1">
                    {channel.cta}
                    <ArrowRight className="size-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="section-shell grid gap-10 py-16 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
                {tr(locale, "Request quality", "Request quality")}
              </p>
              <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {tr(locale, "High-signal request template", "High-signal request template")}
              </h2>
              <div className="mt-6 border-y border-border/60">
                {requestTemplate.map((item) => (
                  <div key={item} className="border-b border-border/60 py-4 text-sm leading-relaxed text-foreground last:border-b-0">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-border/60 p-6 sm:p-8">
              <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">{tr(locale, "Escalation", "Escalation")}</p>
              <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-foreground">
                {tr(locale, "Need urgent support?", "Need urgent support?")}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {tr(locale, "Use your subject line to flag urgency and include a short impact statement so we can prioritize triage quickly.", "Use your subject line to flag urgency and include a short impact statement so we can prioritize triage quickly.")}
              </p>
              <Button asChild className="mt-8 rounded-none px-6" size="lg">
                <Link href={`mailto:${legalEmail}?subject=DemumuMind%20Urgent%20Support`}>
                  {tr(locale, "Start urgent email draft", "Start urgent email draft")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
