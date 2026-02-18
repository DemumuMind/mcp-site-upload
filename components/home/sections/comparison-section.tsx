"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { HomeContent } from "@/lib/home/content";

type ComparisonSectionProps = {
  content: HomeContent["comparison"];
};

export function ComparisonSection({ content }: ComparisonSectionProps) {
  const [selectedId, setSelectedId] = useState(content.stacks[0]?.id ?? "");

  const selectedStack = useMemo(
    () => content.stacks.find((stack) => stack.id === selectedId) ?? content.stacks[0],
    [content.stacks, selectedId],
  );

  if (!selectedStack) return null;

  return (
    <section className="border-y border-blacksmith bg-background">
      <div className="section-shell grid gap-8 py-20 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <div className="space-y-4">
          <h2 className="text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-4xl">{content.heading}</h2>
          <p className="max-w-xl leading-relaxed text-muted-foreground">{content.description}</p>

          <div className="max-w-xs space-y-2">
            <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{content.selectorLabel}</p>
            <Select value={selectedStack.id} onValueChange={setSelectedId}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {content.stacks.map((stack) => (
                  <SelectItem key={stack.id} value={stack.id}>
                    {stack.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-blacksmith bg-background">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Legacy process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground">
              <p><span className="text-muted-foreground">Time:</span> {selectedStack.legacyTime}</p>
              <p><span className="text-muted-foreground">Effort:</span> {selectedStack.legacyCost}</p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm text-primary">DemumuMind flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground">
              <p><span className="text-muted-foreground">Time:</span> {selectedStack.demumuTime}</p>
              <p><span className="text-muted-foreground">Effort:</span> {selectedStack.demumuCost}</p>
            </CardContent>
          </Card>
          <p className="sm:col-span-2 text-sm leading-relaxed text-muted-foreground">{selectedStack.summary}</p>
        </div>
      </div>
    </section>
  );
}



