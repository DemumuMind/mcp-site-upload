import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Brain, Compass, Rocket, ShieldCheck, Workflow } from "lucide-react";
import { PageFrame } from "@/components/page-templates";
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
      <main>
        <section className="border-b border-blacksmith bg-background" aria-labelledby="about-hero-title">
          <div className="section-shell py-14 sm:py-20 lg:py-24">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
              <header className="space-y-6">
                <p className="inline-flex w-fit items-center gap-2 rounded-full border border-blacksmith bg-card px-3 py-1 text-xs font-semibold tracking-[0.12em] text-foreground uppercase">
                  <Brain className="size-3" aria-hidden="true" />
                  {tr(locale, "About DemumuMind", "About DemumuMind")}
                </p>

                <h1
                  id="about-hero-title"
                  className="max-w-4xl font-serif text-4xl leading-tight font-semibold tracking-tight text-foreground sm:text-6xl"
                >
                  {tr(locale, "We build production MCP workflows, not demo theater.", "We build production MCP workflows, not demo theater.")}
                </h1>

                <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {tr(
                    locale,
                    "DemumuMind is an engineering organization focused on practical MCP delivery. We combine human architecture decisions with agent execution to help teams ship faster with higher confidence.",
                    "DemumuMind is an engineering organization focused on practical MCP delivery. We combine human architecture decisions with agent execution to help teams ship faster with higher confidence.",
                  )}
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button asChild size="lg" className="h-11 rounded-md px-6">
                    <Link href="/catalog">
                      {tr(locale, "Explore catalog", "Explore catalog")}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-11 rounded-md px-6">
                    <Link href="/how-to-use">{tr(locale, "Open setup guide", "Open setup guide")}</Link>
                  </Button>
                </div>
              </header>

              <aside className="rounded-md border border-blacksmith bg-card p-5 sm:p-6" aria-labelledby="about-mission-title">
                <h2 id="about-mission-title" className="font-serif text-2xl leading-tight font-semibold tracking-tight text-foreground">
                  {tr(locale, "Our mission: make high-quality agentic engineering repeatable for every product team.", "Our mission: make high-quality agentic engineering repeatable for every product team.")}
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {tr(
                    locale,
                    "How DemumuMind builds and ships MCP workflows with a human-led, agent-accelerated delivery model.",
                    "How DemumuMind builds and ships MCP workflows with a human-led, agent-accelerated delivery model.",
                  )}
                </p>
              </aside>
            </div>
          </div>
        </section>

        <section className="border-b border-blacksmith bg-background" aria-labelledby="about-pillars-title">
          <div className="section-shell py-14">
            <header className="mb-6 space-y-3">
              <h2 id="about-pillars-title" className="font-serif text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl">
                {tr(locale, "How we deliver", "How we deliver")}
              </h2>
            </header>

            <div className="grid gap-4 lg:grid-cols-3" role="list" aria-label={tr(locale, "Delivery pillars", "Delivery pillars")}>
              {pillars.map((pillar) => (
                <article key={pillar.title} role="listitem" className="rounded-md border border-blacksmith bg-card p-5">
                  <div className="mb-3 inline-flex rounded-sm border border-blacksmith bg-background p-1.5">
                    <pillar.icon className="size-4 text-primary" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{pillar.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-blacksmith bg-background" aria-labelledby="about-operating-title">
          <div className="section-shell py-14">
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <section className="rounded-md border border-blacksmith bg-card p-5 sm:p-6" aria-labelledby="about-timeline-title">
                <h2 id="about-timeline-title" className="font-serif text-3xl leading-tight font-semibold tracking-tight text-foreground">
                  {tr(locale, "How we deliver", "How we deliver")}
                </h2>
                <ol className="mt-4 space-y-3" aria-label={tr(locale, "Delivery stages", "Delivery stages")}>
                  {timeline.map((item, index) => (
                    <li key={item.stage} className="rounded-md border border-blacksmith bg-background px-4 py-3">
                      <p className="text-xs tracking-[0.15em] text-primary uppercase">
                        {tr(locale, `Stage ${index + 1}`, `Stage ${index + 1}`)} - {item.stage}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.details}</p>
                    </li>
                  ))}
                </ol>
              </section>

              <aside className="rounded-md border border-blacksmith bg-card p-5 sm:p-6" aria-labelledby="about-operating-title">
                <h2 id="about-operating-title" className="flex items-center gap-2 font-serif text-3xl leading-tight font-semibold tracking-tight text-foreground">
                  <Rocket className="size-5 text-primary" aria-hidden="true" />
                  {tr(locale, "Operating principles", "Operating principles")}
                </h2>

                <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground" aria-label={tr(locale, "Operating principles list", "Operating principles list")}>
                  {principles.map((principle) => (
                    <li key={principle} className="rounded-md border border-blacksmith bg-background px-4 py-2.5">
                      {principle}
                    </li>
                  ))}
                </ul>

                <p className="mt-4 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
                  {tr(
                    locale,
                    "Our mission: make high-quality agentic engineering repeatable for every product team.",
                    "Our mission: make high-quality agentic engineering repeatable for every product team.",
                  )}
                </p>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
