"use client";

import Link from "next/link";
import { ArrowRight, ListChecks } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import type { HowToUseLocaleAction } from "@/lib/content/how-to-use";
import type { SectionLocaleCopy } from "@/lib/content/section-index";
import { tr, type Locale } from "@/lib/i18n";

type HowToUseHeroProps = {
  locale: Locale;
  sectionCopy: SectionLocaleCopy | null;
  secondaryLabel: string;
  heroCatalogAction: HowToUseLocaleAction;
  onHeroCatalogClick: () => void;
};

export function HowToUseHero({
  locale,
  sectionCopy,
  secondaryLabel,
  heroCatalogAction,
  onHeroCatalogClick,
}: HowToUseHeroProps) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_24%),radial-gradient(circle_at_84%_16%,hsl(var(--accent)/0.14),transparent_18%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_68%)]" />
      <div className="section-shell min-h-[72vh] py-16 sm:py-20 lg:py-24">
        <BlurFade delay={0.1}>
          <div className="max-w-5xl">
            <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
              {sectionCopy?.eyebrow ?? tr(locale, "DemumuMind Setup", "DemumuMind Setup")}
            </p>
            <p className="mt-5 font-serif text-[clamp(3.2rem,10vw,7rem)] leading-none tracking-[-0.06em] text-foreground">
              DemumuMind
            </p>
            <h1 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
              {sectionCopy?.heroTitle ?? tr(locale, "Setup Guide", "Setup Guide")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {sectionCopy?.heroDescription ??
                tr(
                  locale,
                  "A practical playbook to connect MCP servers, validate trust and auth signals, and move to production safely.",
                  "A practical playbook to connect MCP servers, validate trust and auth signals, and move to production safely.",
                )}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-11 rounded-none px-6">
                <Link href={heroCatalogAction.href} onClick={onHeroCatalogClick}>
                  {heroCatalogAction.label}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 rounded-none border-border/80 bg-transparent px-6">
                <Link href="#scenario-paths">
                  <ListChecks className="size-4" />
                  {secondaryLabel}
                </Link>
              </Button>
            </div>
          </div>
        </BlurFade>
      </div>
    </section>
  );
}
