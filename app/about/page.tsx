import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Brain, Compass, Rocket, ShieldCheck, Workflow } from "lucide-react";
import { PageFrame, PageHero, PageSection, PageShell } from "@/components/page-templates";
import { Button } from "@/components/ui/button";
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
    <PageFrame variant="marketing">
      <PageShell>
        <PageHero
          surface="mesh"
          eyebrow={
            <span className="flex items-center gap-2">
              <Brain className="size-3" />
              {tr(locale, "About DemumuMind", "About DemumuMind")}
            </span>
          }
          badgeTone="cyan"
          title={tr(locale, "We build production MCP workflows, not demo theater.", "We build production MCP workflows, not demo theater.")}
          description={tr(
            locale,
            "DemumuMind is an engineering organization focused on practical MCP delivery. We combine human architecture decisions with agent execution to help teams ship faster with higher confidence.",
            "DemumuMind is an engineering organization focused on practical MCP delivery. We combine human architecture decisions with agent execution to help teams ship faster with higher confidence.",
          )}
          actions={
            <>
              <Button asChild size="lg" className="h-11 rounded-md px-6 shadow-[0_0_20px_-5px_rgba(246,166,35,0.4)]">
                <Link href="/catalog">
                  {tr(locale, "Explore catalog", "Explore catalog")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 rounded-md border-blacksmith bg-background text-foreground hover:bg-muted/50">
                <Link href="/how-to-use">{tr(locale, "Open setup guide", "Open setup guide")}</Link>
              </Button>
            </>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_0.4fr]">
          <PageSection surface="steel" className="space-y-6">
            <h2 className="font-serif text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-4xl">
              {tr(locale, "How we deliver", "How we deliver")}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {pillars.map((pillar) => (
                <article key={pillar.title} className="rounded-xl border border-blacksmith bg-background/50 p-5 transition-colors hover:bg-muted/30">
                  <div className="mb-3 inline-flex rounded-sm border border-blacksmith bg-card p-1.5">
                    <pillar.icon className="size-4 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{pillar.description}</p>
                </article>
              ))}
            </div>
          </PageSection>

          <PageSection surface="rail" className="flex flex-col justify-center border-accent/20 bg-accent/5">
            <h2 className="font-serif text-2xl leading-tight font-semibold tracking-tight text-foreground">
              {tr(locale, "Our mission", "Our mission")}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {tr(
                locale,
                "Make high-quality agentic engineering repeatable for every product team through trusted MCP standards.",
                "Make high-quality agentic engineering repeatable for every product team through trusted MCP standards.",
              )}
            </p>
          </PageSection>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <PageSection surface="steel" className="space-y-6">
            <h2 className="font-serif text-3xl leading-tight font-semibold tracking-tight text-foreground">
              {tr(locale, "Delivery stages", "Delivery stages")}
            </h2>
            <div className="grid gap-3">
              {timeline.map((item, index) => (
                <div key={item.stage} className="rounded-xl border border-blacksmith bg-background/50 px-5 py-4 transition-colors hover:bg-muted/30">
                  <p className="text-[10px] font-bold tracking-[0.15em] text-primary uppercase">
                    {tr(locale, `Stage ${index + 1}`, `Stage ${index + 1}`)} — {item.stage}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.details}</p>
                </div>
              ))}
            </div>
          </PageSection>

          <PageSection surface="mesh" className="space-y-6">
            <h2 className="flex items-center gap-3 font-serif text-3xl leading-tight font-semibold tracking-tight text-foreground">
              <Rocket className="size-6 text-primary" aria-hidden="true" />
              {tr(locale, "Operating principles", "Operating principles")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {principles.map((principle) => (
                <div key={principle} className="flex items-center rounded-xl border border-blacksmith bg-background/50 px-4 py-3 text-sm leading-relaxed text-muted-foreground transition-colors hover:bg-muted/30">
                  {principle}
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-5 text-sm leading-relaxed text-primary shadow-[0_0_20px_-10px_rgba(246,166,35,0.3)]">
              {tr(
                locale,
                "We focus on creating sustainable, verifiable AI integration patterns that teams can own for the long term.",
                "We focus on creating sustainable, verifiable AI integration patterns that teams can own for the long term.",
              )}
            </div>
          </PageSection>
        </div>
      </PageShell>
    </PageFrame>
  );
}
