import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/home-v3/primitives/section-label";
import { BlurFade } from "@/components/ui/blur-fade";
import type { HomeContent } from "@/lib/home/content";

type WorkflowSectionV3Props = {
  content: HomeContent["workflows"];
};

export function WorkflowSectionV3({ content }: WorkflowSectionV3Props) {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="section-shell space-y-8 py-16">
        <header className="space-y-3">
          <BlurFade delay={0.1} inView>
            <SectionLabel>Workflow</SectionLabel>
          </BlurFade>
          <BlurFade delay={0.2} inView>
            <h2 className="font-serif text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl">{content.heading}</h2>
          </BlurFade>
          <BlurFade delay={0.3} inView>
            <p className="max-w-3xl text-muted-foreground">{content.description}</p>
          </BlurFade>
        </header>

        <ol className="border-t border-border/60" aria-label="Delivery workflow steps">
          {content.cards.map((item, index) => (
            <BlurFade key={item.title} delay={0.4 + index * 0.1} inView>
              <li className="grid gap-5 border-b border-border/60 py-6 lg:grid-cols-[120px_minmax(0,1fr)_auto] lg:items-start">
                <p className="text-xs tracking-[0.28em] text-muted-foreground uppercase">Step {index + 1}</p>
                <div className="max-w-2xl">
                  <h3 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
                <div className="lg:pt-1">
                  <Link href={item.href} className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-transform hover:translate-x-1">
                    {item.cta}
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </li>
            </BlurFade>
          ))}
        </ol>
      </div>
    </section>
  );
}
