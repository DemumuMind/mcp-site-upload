import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HomeContent } from "@/lib/home/content";

type IcpSectionProps = {
  content: HomeContent["icp"];
};

export function IcpSection({ content }: IcpSectionProps) {
  return (
    <section className="border-y border-white/10 bg-indigo-950/45">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-violet-50 sm:text-4xl">{content.heading}</h2>
          <p className="mx-auto max-w-3xl text-violet-200">{content.description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {content.cards.map((card) => (
            <Card key={card.title} className="border-white/10 bg-indigo-950/70">
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-xl border border-white/10 bg-indigo-900/80 p-2.5">
                    <card.icon className="size-4 text-violet-100" />
                  </div>
                  <Badge className="border-cyan-400/35 bg-cyan-500/10 text-cyan-200">ICP</Badge>
                </div>
                <CardTitle className="text-xl text-violet-50">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-violet-200">
                <p>{card.description}</p>
                <p className="text-violet-50">{card.outcome}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
