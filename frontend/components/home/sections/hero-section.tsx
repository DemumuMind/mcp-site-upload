import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HomeContent } from "@/lib/home/content";

type HeroSectionProps = {
  content: HomeContent["hero"];
};

export function HeroSection({ content }: HeroSectionProps) {
  return (
    <section className="section-shell flex flex-col items-center gap-8 py-16 text-center sm:py-20 lg:py-24">
      <Badge className="mx-auto w-fit">{content.eyebrow}</Badge>

      <div className="max-w-5xl space-y-6">
        <h1 className="text-4xl leading-tight font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          {content.titleLead}
          <span className="block text-primary">{content.titleAccent}</span>
        </h1>
        <p className="mx-auto max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-xl">{content.description}</p>
      </div>

      <div className="flex w-full max-w-xl flex-col items-stretch justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
        <Button asChild size="lg" className="h-12 w-full rounded-lg px-7 text-sm font-semibold sm:w-auto">
          <Link href="/catalog">
            {content.primaryCta}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-12 w-full rounded-lg px-7 text-sm sm:w-auto">
          <Link href="/submit-server">{content.secondaryCta}</Link>
        </Button>
      </div>

      <div className="mx-auto inline-flex max-w-full items-center gap-2 rounded-full border px-4 py-2 text-xs text-foreground sm:text-sm">
        <Sparkles className="size-3.5 text-primary" />
        <span className="font-semibold">{content.pulseLabel}</span>
        <span className="text-muted-foreground">- {content.pulseText}</span>
      </div>
    </section>
  );
}

