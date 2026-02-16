import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HomeContent } from "@/lib/home/content";

type FinalCtaSectionProps = {
  content: HomeContent["finalCta"];
};

export function FinalCtaSection({ content }: FinalCtaSectionProps) {
  return (
    <section className="relative border-y border-blacksmith bg-background">
      <div className="section-shell flex max-w-4xl flex-col items-center gap-6 py-24 text-center">
        <Badge>{content.badge}</Badge>
        <h3 className="text-4xl leading-tight font-semibold tracking-tight text-foreground sm:text-6xl">
          {content.titleLead}
          <span className="block text-primary">{content.titleAccent}</span>
        </h3>
        <p className="max-w-2xl text-lg text-muted-foreground">{content.description}</p>
        <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button asChild size="lg" className="relative h-12 w-full overflow-hidden rounded-lg px-8 sm:w-auto">
            <Link href="/catalog">
              <span className="pointer-events-none absolute inset-0 cta-shimmer opacity-70" aria-hidden />
              {content.primaryCta}
            </Link>
          </Button>
          <Link href="/how-to-use" className="text-center text-base text-muted-foreground underline decoration-primary/60 underline-offset-4 transition hover:text-foreground sm:text-left">
            {content.secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}

