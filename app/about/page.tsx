import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Brain, Compass, Rocket, ShieldCheck, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

const pillars = [
  {
    icon: Compass,
    title: "Intent before implementation",
    description:
      "Every delivery starts with scope clarity, constraints, and measurable success criteria before code.",
  },
  {
    icon: Workflow,
    title: "Human + agent execution model",
    description:
      "Engineers define architecture and guardrails while AI agents accelerate repetitive and high-throughput work.",
  },
  {
    icon: ShieldCheck,
    title: "Operational trust by design",
    description:
      "Moderation signals, auth posture, and rollout readiness are visible before integrations reach production.",
  },
] as const;

const timeline = [
  {
    stage: "Plan",
    details: "Define outcomes, risks, and non-goals.",
  },
  {
    stage: "Build",
    details: "Execute with reusable workflows and quality gates.",
  },
  {
    stage: "Validate",
    details: "Confirm behavior through checks and browser verification.",
  },
  {
    stage: "Ship",
    details: "Roll out with signal, ownership, and feedback loops.",
  },
] as const;

const principles = [
  "Small, reversible changes over big-bang rewrites",
  "Measured outcomes over vanity velocity",
  "Documented decisions over tribal memory",
  "Security and reliability as default constraints",
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: tr(locale, "About Us", "About Us"),
    description: tr(
      locale,
      "How DemumuMind builds and ships MCP workflows with a human-led, agent-accelerated delivery model.",
      "How DemumuMind builds and ships MCP workflows with a human-led, agent-accelerated delivery model.",
    ),
  };
}

export default async function AboutPage() {
  const locale = await getLocale();

  return (
    <div className="relative overflow-hidden border-t border-white/10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#02070f_0%,#050b1c_50%,#06091b_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_18%_7%,rgba(56,189,248,0.22),transparent_40%),radial-gradient(circle_at_82%_8%,rgba(129,140,248,0.2),transparent_42%)]" />

      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="rounded-3xl border border-cyan-400/20 bg-indigo-950/72 p-6 sm:p-10">
          <Badge className="mb-4 border-cyan-400/35 bg-cyan-500/10 text-cyan-200">
            <Brain className="size-3" />
            {tr(locale, "About DemumuMind", "About DemumuMind")}
          </Badge>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-violet-50 sm:text-6xl">
            {tr(locale, "We build production MCP workflows, not demo theater.", "We build production MCP workflows, not demo theater.")}
          </h1>
          <p className="mt-5 max-w-4xl text-sm leading-8 text-violet-200 sm:text-lg">
            {tr(
              locale,
              "DemumuMind is an engineering organization focused on practical MCP delivery. We combine human architecture decisions with agent execution to help teams ship faster with higher confidence.",
              "DemumuMind is an engineering organization focused on practical MCP delivery. We combine human architecture decisions with agent execution to help teams ship faster with higher confidence.",
            )}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-blue-500 hover:bg-blue-400">
              <Link href="/catalog">
                {tr(locale, "Explore catalog", "Explore catalog")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20 bg-indigo-900/70 text-violet-50 hover:bg-indigo-900">
              <Link href="/how-to-use">{tr(locale, "Open setup guide", "Open setup guide")}</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <Card key={pillar.title} className="border-white/10 bg-indigo-950/76">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-violet-50">
                  <pillar.icon className="size-4 text-cyan-200" />
                  {pillar.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-violet-200">{pillar.description}</CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-white/10 bg-indigo-950/76">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-violet-50">
                {tr(locale, "How we deliver", "How we deliver")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {timeline.map((item, index) => (
                <div key={item.stage} className="rounded-xl border border-white/10 bg-indigo-900/65 px-4 py-3">
                  <p className="text-xs tracking-[0.15em] text-cyan-200 uppercase">
                    {tr(locale, `Stage ${index + 1}`, `Stage ${index + 1}`)} · {item.stage}
                  </p>
                  <p className="mt-1 text-sm text-violet-200">{item.details}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-indigo-950/76">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-2xl text-violet-50">
                <Rocket className="size-5 text-cyan-200" />
                {tr(locale, "Operating principles", "Operating principles")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-violet-200">
              {principles.map((principle) => (
                <div key={principle} className="rounded-xl border border-white/10 bg-indigo-900/65 px-4 py-2.5">
                  {principle}
                </div>
              ))}
              <p className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-cyan-100">
                {tr(
                  locale,
                  "Our mission: make high-quality agentic engineering repeatable for every product team.",
                  "Our mission: make high-quality agentic engineering repeatable for every product team.",
                )}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
