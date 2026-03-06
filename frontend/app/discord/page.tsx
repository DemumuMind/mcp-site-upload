import type { Metadata } from "next";
import Link from "next/link";
import { type LucideIcon, ArrowRight, Bot, MessageCircleMore, ShieldCheck, Users } from "lucide-react";
import { PageFrame } from "@/components/page-templates";
import { Button } from "@/components/ui/button";
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
      "Join the DemumuMind developer community for vibe coding and agentic coding.",
      "Join the DemumuMind developer community for vibe coding and agentic coding.",
    ),
  };
}

export default async function DiscordPage() {
  const locale = await getLocale();

  return (
    <PageFrame>
      <main className="bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--accent)/0.16),transparent_24%),radial-gradient(circle_at_80%_20%,hsl(var(--primary)/0.16),transparent_20%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_62%)]" />
          <div className="section-shell grid min-h-[72vh] gap-10 py-16 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-24">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">{tr(locale, "Community", "Community")}</p>
              <p className="mt-5 font-serif text-[clamp(3.1rem,10vw,7rem)] leading-none tracking-[-0.06em] text-foreground">DemumuMind</p>
              <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
                {tr(locale, "Discord for teams actively shipping MCP work.", "Discord for teams actively shipping MCP work.")}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {tr(locale, "Join engineers and AI builders discussing MCP shipping patterns, benchmark results, and day-to-day implementation decisions.", "Join engineers and AI builders discussing MCP shipping patterns, benchmark results, and day-to-day implementation decisions.")}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="h-11 rounded-none px-6">
                  <Link href="https://discord.gg/bridgemind" target="_blank" rel="noreferrer">
                    {tr(locale, "Join Discord", "Join Discord")}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-11 rounded-none border-border/80 bg-transparent px-6">
                  <Link href="/blog">{tr(locale, "Read latest updates", "Read latest updates")}</Link>
                </Button>
              </div>
            </div>

            <div className="border border-border/60 p-6 sm:p-8">
              <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">{tr(locale, "Why teams join", "Why teams join")}</p>
              <div className="mt-6 space-y-0 border-y border-border/60">
                {[
                  tr(locale, "Fast feedback from engineers actively shipping MCP integrations.", "Fast feedback from engineers actively shipping MCP integrations."),
                  tr(locale, "Direct channel for benchmark discussions and model evaluation requests.", "Direct channel for benchmark discussions and model evaluation requests."),
                  tr(locale, "Shared playbooks for setup, moderation readiness, and rollout quality checks.", "Shared playbooks for setup, moderation readiness, and rollout quality checks."),
                ].map((point) => (
                  <div key={point} className="border-b border-border/60 py-4 text-sm leading-relaxed text-muted-foreground last:border-b-0">
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border/60">
          <div className="section-shell py-16">
            <div className="mb-8">
              <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">{tr(locale, "Discord channels", "Discord channels")}</p>
              <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">{tr(locale, "Rooms built around real delivery work", "Rooms built around real delivery work")}</h2>
            </div>
            <div className="grid gap-px border-y border-border/60 bg-border/60 md:grid-cols-3">
              {communityChannels.map((channel) => (
                <article key={channel.name} className="bg-background px-0 py-6 md:px-6">
                  <div className="inline-flex size-10 items-center justify-center border border-border/70 text-primary">
                    <channel.icon className="size-4" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-foreground">{channel.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tr(locale, channel.description.en, channel.description.en)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="section-shell grid gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="flex items-center gap-3">
                <Users className="size-5 text-primary" />
                <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">{tr(locale, "Participation rules", "Participation rules")}</p>
              </div>
              <div className="mt-6 border-y border-border/60">
                {participationRules.map((rule) => (
                  <div key={rule.en} className="border-b border-border/60 py-4 text-sm leading-relaxed text-foreground last:border-b-0">
                    {tr(locale, rule.en, rule.en)}
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-border/60 p-6 sm:p-8">
              <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">{tr(locale, "Join now", "Join now")}</p>
              <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-foreground">
                {tr(locale, "Bring your real blockers, not generic networking goals.", "Bring your real blockers, not generic networking goals.")}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {tr(locale, "The community works best when conversations are specific, reproducible, and tied to active MCP delivery work.", "The community works best when conversations are specific, reproducible, and tied to active MCP delivery work.")}
              </p>
              <Button asChild className="mt-8 rounded-none px-6" size="lg">
                <Link href="https://discord.gg/bridgemind" target="_blank" rel="noreferrer">
                  {tr(locale, "Enter the community", "Enter the community")}
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
