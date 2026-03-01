"use client";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
export function PersonaSelector({ title, description, scenarios, selectedPersona, chooseLabel, selectedLabel, onSelect, }: PersonaSelectorProps) {
    return (<div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h2>
        <p className="text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {scenarios.map((scenario) => {
            const isSelected = scenario.id === selectedPersona;
            return (<Card key={scenario.id} className={cn("border-border bg-card transition-colors duration-200 ease-out", isSelected
                    ? "border-primary/45 shadow-[0_0_0_1px_hsl(var(--primary)/0.25)]"
                    : "hover:border-primary/35")}>
              <div className={cn("transition-transform duration-200 ease-out motion-safe:will-change-transform", !isSelected && "group-hover:-translate-y-1")}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="outline" className={cn("border-primary/30 bg-primary/10 text-primary", isSelected && "border-emerald-400/40 bg-primary/10 text-primary")}>
                    {scenario.badge}
                  </Badge>
                  {isSelected ? (<span className="inline-flex items-center gap-1 text-xs text-primary">
                      <CheckCircle2 className="size-3.5"/>
                      {selectedLabel}
                    </span>) : null}
                </div>
                <CardTitle className="text-xl text-foreground">{scenario.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-7 text-muted-foreground">{scenario.description}</p>
                <Button type="button" variant={isSelected ? "default" : "outline"} className={cn("h-10 rounded-xl", isSelected
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border-border bg-card text-foreground hover:bg-accent")} onClick={() => onSelect(scenario.id)}>
                  {isSelected ? selectedLabel : chooseLabel}
                </Button>
              </CardContent>
              </div>
            </Card>);
        })}
      </div>
    </div>);
}

