import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HomeContent } from "@/lib/home/content";

type ShowcaseSectionProps = {
  content: HomeContent["showcases"];
};

export function ShowcaseSection({ content }: ShowcaseSectionProps) {
  return (
    <section className="relative overflow-hidden border-y border-blacksmith bg-black/20">
      <div data-anime="pan" className="pointer-events-none absolute -right-20 top-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="section-shell space-y-8 py-20">
        <div data-anime="reveal" data-anime-delay="40" className="space-y-2 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{content.heading}</h2>
          <p className="mx-auto max-w-3xl leading-relaxed text-muted-foreground">{content.description}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {content.cards.map((item, index) => (
            <Card
              key={item.title}
              data-anime="reveal"
              data-anime-delay={String(110 + index * 70)}
              data-anime-hover="card"
              className="bg-card transition-transform duration-300 hover:-translate-y-0.5"
            >
              <CardHeader className="space-y-2">
                <CardTitle className="text-sm text-muted-foreground">{item.title}</CardTitle>
                <p className="text-3xl font-semibold text-primary">{item.value}</p>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{item.detail}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

