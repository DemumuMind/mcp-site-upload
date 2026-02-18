import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HomeContent } from "@/lib/home/content";

type ShowcaseSectionProps = {
  content: HomeContent["showcases"];
};

export function ShowcaseSection({ content }: ShowcaseSectionProps) {
  return (
    <section className="border-y border-blacksmith bg-background">
      <div className="section-shell space-y-8 py-20">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{content.heading}</h2>
          <p className="mx-auto max-w-3xl leading-relaxed text-muted-foreground">{content.description}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {content.cards.map((item) => (
            <Card key={item.title} className="bg-card">
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



