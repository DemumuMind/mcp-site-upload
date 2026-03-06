"use client";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HowToUseLocaleAction, HowToUseLocaleScenario, HowToUsePersona } from "@/lib/content/how-to-use";

type ScenarioStepsProps = { scenario: HowToUseLocaleScenario; onPrimaryCtaClick: (action: HowToUseLocaleAction, persona: HowToUsePersona) => void; };

export function ScenarioSteps({ scenario, onPrimaryCtaClick }: ScenarioStepsProps) {
  return (
    <div className="editorial-panel">
      <div className="space-y-2"><h3 className="type-section-title text-foreground">{scenario.stepsTitle}</h3></div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="editorial-list border border-border/60">
          {scenario.steps.map((step, index) => (
            <div key={step.title} className="px-4 py-4 sm:px-5">
              <div className="flex items-center gap-3 text-lg font-semibold text-foreground"><span className="inline-flex size-7 items-center justify-center border border-primary/35 bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span>{step.title}</div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="border border-border/60 bg-background/72 p-5 backdrop-blur-sm sm:p-6">
          <h4 className="text-lg font-semibold text-foreground">{scenario.checklistTitle}</h4>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
            {scenario.checklistItems.map((item) => <li key={item} className="flex items-start gap-2"><CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" /><span>{item}</span></li>)}
          </ul>
          <Button asChild className="mt-6 h-11 w-full px-6"><Link href={scenario.primaryCta.href} onClick={() => onPrimaryCtaClick(scenario.primaryCta, scenario.id)}>{scenario.primaryCta.label}<ArrowRight className="size-4" /></Link></Button>
        </div>
      </div>
    </div>
  );
}
