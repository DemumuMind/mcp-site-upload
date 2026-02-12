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
    <section className="mx-auto flex w-full max-w-7xl flex-col items-center gap-7 px-4 pb-12 pt-18 text-center sm:px-6 sm:pb-16 sm:pt-24 lg:px-8 lg:pt-28">
      <Badge className="mx-auto w-fit border border-cyan-400/45 bg-cyan-500/12 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-cyan-200 uppercase">
        {content.eyebrow}
      </Badge>

      <div className="max-w-4xl space-y-5">
        <h1 className="text-4xl leading-[0.96] font-semibold tracking-tight text-violet-50 sm:text-6xl lg:text-7xl">
          {content.titleLead}
          <span className="block bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
            {content.titleAccent}
          </span>
        </h1>
        <p className="mx-auto max-w-3xl text-base text-violet-200 sm:text-xl">{content.description}</p>
      </div>

      <div className="flex w-full max-w-xl flex-col items-stretch justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
        <Button
          asChild
          size="lg"
          className="h-12 w-full rounded-xl bg-blue-500 px-7 text-sm font-semibold text-white shadow-[0_0_32px_rgba(59,130,246,0.45)] transition hover:bg-blue-400 sm:w-auto"
        >
          <Link href="/catalog">
            {content.primaryCta}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="h-12 w-full rounded-xl border-white/15 bg-indigo-950/75 px-7 text-sm text-violet-50 hover:bg-indigo-900 sm:w-auto"
        >
          <Link href="/submit-server">{content.secondaryCta}</Link>
        </Button>
      </div>

      <div className="mx-auto inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-100 sm:text-sm">
        <Sparkles className="size-3.5 text-emerald-300" />
        <span className="font-semibold">{content.pulseLabel}</span>
        <span className="text-violet-200">- {content.pulseText}</span>
      </div>
    </section>
  );
}
