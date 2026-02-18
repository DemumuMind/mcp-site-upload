import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Clock3, LifeBuoy, MessageSquareText } from "lucide-react";
import { PageActionZone, PageFrame, PageHero, PageSection, PageShell } from "@/components/page-templates";
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
        <PageHero
          surface="steel"
          eyebrow={
            <Badge className="border-primary/35 bg-primary/10 text-primary">
              <Clock3 className="size-3" />
              {tr(locale, "Contact DemumuMind", "Contact DemumuMind")}
            </Badge>
          }
          title={tr(locale, "Need help shipping MCP workflows?", "Need help shipping MCP workflows?")}
          description={tr(
            locale,
            "Share context in your first message and we will route your request faster to the right team.",
            "Share context in your first message and we will route your request faster to the right team.",
          )}
          actions={
            <>
              <Button asChild className="bg-blue-500 hover:bg-blue-400">
                <Link href={`mailto:${legalEmail}?subject=DemumuMind%20Contact%20Request`}>
                  {legalEmail}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-blacksmith bg-card text-foreground hover:bg-accent">
                <Link href="/discord">{tr(locale, "Open Discord", "Open Discord")}</Link>
              </Button>
            </>
          }
        />

        <PageSection surface="mesh" className="grid gap-4 lg:grid-cols-3">
          {channels.map((channel) => (
            <Card key={channel.title} className="border-blacksmith bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                  <channel.icon className="size-4 text-primary" />
                  {channel.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
                <p>{channel.description}</p>
                <p className="rounded-lg border border-blacksmith bg-card px-3 py-2 text-xs text-muted-foreground">{channel.responseTarget}</p>
                <Button asChild variant="ghost" className="h-auto px-0 text-foreground hover:bg-transparent">
                  <Link href={channel.href}>
                    {channel.cta}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </PageSection>

        <PageSection surface="plain" className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-blacksmith bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-foreground">{tr(locale, "High-signal request template", "High-signal request template")}</CardTitle>
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
                  <li key={item} className="rounded-xl border border-blacksmith bg-card px-4 py-2.5">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <PageActionZone className="border-blacksmith bg-card">
            <CardHeader className="px-0 pb-2">
              <CardTitle className="text-2xl text-foreground">{tr(locale, "Working hours", "Working hours")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-0 pb-0 text-sm leading-7 text-muted-foreground">
              <p>{tr(locale, "Mon-Fri · 09:00-18:00 UTC", "Mon-Fri · 09:00-18:00 UTC")}</p>
              <p>
                {tr(
                  locale,
                  "For urgent operational issues, include 'urgent' in your subject line.",
                  "For urgent operational issues, include 'urgent' in your subject line.",
                )}
              </p>
              <p>
                {tr(
                  locale,
                  "We answer community questions asynchronously every day.",
                  "We answer community questions asynchronously every day.",
                )}
              </p>
            </CardContent>
          </PageActionZone>
        </PageSection>
      </PageShell>
    </PageFrame>
  );
}
