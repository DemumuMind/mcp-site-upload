import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Clock3, LifeBuoy, MessageSquareText } from "lucide-react";
import { PageFrame, PageSection, PageShell } from "@/components/page-templates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <PageShell>
        <PageSection surface="plain" className="border-b border-blacksmith bg-background sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <Badge className="border-blacksmith bg-card text-muted-foreground">
                <Clock3 className="size-3" />
                {tr(locale, "Contact DemumuMind", "Contact DemumuMind")}
              </Badge>

              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                  {tr(locale, "Support channel routing", "Support channel routing")}
                </p>
                <h1 className="max-w-3xl font-serif text-4xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl">
                  {tr(locale, "Need help shipping MCP workflows?", "Need help shipping MCP workflows?")}
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {tr(
                    locale,
                    "Share context in your first message and we will route your request faster to the right team.",
                    "Share context in your first message and we will route your request faster to the right team.",
                  )}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="h-11 px-6">
                  <Link href={`mailto:${legalEmail}?subject=DemumuMind%20Contact%20Request`}>
                    {legalEmail}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-11 border-blacksmith bg-card px-6">
                  <Link href="/discord">{tr(locale, "Open Discord", "Open Discord")}</Link>
                </Button>
              </div>
            </div>

            <aside className="rounded-lg border border-blacksmith bg-card p-5" aria-label="Response service levels">
              <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                {tr(locale, "Response expectations", "Response expectations")}
              </p>
              <h2 className="mt-3 font-serif text-2xl leading-tight font-semibold text-foreground">
                {tr(locale, "Trust-first support flow", "Trust-first support flow")}
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                <li className="rounded-md border border-blacksmith px-3 py-2">
                  {tr(locale, "Mon-Fri - 09:00-18:00 UTC", "Mon-Fri - 09:00-18:00 UTC")}
                </li>
                <li className="rounded-md border border-blacksmith px-3 py-2">
                  {tr(
                    locale,
                    "For urgent operational issues, include 'urgent' in your subject line.",
                    "For urgent operational issues, include 'urgent' in your subject line.",
                  )}
                </li>
                <li className="rounded-md border border-blacksmith px-3 py-2">
                  {tr(
                    locale,
                    "We answer community questions asynchronously every day.",
                    "We answer community questions asynchronously every day.",
                  )}
                </li>
              </ul>
            </aside>
          </div>
        </PageSection>

        <PageSection surface="mesh" className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
              {tr(locale, "Choose the right channel", "Choose the right channel")}
            </p>
            <h2 className="font-serif text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-4xl">
              {tr(locale, "Contact lanes and ownership", "Contact lanes and ownership")}
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {channels.map((channel) => (
              <Card key={channel.title} className="border-blacksmith bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 font-serif text-xl text-foreground">
                    <channel.icon className="size-4 text-primary" />
                    {channel.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
                  <p>{channel.description}</p>
                  <p className="rounded-md border border-blacksmith bg-background px-3 py-2 text-xs tracking-wide">{channel.responseTarget}</p>
                  <Button asChild variant="ghost" className="h-auto px-0 font-semibold text-foreground hover:bg-transparent">
                    <Link href={channel.href}>
                      {channel.cta}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </PageSection>

        <PageSection surface="plain" className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-blacksmith bg-card">
            <CardHeader className="pb-2">
              <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                {tr(locale, "Request quality", "Request quality")}
              </p>
              <CardTitle className="font-serif text-3xl text-foreground">
                {tr(locale, "High-signal request template", "High-signal request template")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
              <p>
                {tr(
                  locale,
                  "Use this checklist in your first message to reduce back-and-forth:",
                  "Use this checklist in your first message to reduce back-and-forth:",
                )}
              </p>
              <ul className="space-y-2">
                {requestTemplate.map((item) => (
                  <li key={item} className="rounded-md border border-blacksmith bg-background px-4 py-2.5">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blacksmith bg-card">
            <CardHeader className="pb-2">
              <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                {tr(locale, "Escalation", "Escalation")}
              </p>
              <CardTitle className="font-serif text-3xl text-foreground">{tr(locale, "Need urgent support?", "Need urgent support?")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                {tr(
                  locale,
                  "Use your subject line to flag urgency and include a short impact statement so we can prioritize triage quickly.",
                  "Use your subject line to flag urgency and include a short impact statement so we can prioritize triage quickly.",
                )}
              </p>
              <Button asChild className="w-full sm:w-auto">
                <Link href={`mailto:${legalEmail}?subject=DemumuMind%20Urgent%20Support`}>
                  {tr(locale, "Start urgent email draft", "Start urgent email draft")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </PageSection>
      </PageShell>
    </PageFrame>
  );
}


