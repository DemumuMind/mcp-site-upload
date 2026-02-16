import { CountUpValue } from "@/components/home/count-up-value";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HomeContent } from "@/lib/home/content";
import type { HomeMetric } from "@/lib/home/types";

type ProofMetricsSectionProps = {
  content: HomeContent["metrics"];
  metrics: HomeMetric[];
};

function getMetricLabel(metric: HomeMetric, content: HomeContent["metrics"]): string {
  switch (metric.id) {
    case "servers":
      return content.labels.servers;
    case "tools":
      return content.labels.tools;
    case "categories":
      return content.labels.categories;
    default:
      return metric.label;
  }
}

export function ProofMetricsSection({ content, metrics }: ProofMetricsSectionProps) {
  return (
    <section className="relative overflow-hidden border-y border-blacksmith bg-black/35">
      <div className="pointer-events-none absolute -left-16 top-8 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 bottom-6 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

      <div className="section-shell relative flex flex-col gap-8 py-14">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{content.heading}</h2>
          <p className="mx-auto max-w-3xl text-muted-foreground">{content.description}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {metrics.map((metric, index) => (
            <Card
              key={metric.id}
              className="home-reveal bg-card transition-transform duration-300 hover:-translate-y-0.5"
              style={{ animationDelay: `${80 + index * 70}ms` }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs tracking-[0.18em] text-muted-foreground uppercase">{getMetricLabel(metric, content)}</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold text-primary">
                <CountUpValue end={metric.value} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
