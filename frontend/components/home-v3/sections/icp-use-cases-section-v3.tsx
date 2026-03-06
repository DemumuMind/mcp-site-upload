import { Blocks, Command, ShieldCheck } from "lucide-react";
import { SectionLabel } from "@/components/home-v3/primitives/section-label";
import { BlurFade } from "@/components/ui/blur-fade";
import type { HomeContent } from "@/lib/home/content";

type IcpUseCasesSectionV3Props = {
  content: HomeContent["icp"];
};

export function IcpUseCasesSectionV3({ content }: IcpUseCasesSectionV3Props) {
  const renderIcon = (token: string) => {
    if (token === "command") return <Command className="size-4 text-primary" aria-hidden="true" />;
    if (token === "shield-check") return <ShieldCheck className="size-4 text-primary" aria-hidden="true" />;
    return <Blocks className="size-4 text-primary" aria-hidden="true" />;
  };

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="section-shell space-y-8 py-16">
        <header className="space-y-3">
          <SectionLabel>ICP / Use Cases</SectionLabel>
          <h2 className="font-serif text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl">{content.heading}</h2>
          <p className="max-w-3xl text-muted-foreground">{content.description}</p>
        </header>

        <div className="grid gap-px border-y border-border/60 bg-border/60 lg:grid-cols-3">
          {content.cards.map((card, index) => (
            <BlurFade key={card.title} delay={0.14 + index * 0.08} inView>
              <article className="h-full bg-background px-0 py-6 lg:px-6">
                <div className="inline-flex size-10 items-center justify-center border border-border/70 bg-transparent">
                  {renderIcon(card.icon)}
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-foreground">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{card.description}</p>
                <p className="mt-6 text-[11px] tracking-[0.2em] text-muted-foreground uppercase">Outcome</p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">{card.outcome}</p>
              </article>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
