"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HowToUseLocaleScenario, HowToUsePersona } from "@/lib/content/how-to-use";
import { cn } from "@/lib/utils";

type PersonaSelectorProps = {
  title: string;
  description: string;
  scenarios: HowToUseLocaleScenario[];
  selectedPersona: HowToUsePersona;
  chooseLabel: string;
  selectedLabel: string;
  onSelect: (persona: HowToUsePersona) => void;
};

export function PersonaSelector({
  title,
  description,
  scenarios,
  selectedPersona,
  chooseLabel,
  selectedLabel,
  onSelect,
}: PersonaSelectorProps) {
  return (
    <div id="scenario-paths" className="space-y-6 border-y border-border/60 py-8 sm:py-10">
      <div className="max-w-3xl space-y-2">
        <h2 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">{title}</h2>
        <p className="text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
      </div>

      <div className="grid gap-px border border-border/60 bg-border/60 lg:grid-cols-2">
        {scenarios.map((scenario) => {
          const isSelected = scenario.id === selectedPersona;

          return (
            <article key={scenario.id} className="bg-background px-5 py-6 sm:px-6 sm:py-7">
              <div className="flex items-start justify-between gap-4">
                <p className="text-[11px] tracking-[0.22em] text-primary uppercase">{scenario.badge}</p>
                {isSelected ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <CheckCircle2 className="size-3.5" />
                    {selectedLabel}
                  </span>
                ) : null}
              </div>

              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{scenario.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{scenario.description}</p>

              <Button
                type="button"
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "mt-6 h-11 rounded-none px-6",
                  isSelected ? "" : "border-border/80 bg-transparent",
                )}
                onClick={() => onSelect(scenario.id)}
              >
                {isSelected ? selectedLabel : chooseLabel}
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
