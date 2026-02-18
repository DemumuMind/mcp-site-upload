import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HomeContent } from "@/lib/home/content";

type WorkflowSectionProps = {
  content: HomeContent["workflows"];
};

export function WorkflowSection({ content }: WorkflowSectionProps) {
  return (
    <section className="border-y border-blacksmith bg-background">
      <div className="section-shell flex flex-col gap-8 py-20">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">{content.heading}</h2>
          <p className="mx-auto max-w-3xl text-muted-foreground">{content.description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {content.cards.map((item) => (
            <Card key={item.title}>
              <CardHeader className="space-y-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-blacksmith bg-muted p-2.5">
                    <item.icon className={`size-4 ${item.accentClass}`} />
                  </div>
                  <CardTitle className="text-xl text-foreground">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>{item.description}</p>
                <Link href={item.href} className={`inline-flex items-center gap-2 text-sm font-medium ${item.accentClass}`}>
                  {item.cta}
                  <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}


