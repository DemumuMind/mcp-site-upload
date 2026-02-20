import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/home-v3/primitives/section-label";
import { BorderBeam } from "@/components/ui/border-beam";
import { CoolMode } from "@/components/ui/cool-mode";
import { BlurFade } from "@/components/ui/blur-fade";
import type { HomeContent } from "@/lib/home/content";

type WorkflowSectionV3Props = {
  content: HomeContent["workflows"];
};

export function WorkflowSectionV3({ content }: WorkflowSectionV3Props) {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 -translate-x-1/2 size-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 translate-x-1/2 size-[500px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="section-shell relative z-10 space-y-7 py-14">
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

        <ol className="grid gap-4 lg:grid-cols-2" aria-label="Delivery workflow steps">
          {content.cards.map((item, index) => (
            <BlurFade key={item.title} delay={0.4 + index * 0.1} inView>
              <li className="group relative overflow-hidden rounded-md border border-blacksmith bg-card p-5 transition-all duration-300 hover:bg-muted/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                <BorderBeam size={80} duration={8} className="opacity-0 group-hover:opacity-100" />
                <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Step {index + 1}</p>
                <h3 className="mt-2 text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                <CoolMode>
                  <Link href={item.href} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                    {item.cta}
                    <ArrowRight className="size-4" />
                  </Link>
                </CoolMode>
              </li>
            </BlurFade>
          ))}
        </ol>
      </div>
    </section>
  );
}
