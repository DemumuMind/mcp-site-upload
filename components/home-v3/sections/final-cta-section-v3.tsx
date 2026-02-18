import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/home-v3/primitives/section-label";
import type { HomeContent } from "@/lib/home/content";

type FinalCtaSectionV3Props = {
  content: HomeContent["finalCta"];
};

export function FinalCtaSectionV3({ content }: FinalCtaSectionV3Props) {
  return (
    <section className="bg-background">
      <div className="section-shell py-16 sm:py-20">
        <div className="rounded-md border border-blacksmith bg-card p-8 sm:p-10">
          <div className="space-y-5">
            <SectionLabel>{content.badge}</SectionLabel>
            <h2 className="font-serif text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl">
              {content.titleLead}
              <span className="block text-primary">{content.titleAccent}</span>
            </h2>
            <p className="max-w-3xl text-muted-foreground">{content.description}</p>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="h-11 rounded-md px-6">
              <Link href="/catalog">
                {content.primaryCta}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 rounded-md px-6">
              <Link href="/how-to-use">{content.secondaryCta}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

