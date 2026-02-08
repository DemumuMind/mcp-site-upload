import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bot, MessageCircleMore, ShieldCheck, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Discord Community",
  description: "Join the BridgeMind developer community for vibe coding and agentic coding.",
};

const communityChannels = [
  {
    name: "#ship-room",
    description: "Daily build logs, launch blockers, and peer feedback on in-flight MCP work.",
    icon: Bot,
  },
  {
    name: "#benchmark-ai",
    description: "Weekly result drops, benchmark deltas, and model-comparison discussions.",
    icon: MessageCircleMore,
  },
  {
    name: "#integration-support",
    description: "Help requests for setup, auth flows, and debugging production MCP connections.",
    icon: ShieldCheck,
  },
] as const;

const participationRules = [
  "Share reproducible context when asking for help",
  "Use one thread per issue to keep discussion searchable",
  "Post benchmark claims with test details and version info",
  "Respect async collaboration across time zones",
] as const;

export default function DiscordPage() {
  return (
    <div className="relative overflow-hidden border-t border-white/10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#0a1020_0%,#070b17_50%,#050811_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(circle_at_17%_7%,rgba(99,102,241,0.24),transparent_42%),radial-gradient(circle_at_84%_4%,rgba(168,85,247,0.2),transparent_38%)]" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-14">
        <section className="rounded-3xl border border-indigo-400/20 bg-slate-950/72 p-6 sm:p-8">
          <Badge className="mb-4 w-fit border-indigo-400/35 bg-indigo-500/10 text-indigo-200">
            Community
          </Badge>
          <h1 className="text-4xl leading-tight font-semibold tracking-tight text-slate-100 sm:text-6xl">
            BridgeMind Discord
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            Join engineers and AI builders discussing MCP shipping patterns, benchmark results, and
            day-to-day implementation decisions.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="bg-blue-500 hover:bg-blue-400">
              <Link href="https://discord.gg/bridgemind" target="_blank" rel="noreferrer">
                Join Discord
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/20 bg-slate-900/70 text-slate-100 hover:bg-slate-900"
            >
              <Link href="/blog">Read latest updates</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3" aria-label="Discord channels">
          {communityChannels.map((channel) => (
            <Card key={channel.name} className="border-white/10 bg-slate-950/75">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-100">
                  <channel.icon className="size-4 text-indigo-200" />
                  {channel.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">{channel.description}</CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-white/10 bg-slate-950/75">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-100">
                <Users className="size-5 text-violet-200" />
                Participation rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              {participationRules.map((rule) => (
                <p
                  key={rule}
                  className="rounded-lg border border-white/10 bg-slate-900/65 px-3 py-2 text-slate-200"
                >
                  {rule}
                </p>
              ))}
            </CardContent>
          </Card>

          <Card className="border-indigo-400/20 bg-[linear-gradient(130deg,rgba(50,38,92,0.55),rgba(8,12,24,0.92))]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-100">Why teams join</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <p>Fast feedback from engineers actively shipping MCP integrations.</p>
              <p>Direct channel for benchmark discussions and model evaluation requests.</p>
              <p>Shared playbooks for setup, moderation readiness, and rollout quality checks.</p>
              <Button asChild className="bg-blue-500 hover:bg-blue-400">
                <Link href="https://discord.gg/bridgemind" target="_blank" rel="noreferrer">
                  Enter the community
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
