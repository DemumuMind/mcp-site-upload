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
    <section className="border-y border-white/10 bg-indigo-950/45">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-violet-50 sm:text-4xl">{content.heading}</h2>
          <p className="mx-auto max-w-3xl text-violet-200">{content.description}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {metrics.map((metric) => (
            <Card key={metric.id} className="border-white/10 bg-indigo-950/78">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs tracking-[0.18em] text-violet-300 uppercase">
                  {getMetricLabel(metric, content)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold text-violet-50">{metric.value.toLocaleString()}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
