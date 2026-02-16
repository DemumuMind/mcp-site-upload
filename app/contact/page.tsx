import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Clock3, LifeBuoy, MessageSquareText } from "lucide-react";
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
    <div className="relative overflow-hidden border-t border-blacksmith">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#030711_0%,#060d1f_48%,#07091b_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(circle_at_16%_8%,rgba(56,189,248,0.22),transparent_40%),radial-gradient(circle_at_82%_5%,rgba(52,211,153,0.16),transparent_40%)]" />

      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="rounded-3xl border border-primary/30 bg-card p-6 sm:p-10">
          <Badge className="mb-4 border-primary/35 bg-primary/10 text-primary">
            <Clock3 className="size-3" />
            {tr(locale, "Contact DemumuMind", "Contact DemumuMind")}
          </Badge>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            {tr(locale, "Need help shipping MCP workflows?", "Need help shipping MCP workflows?")}
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-8 text-muted-foreground sm:text-lg">
            {tr(
              locale,
              "Share context in your first message and we will route your request faster to the right team.",
              "Share context in your first message and we will route your request faster to the right team.",
            )}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-blue-500 hover:bg-blue-400">
              <Link href={`mailto:${legalEmail}?subject=DemumuMind%20Contact%20Request`}>
                {legalEmail}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-blacksmith bg-card text-foreground hover:bg-accent">
              <Link href="/discord">{tr(locale, "Open Discord", "Open Discord")}</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
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
                <p className="rounded-lg border border-blacksmith bg-card px-3 py-2 text-xs text-muted-foreground">
                  {channel.responseTarget}
                </p>
                <Button asChild variant="ghost" className="h-auto px-0 text-foreground hover:bg-transparent">
                  <Link href={channel.href}>
                    {channel.cta}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-blacksmith bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-foreground">
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
                  <li key={item} className="rounded-xl border border-blacksmith bg-card px-4 py-2.5">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blacksmith bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-foreground">{tr(locale, "Working hours", "Working hours")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
              <p>{tr(locale, "MonвЂ“Fri В· 09:00вЂ“18:00 UTC", "MonвЂ“Fri В· 09:00вЂ“18:00 UTC")}</p>
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
          </Card>
        </section>
      </div>
    </div>
  );
}


