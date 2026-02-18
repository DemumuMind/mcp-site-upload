import { Badge } from "@/components/ui/badge";
import { SectionLabel } from "@/components/home-v3/primitives/section-label";
import type { HomeContent } from "@/lib/home/content";

type IcpUseCasesSectionV3Props = {
  content: HomeContent["icp"];
};

export function IcpUseCasesSectionV3({ content }: IcpUseCasesSectionV3Props) {
  return (
    <section className="border-b border-blacksmith bg-background">
      <div className="section-shell space-y-7 py-14">
        <header className="space-y-3">
          <SectionLabel>ICP / Use Cases</SectionLabel>
          <h2 className="font-serif text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl">{content.heading}</h2>
          <p className="max-w-3xl text-muted-foreground">{content.description}</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-3">
          {content.cards.map((card) => (
            <article key={card.title} className="rounded-md border border-blacksmith bg-card p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="inline-flex rounded-sm border border-blacksmith bg-background p-1.5">
                  <card.icon className="size-4 text-primary" aria-hidden="true" />
                </div>
                <Badge variant="outline">ICP</Badge>
              </div>
              <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
              <p className="mt-4 text-sm font-medium text-foreground">{card.outcome}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

