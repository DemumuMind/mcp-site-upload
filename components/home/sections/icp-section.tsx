import { Blocks, Command, ShieldCheck, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HomeContent } from "@/lib/home/content";

type IcpSectionProps = {
  content: HomeContent["icp"];
};

export function IcpSection({ content }: IcpSectionProps) {
  const iconByToken: Record<string, LucideIcon> = {
    command: Command,
    blocks: Blocks,
    "shield-check": ShieldCheck,
  };

  return (
    <section className="border-y border-blacksmith bg-background">
      <div className="section-shell flex flex-col gap-8 py-14">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{content.heading}</h2>
          <p className="mx-auto max-w-3xl text-muted-foreground">{content.description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {content.cards.map((card) => {
            const Icon = iconByToken[card.icon] ?? Blocks;
            return (
              <Card key={card.title}>
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="rounded-lg border border-blacksmith bg-muted p-2.5">
                      <Icon className="size-4 text-foreground" aria-hidden="true" />
                    </div>
                    <Badge>ICP</Badge>
                  </div>
                  <CardTitle className="text-xl text-foreground">{card.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>{card.description}</p>
                  <p className="text-foreground">{card.outcome}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}


