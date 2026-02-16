import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HomeContent } from "@/lib/home/content";

type ProductProofSectionProps = {
  content: HomeContent["productProof"];
};

export function ProductProofSection({ content }: ProductProofSectionProps) {
  return (
    <section className="border-y border-blacksmith bg-background">
      <div className="section-shell grid gap-8 py-18 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div className="home-reveal home-delay-0 space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{content.heading}</h2>
          <p className="max-w-2xl text-muted-foreground">{content.description}</p>
        </div>

        <Card className="home-reveal home-delay-1 bg-card">
          <CardHeader>
            <CardTitle className="text-sm tracking-[0.16em] text-muted-foreground uppercase">What teams see in every listing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {content.bullets.map((bullet, index) => (
              <div
                key={bullet}
                className="home-reveal flex items-start gap-2.5 text-sm text-foreground"
                style={{ animationDelay: `${170 + index * 60}ms` }}
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{bullet}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
