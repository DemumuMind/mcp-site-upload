import Link from "next/link";
import { ArrowRight, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/home-v3/primitives/section-label";
import type { HomeContent } from "@/lib/home/content";
import type { HomeMetric } from "@/lib/home/types";

type HeroSectionV3Props = {
  content: HomeContent["hero"];
  workflows: HomeContent["workflows"];
  metrics: HomeMetric[];
};

export function HeroSectionV3({ content, workflows, metrics }: HeroSectionV3Props) {
  return (
    <section className="border-b border-blacksmith bg-background">
      <div className="section-shell space-y-8 py-14 sm:py-20 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <SectionLabel>{content.eyebrow}</SectionLabel>
            <h1 className="max-w-4xl font-serif text-4xl leading-tight font-semibold tracking-tight text-foreground sm:text-6xl">
              {content.titleLead}
              <span className="block text-primary">{content.titleAccent}</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{content.description}</p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-11 rounded-md px-6">
                <Link href="/catalog">
                  {content.primaryCta}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 rounded-md px-6">
                <Link href="/submit-server">{content.secondaryCta}</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-blacksmith bg-card p-5">
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
                  className="group flex items-center justify-between rounded-md border border-blacksmith px-3 py-2 text-sm transition hover:bg-muted"
                >
                  <span>{item.cta}</span>
                  <ArrowRight className="size-4 text-muted-foreground transition group-hover:text-foreground" />
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <ul className="grid gap-2 sm:grid-cols-3" aria-label="Catalog signal strip">
          {metrics.map((metric) => (
            <li key={metric.id} className="rounded-md border border-blacksmith bg-card px-4 py-3">
              <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">{metric.label}</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{metric.value.toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

