import type { Metadata } from "next";
import Link from "next/link";
import { type LucideIcon, ArrowRight, Bot, MessageCircleMore, ShieldCheck, Users } from "lucide-react";
import { PageActionZone, PageFrame, PageHero, PageSection, PageShell } from "@/components/page-templates";
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
    description: tr(
      locale,
      "Join the BridgeMind developer community for vibe coding and agentic coding.",
      "Join the BridgeMind developer community for vibe coding and agentic coding.",
    ),
  };
}

export default async function DiscordPage() {
  const locale = await getLocale();

  return (
    <PageFrame>
      <PageShell className="max-w-6xl gap-8">
        <PageHero
          surface="rail"
          eyebrow={<Badge className="w-fit border-indigo-400/35 bg-primary/10 text-primary">{tr(locale, "Community", "Community")}</Badge>}
          title={tr(locale, "BridgeMind Discord", "BridgeMind Discord")}
          description={tr(
            locale,
            "Join engineers and AI builders discussing MCP shipping patterns, benchmark results, and day-to-day implementation decisions.",
            "Join engineers and AI builders discussing MCP shipping patterns, benchmark results, and day-to-day implementation decisions.",
          )}
          actions={
            <>
              <Button asChild className="bg-blue-500 hover:bg-blue-400">
                <Link href="https://discord.gg/bridgemind" target="_blank" rel="noreferrer">
                  {tr(locale, "Join Discord", "Join Discord")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-blacksmith bg-card text-foreground hover:bg-accent">
                <Link href="/blog">{tr(locale, "Read latest updates", "Read latest updates")}</Link>
              </Button>
            </>
          }
        />

        <PageSection surface="mesh" className="grid gap-4 md:grid-cols-3" aria-label={tr(locale, "Discord channels", "Discord channels")}>
          {communityChannels.map((channel) => (
            <Card key={channel.name} className="border-blacksmith bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                  <channel.icon className="size-4 text-primary" />
                  {channel.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{tr(locale, channel.description.en, channel.description.en)}</CardContent>
            </Card>
          ))}
        </PageSection>

        <PageSection surface="plain" className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-blacksmith bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                <Users className="size-5 text-muted-foreground" />
                {tr(locale, "Participation rules", "Participation rules")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {participationRules.map((rule) => (
                <p key={rule.en} className="rounded-lg border border-blacksmith bg-card px-3 py-2 text-foreground">
                  {tr(locale, rule.en, rule.en)}
                </p>
              ))}
            </CardContent>
          </Card>

          <PageActionZone className="border-indigo-400/20 bg-[linear-gradient(130deg,rgba(50,38,92,0.55),rgba(8,12,24,0.92))]">
            <CardHeader className="px-0 pb-2">
              <CardTitle className="text-xl text-foreground">{tr(locale, "Why teams join", "Why teams join")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-0 pb-0 text-sm text-muted-foreground">
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
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </PageActionZone>
        </PageSection>
      </PageShell>
    </PageFrame>
  );
}
