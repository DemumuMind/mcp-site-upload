"use client";

import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BorderBeam } from "@/components/ui/border-beam";
import type { HowToUseLocaleContent } from "@/lib/content/how-to-use";

type HowToUseTrustChecksSectionProps = {
  trustChecks: HowToUseLocaleContent["trustChecks"];
};

export function HowToUseTrustChecksSection({
  trustChecks,
}: HowToUseTrustChecksSectionProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="relative overflow-hidden space-y-4 rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-sm sm:p-8">
        <BorderBeam size={150} duration={8} delay={5} className="opacity-50" />
        <div className="space-y-2">
          <h2 className="font-serif flex items-center gap-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            <ShieldCheck className="size-6 text-primary" />
            {trustChecks.title}
          </h2>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            {trustChecks.description}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {trustChecks.items.map((item) => (
            <Card
              key={item.title}
              className="group relative overflow-hidden border-border bg-background/70 transition-colors hover:bg-muted/40"
            >
              <BorderBeam
                size={60}
                duration={10}
                className="opacity-0 group-hover:opacity-100"
              />
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-foreground">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">
                {item.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
