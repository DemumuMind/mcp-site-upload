"use client";

import Link from "next/link";
import { ArrowRight, ListChecks, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
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
    <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-6 pt-10 sm:px-6 sm:pt-14">
      <BlurFade delay={0.1}>
        <div className="relative overflow-hidden space-y-5 rounded-2xl border border-border bg-card/70 p-6 shadow-2xl shadow-primary/5 backdrop-blur-sm sm:p-10">
          <BorderBeam size={300} duration={12} delay={0} />
          <Badge className="w-fit border-primary/35 bg-primary/10 text-primary">
            <Sparkles className="size-3" />
            {sectionCopy?.eyebrow ??
              tr(
                locale,
                "Developer-First Onboarding",
                "Developer-First Onboarding"
              )}
          </Badge>

          <div className="space-y-3">
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              {sectionCopy?.heroTitle ?? tr(locale, "Setup Guide", "Setup Guide")}
            </h1>
            <p className="max-w-4xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {sectionCopy?.heroDescription ??
                tr(
                  locale,
                  "A practical playbook to connect MCP servers, validate trust and auth signals, and move to production safely.",
                  "A practical playbook to connect MCP servers, validate trust and auth signals, and move to production safely."
                )}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-11 rounded-md px-6 shadow-[0_0_25px_-5px_rgba(246,166,35,0.4)]"
            >
              <Link href={heroCatalogAction.href} onClick={onHeroCatalogClick}>
                {heroCatalogAction.label}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 rounded-md border-border bg-background text-foreground hover:bg-muted/50"
            >
              <Link href="#scenario-paths">
                <ListChecks className="size-4" />
                {secondaryLabel}
              </Link>
            </Button>
          </div>
        </div>
      </BlurFade>
    </section>
  );
}
