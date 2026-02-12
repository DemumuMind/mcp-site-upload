import type { Metadata } from "next";
import Link from "next/link";
import { type LucideIcon, ArrowRight, BriefcaseBusiness, Clock3, Mail, MessageSquareText, ShieldCheck, } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
type LocalizedCopy = {
    en: string;
};
type ContactChannel = {
    title: LocalizedCopy;
    description: LocalizedCopy;
    response: LocalizedCopy;
    cta: LocalizedCopy;
    href: string;
    icon: LucideIcon;
    accentClass: string;
};
const contactChannels: readonly ContactChannel[] = [
    {
        title: {
            en: "General Questions",
        },
        description: {
            en: "Platform usage, account support, roadmap requests, and collaboration questions.",
        },
        response: {
            en: "Response target: within 1 business day.",
        },
        href: "mailto:hello@bridgemind.ai?subject=BridgeMind%20General%20Request",
        cta: {
            en: "Email team",
        },
        icon: Mail,
        accentClass: "text-cyan-200",
    },
    {
        title: {
            en: "Partnerships",
        },
        description: {
            en: "Co-marketing, enterprise onboarding, and ecosystem partnership requests.",
        },
        response: {
            en: "Response target: within 2 business days.",
        },
        href: "mailto:partners@bridgemind.ai?subject=BridgeMind%20Partnership",
        cta: {
            en: "Contact partnerships",
        },
        icon: BriefcaseBusiness,
        accentClass: "text-emerald-200",
    },
    {
        title: {
            en: "Community",
        },
        description: {
            en: "Join builder conversations, events, benchmark discussions, and release notes.",
        },
        response: {
            en: "Discord channels are monitored daily.",
        },
        href: "/discord",
        cta: {
            en: "Open Discord",
        },
        icon: MessageSquareText,
        accentClass: "text-violet-200",
    },
] as const;
const messageChecklist: readonly LocalizedCopy[] = [
    {
        en: "Your team or project name",
    },
    {
        en: "What you are trying to ship with MCP",
    },
    {
        en: "Current blockers or integration constraints",
    },
    {
        en: "Links/screenshots that provide context",
    },
] as const;
export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    return {
        title: tr(locale, "Contact", "Contact"),
        description: tr(locale, "Get in touch with the BridgeMind team.", "Get in touch with the BridgeMind team."),
    };
}
export default async function ContactPage() {
    const locale = await getLocale();
    return (<div className="relative overflow-hidden border-t border-white/10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#031022_0%,#050d1d_45%,#030915_100%)]"/>
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px] bg-[radial-gradient(circle_at_20%_5%,rgba(56,189,248,0.22),transparent_40%),radial-gradient(circle_at_80%_5%,rgba(16,185,129,0.14),transparent_38%)]"/>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-14">
        <section className="rounded-3xl border border-cyan-400/20 bg-indigo-950/70 p-6 sm:p-8">
          <Badge className="mb-4 w-fit border-cyan-400/35 bg-cyan-500/10 text-cyan-200">
            {tr(locale, "Company", "Company")}
          </Badge>
          <h1 className="text-4xl leading-tight font-semibold tracking-tight text-violet-50 sm:text-6xl">
            {tr(locale, "Contact BridgeMind", "Contact BridgeMind")}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-violet-200 sm:text-base">
            {tr(locale, "Reach the team for support, partnerships, and collaboration around MCP rollouts. Send context up front and we can route your request faster.", "Reach the team for support, partnerships, and collaboration around MCP rollouts. Send context up front and we can route your request faster.")}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="bg-blue-500 hover:bg-blue-400">
              <Link href="mailto:hello@bridgemind.ai?subject=BridgeMind%20Contact%20Request">
                hello@bridgemind.ai
                <ArrowRight className="size-4"/>
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 bg-indigo-900/70 text-violet-50 hover:bg-indigo-900">
              <Link href="/discord">{tr(locale, "Open Discord", "Open Discord")}</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3" aria-label={tr(locale, "Contact channels", "Contact channels")}>
          {contactChannels.map((channel) => (<Card key={channel.title.en} className="border-white/10 bg-indigo-950/75">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-violet-50">
                  <channel.icon className={`size-4 ${channel.accentClass}`}/>
                  {tr(locale, channel.title.en, channel.title.en)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-violet-200">
                <p>{tr(locale, channel.description.en, channel.description.en)}</p>
                <div className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-violet-200">
                  {tr(locale, channel.response.en, channel.response.en)}
                </div>
                <div>
                  <Button asChild variant="ghost" className="h-auto px-0 text-violet-50 hover:bg-transparent">
                    <Link href={channel.href}>
                      {tr(locale, channel.cta.en, channel.cta.en)}
                      <ArrowRight className="size-4"/>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="border-white/10 bg-indigo-950/75">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl text-violet-50">
                <ShieldCheck className="size-5 text-cyan-200"/>
                {tr(locale, "Send a high-signal request", "Send a high-signal request")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-violet-200">
              <p>
                {tr(locale, "Include these details in your first message to reduce back-and-forth:", "Include these details in your first message to reduce back-and-forth:")}
              </p>
              <ul className="space-y-2">
                {messageChecklist.map((item) => (<li key={item.en} className="rounded-lg border border-white/10 bg-indigo-900/65 px-3 py-2 text-violet-100">
                    {tr(locale, item.en, item.en)}
                  </li>))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-indigo-950/75">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl text-violet-50">
                <Clock3 className="size-5 text-emerald-200"/>
                {tr(locale, "Response windows", "Response windows")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-violet-200">
              <p>{tr(locale, "Mon-Fri: 09:00-18:00 UTC", "Mon-Fri: 09:00-18:00 UTC")}</p>
              <p>
                {tr(locale, "Priority issues: include urgent in subject line.", "Priority issues: include urgent in subject line.")}
              </p>
              <p>
                {tr(locale, "Community channels: daily async moderation.", "Community channels: daily async moderation.")}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>);
}
