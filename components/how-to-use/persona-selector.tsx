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
        <h2 className="text-3xl font-semibold tracking-tight text-violet-50 sm:text-4xl">{title}</h2>
        <p className="text-sm leading-7 text-violet-200 sm:text-base">{description}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {scenarios.map((scenario) => {
            const isSelected = scenario.id === selectedPersona;
            return (<Card key={scenario.id} className={cn("border-white/10 bg-indigo-950/75 transition duration-300", isSelected
                    ? "border-cyan-400/45 shadow-[0_0_0_1px_rgba(34,211,238,0.22)]"
                    : "hover:-translate-y-1 hover:border-cyan-400/35")}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="outline" className={cn("border-cyan-400/30 bg-cyan-500/10 text-cyan-200", isSelected && "border-emerald-400/40 bg-emerald-500/10 text-emerald-200")}>
                    {scenario.badge}
                  </Badge>
                  {isSelected ? (<span className="inline-flex items-center gap-1 text-xs text-emerald-300">
                      <CheckCircle2 className="size-3.5"/>
                      {selectedLabel}
                    </span>) : null}
                </div>
                <CardTitle className="text-xl text-violet-50">{scenario.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-7 text-violet-200">{scenario.description}</p>
                <Button type="button" variant={isSelected ? "default" : "outline"} className={cn("h-10 rounded-xl", isSelected
                    ? "bg-emerald-500 text-white hover:bg-emerald-400"
                    : "border-white/20 bg-indigo-900/70 text-violet-50 hover:bg-indigo-900")} onClick={() => onSelect(scenario.id)}>
                  {isSelected ? selectedLabel : chooseLabel}
                </Button>
              </CardContent>
            </Card>);
        })}
      </div>
    </div>);
}
