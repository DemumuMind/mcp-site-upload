"use client";

import { TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HowToUseLocaleContent } from "@/lib/content/how-to-use";

type HowToUseTroubleshootingSectionProps = {
  troubleshooting: HowToUseLocaleContent["troubleshooting"];
};

export function HowToUseTroubleshootingSection({
  troubleshooting,
}: HowToUseTroubleshootingSectionProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="relative overflow-hidden space-y-4 rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-sm sm:p-8">
        <div className="space-y-2">
          <h2 className="font-serif flex items-center gap-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            <TriangleAlert className="size-6 text-primary" />
            {troubleshooting.title}
          </h2>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            {troubleshooting.description}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {troubleshooting.items.map((item) => (
            <Card key={item.problem} className="border-border bg-background/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-foreground">
                  {item.problem}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">
                {item.fix}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
