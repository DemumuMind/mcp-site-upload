import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HomeContent } from "@/lib/home/content";

type HeroSectionProps = {
  content: HomeContent["hero"];
};

function renderAnimatedTitlePart(text: string, keyPrefix: string) {
  return text.split("").map((char, index) => (
    <span key={`${keyPrefix}-${index}`} data-anime="hero-char" className="inline-block translate-y-6 rotate-2 scale-95 opacity-0 will-change-transform">
      {char === " " ? "\u00A0" : char}
    </span>
  ));
}

export function HeroSection({ content }: HeroSectionProps) {
  return (
    <section className="section-shell relative flex flex-col items-center gap-8 overflow-hidden pb-16 pt-18 text-center sm:pb-20 sm:pt-24 lg:pt-28">
      <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-70" viewBox="0 0 1440 760" preserveAspectRatio="none" aria-hidden>
        <path data-anime="hero-svg-draw" className="fill-none stroke-primary/30 [stroke-width:2]" d="M180,430 C360,180 980,180 1240,430" />
        <path
          data-anime="hero-svg-morph"
          className="fill-none stroke-primary/25 [stroke-width:2]"
          d="M460,390 C540,270 720,295 760,420 C790,540 665,610 530,600 C395,590 350,480 460,390Z"
          data-morph-to="M460,390 C550,245 735,275 780,420 C812,560 658,640 522,615 C382,590 335,470 460,390Z"
        />
      </svg>

      <Badge data-anime="hero-eyebrow" className="mx-auto w-fit border-primary/35 bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase will-change-transform">
        {content.eyebrow}
      </Badge>

      <div data-anime="hero-content" className="max-w-5xl space-y-6">
        <h1 className="text-4xl leading-[0.92] font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          <span data-anime="hero-title-row" className="inline-block">
            {renderAnimatedTitlePart(content.titleLead, "lead")}
          </span>
          <span data-anime="hero-title-row" className="block text-primary">
            {renderAnimatedTitlePart(content.titleAccent, "accent")}
          </span>
        </h1>
        <p data-anime="hero-subtitle" className="mx-auto max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-xl will-change-transform">
          {content.description}
        </p>
      </div>

      <div data-anime="hero-actions" className="flex w-full max-w-xl flex-col items-stretch justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
        <Button asChild size="lg" className="anime-cta-primary relative h-12 w-full overflow-hidden rounded-lg px-7 text-sm font-semibold sm:w-auto" data-anime="hero-cta-primary">
          <Link href="/catalog">
            <span data-anime="shimmer" className="pointer-events-none absolute inset-0 opacity-70" aria-hidden />
            {content.primaryCta}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-12 w-full rounded-lg px-7 text-sm sm:w-auto">
          <Link href="/submit-server">{content.secondaryCta}</Link>
        </Button>
      </div>

      <div
        data-anime="float"
        className="mx-auto inline-flex max-w-full items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-4 py-2 text-xs text-foreground sm:text-sm shadow-[0_0_0_1px_rgba(247,201,72,0.16)]"
      >
        <Sparkles className="size-3.5 text-primary" />
        <span className="font-semibold">{content.pulseLabel}</span>
        <span className="text-muted-foreground">- {content.pulseText}</span>
      </div>
    </section>
  );
}
