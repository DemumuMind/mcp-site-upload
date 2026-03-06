import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Rocket, ShieldCheck, Workflow } from "lucide-react";
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
      <main className="bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--accent)/0.14),transparent_24%),radial-gradient(circle_at_82%_20%,hsl(var(--primary)/0.18),transparent_20%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_65%)]" />
          <div className="section-shell flex min-h-[72vh] flex-col justify-center py-16 sm:py-20 lg:py-24">
            <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
              {tr(locale, "About DemumuMind", "About DemumuMind")}
            </p>
            <p className="mt-5 font-serif text-[clamp(3.3rem,11vw,8rem)] leading-none tracking-[-0.06em] text-foreground">
              DemumuMind
            </p>
            <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
              {tr(locale, "We build production MCP workflows, not demo theater.", "We build production MCP workflows, not demo theater.")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {tr(
                locale,
                "DemumuMind is an engineering organization focused on practical MCP delivery. We combine human architecture decisions with agent execution to help teams ship faster with higher confidence.",
                "DemumuMind is an engineering organization focused on practical MCP delivery. We combine human architecture decisions with agent execution to help teams ship faster with higher confidence.",
              )}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-11 rounded-none px-6">
                <Link href="/catalog">
                  {tr(locale, "Explore catalog", "Explore catalog")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 rounded-none border-border/80 bg-transparent px-6">
                <Link href="/how-to-use">{tr(locale, "Open setup guide", "Open setup guide")}</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-b border-border/60">
          <div className="section-shell grid gap-px border-x border-border/60 bg-border/60 lg:grid-cols-3">
            {pillars.map((pillar, index) => (
              <article key={pillar.title} className="bg-background px-0 py-8 lg:px-8">
                <div className="inline-flex size-11 items-center justify-center border border-border/70 text-primary">
                  <pillar.icon className="size-5" aria-hidden="true" />
                </div>
                <p className="mt-5 text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
                  {tr(locale, `Pillar ${index + 1}`, `Pillar ${index + 1}`)}
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-foreground">{pillar.title}</h2>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-b border-border/60">
          <div className="section-shell grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
                {tr(locale, "Our mission", "Our mission")}
              </p>
              <h2 className="mt-4 max-w-xl font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {tr(locale, "Make agentic engineering repeatable.", "Make agentic engineering repeatable.")}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {tr(
                  locale,
                  "We want teams to evaluate, validate, and ship MCP-backed workflows through a delivery system they can actually own long term.",
                  "We want teams to evaluate, validate, and ship MCP-backed workflows through a delivery system they can actually own long term.",
                )}
              </p>
              <div className="mt-8 border-t border-border/60 pt-5 text-sm text-muted-foreground">
                {tr(
                  locale,
                  "The catalog, moderation layer, and operating guidance all exist to reduce avoidable integration waste.",
                  "The catalog, moderation layer, and operating guidance all exist to reduce avoidable integration waste.",
                )}
              </div>
            </div>

            <div className="border border-border/60">
              {timeline.map((item, index) => (
                <div key={item.stage} className="grid gap-3 border-b border-border/60 px-5 py-5 last:border-b-0 sm:grid-cols-[96px_minmax(0,1fr)] sm:px-6">
                  <p className="text-xs tracking-[0.24em] text-muted-foreground uppercase">
                    {tr(locale, `Stage ${index + 1}`, `Stage ${index + 1}`)}
                  </p>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{item.stage}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="section-shell py-16 sm:py-20">
            <div className="border-t border-border/60 pt-10">
              <div className="flex items-center gap-3">
                <Rocket className="size-5 text-primary" aria-hidden="true" />
                <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">
                  {tr(locale, "Operating principles", "Operating principles")}
                </p>
              </div>
              <div className="mt-6 grid gap-px border-y border-border/60 bg-border/60 sm:grid-cols-2">
                {principles.map((principle) => (
                  <div key={principle} className="bg-background px-0 py-5 text-sm leading-relaxed text-foreground sm:px-6">
                    {principle}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}

