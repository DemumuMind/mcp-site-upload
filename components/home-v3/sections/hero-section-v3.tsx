import Link from "next/link";
import { ArrowRight, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/home-v3/primitives/section-label";
import { Particles } from "@/components/ui/particles";
import { BorderBeam } from "@/components/ui/border-beam";
import { CoolMode } from "@/components/ui/cool-mode";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { NumberTicker } from "@/components/ui/number-ticker";
import { GridPattern } from "@/components/ui/grid-pattern";
import { BlurFade } from "@/components/ui/blur-fade";
import type { HomeContent } from "@/lib/home/content";
import type { HomeMetric } from "@/lib/home/types";

type HeroSectionV3Props = {
  content: HomeContent["hero"];
  workflows: HomeContent["workflows"];
  metrics: HomeMetric[];
};

export function HeroSectionV3({ content, workflows, metrics }: HeroSectionV3Props) {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Hero-specific Atmospheric Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Particles
          className="absolute inset-0"
          quantity={100}
          staticity={20}
          color="#F6A623"
          size={0.8}
        />
        <GridPattern
          width={40}
          height={40}
          x={-1}
          y={-1}
          className={cn(
            "[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]",
            "opacity-20"
          )}
        />
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="section-shell relative z-10 space-y-8 py-14 sm:py-20 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <BlurFade delay={0.1}>
              <SectionLabel className="text-accent/90">Industrial Intelligence</SectionLabel>
            </BlurFade>
            <div className="max-w-4xl">
              <BlurFade delay={0.2}>
                <h1 className="font-serif text-4xl leading-tight font-semibold tracking-tight sm:text-6xl">
                  <TypingAnimation
                    text={content.titleLead}
                    className="text-foreground"
                    duration={50}
                  />
                  <span className="shiny-text text-primary">{content.titleAccent}</span>
                </h1>
              </BlurFade>
            </div>
            <BlurFade delay={0.4}>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{content.description}</p>
            </BlurFade>

            <BlurFade delay={0.5}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <CoolMode>
                  <Button asChild size="lg" className="h-11 rounded-md px-6 shadow-[0_0_30px_-5px_rgba(255,165,0,0.6)] hover:shadow-[0_0_40px_-5px_rgba(255,165,0,0.8)] transition-shadow">
                    <Link href="/catalog">
                      {content.primaryCta}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </CoolMode>
                <Button asChild size="lg" variant="outline" className="h-11 rounded-md px-6">
                  <Link href="/submit-server">{content.secondaryCta}</Link>
                </Button>
              </div>
            </BlurFade>
          </div>

          <BlurFade delay={0.6}>
            <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-card p-5 shadow-[0_0_50px_-12px_rgba(246,166,35,0.15)]">
              <BorderBeam size={350} duration={10} delay={9} borderWidth={2} />
              <div className="mb-3 flex items-center gap-2">
                <Command className="size-4 text-primary" />
                <SectionLabel>{content.pulseLabel}</SectionLabel>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">{content.pulseText}</p>

              <nav aria-label="Primary homepage workflows" className="space-y-2">
                {workflows.cards.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex items-center justify-between rounded-md border border-blacksmith px-3 py-2 text-sm transition hover:bg-muted/50"
                  >
                    <span>{item.cta}</span>
                    <ArrowRight className="size-4 text-muted-foreground transition group-hover:text-foreground" />
                  </Link>
                ))}
              </nav>
            </div>
          </BlurFade>
        </div>

        <ul className="grid gap-2 sm:grid-cols-3" aria-label="Catalog signal strip">
          {metrics.map((metric, idx) => (
            <BlurFade key={metric.id} delay={0.7 + idx * 0.1}>
              <li className="relative overflow-hidden rounded-md border border-blacksmith bg-card px-4 py-3">
                <BorderBeam size={100} duration={8} />
                <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">{metric.label}</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <NumberTicker
                    value={metric.value}
                    className="text-2xl font-semibold text-foreground"
                  />
                  {metric.value >= 1000 && <span className="text-xl font-semibold text-foreground">+</span>}
                </div>
              </li>
            </BlurFade>
          ))}
        </ul>
      </div>
    </section>
  );
}
