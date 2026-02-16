import type { Metadata } from "next";
import Link from "next/link";
import { type LucideIcon, ArrowRight, Bot, MessageCircleMore, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
type LocalizedCopy = {
    en: string;
};
type CommunityChannel = {
    name: string;
    description: LocalizedCopy;
    icon: LucideIcon;
};
const communityChannels: readonly CommunityChannel[] = [
    {
        name: "#ship-room",
        description: {
            en: "Daily build logs, launch blockers, and peer feedback on in-flight MCP work.",
        },
        icon: Bot,
    },
    {
        name: "#benchmark-ai",
        description: {
            en: "Weekly result drops, benchmark deltas, and model-comparison discussions.",
        },
        icon: MessageCircleMore,
    },
    {
        name: "#integration-support",
        description: {
            en: "Help requests for setup, auth flows, and debugging production MCP connections.",
        },
        icon: ShieldCheck,
    },
] as const;
const participationRules: readonly LocalizedCopy[] = [
    {
        en: "Share reproducible context when asking for help",
    },
    {
        en: "Use one thread per issue to keep discussion searchable",
    },
    {
        en: "Post benchmark claims with test details and version info",
    },
    {
        en: "Respect async collaboration across time zones",
    },
] as const;
export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    return {
        title: tr(locale, "Discord Community", "Discord Community"),
        description: tr(locale, "Join the BridgeMind developer community for vibe coding and agentic coding.", "Join the BridgeMind developer community for vibe coding and agentic coding."),
    };
}
export default async function DiscordPage() {
    const locale = await getLocale();
    return (<div className="relative overflow-hidden border-t border-blacksmith">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#0a1020_0%,#070b17_50%,#050811_100%)]"/>
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(circle_at_17%_7%,rgba(99,102,241,0.24),transparent_42%),radial-gradient(circle_at_84%_4%,rgba(168,85,247,0.2),transparent_38%)]"/>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-14">
        <section className="rounded-3xl border border-indigo-400/20 bg-card p-6 sm:p-8">
          <Badge className="mb-4 w-fit border-indigo-400/35 bg-indigo-500/10 text-indigo-200">
            {tr(locale, "Community", "Community")}
          </Badge>
          <h1 className="text-4xl leading-tight font-semibold tracking-tight text-foreground sm:text-6xl">
            {tr(locale, "BridgeMind Discord", "BridgeMind Discord")}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            {tr(locale, "Join engineers and AI builders discussing MCP shipping patterns, benchmark results, and day-to-day implementation decisions.", "Join engineers and AI builders discussing MCP shipping patterns, benchmark results, and day-to-day implementation decisions.")}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="bg-blue-500 hover:bg-blue-400">
              <Link href="https://discord.gg/bridgemind" target="_blank" rel="noreferrer">
                {tr(locale, "Join Discord", "Join Discord")}
                <ArrowRight className="size-4"/>
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-blacksmith bg-card text-foreground hover:bg-accent">
              <Link href="/blog">{tr(locale, "Read latest updates", "Read latest updates")}</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3" aria-label={tr(locale, "Discord channels", "Discord channels")}>
          {communityChannels.map((channel) => (<Card key={channel.name} className="border-blacksmith bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                  <channel.icon className="size-4 text-indigo-200"/>
                  {channel.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {tr(locale, channel.description.en, channel.description.en)}
              </CardContent>
            </Card>))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-blacksmith bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <Users className="size-5 text-muted-foreground"/>
                {tr(locale, "Participation rules", "Participation rules")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {participationRules.map((rule) => (<p key={rule.en} className="rounded-lg border border-blacksmith bg-card px-3 py-2 text-foreground">
                  {tr(locale, rule.en, rule.en)}
                </p>))}
            </CardContent>
          </Card>

          <Card className="border-indigo-400/20 bg-[linear-gradient(130deg,rgba(50,38,92,0.55),rgba(8,12,24,0.92))]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-foreground">{tr(locale, "Why teams join", "Why teams join")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                {tr(locale, "Fast feedback from engineers actively shipping MCP integrations.", "Fast feedback from engineers actively shipping MCP integrations.")}
              </p>
              <p>
                {tr(locale, "Direct channel for benchmark discussions and model evaluation requests.", "Direct channel for benchmark discussions and model evaluation requests.")}
              </p>
              <p>
                {tr(locale, "Shared playbooks for setup, moderation readiness, and rollout quality checks.", "Shared playbooks for setup, moderation readiness, and rollout quality checks.")}
              </p>
              <Button asChild className="bg-blue-500 hover:bg-blue-400">
                <Link href="https://discord.gg/bridgemind" target="_blank" rel="noreferrer">
                  {tr(locale, "Enter the community", "Enter the community")}
                  <ArrowRight className="size-4"/>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>);
}


