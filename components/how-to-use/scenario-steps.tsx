"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  HowToUseLocaleAction,
  HowToUseLocaleScenario,
  HowToUsePersona,
} from "@/lib/content/how-to-use";

type ScenarioStepsProps = {
  scenario: HowToUseLocaleScenario;
  onPrimaryCtaClick: (action: HowToUseLocaleAction, persona: HowToUsePersona) => void;
};

export function ScenarioSteps({ scenario, onPrimaryCtaClick }: ScenarioStepsProps) {
  return (
    <div id="scenario-paths" className="space-y-5 rounded-3xl border border-white/10 bg-slate-950/72 p-6 sm:p-8">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">{scenario.stepsTitle}</h3>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          {scenario.steps.map((step, index) => (
            <Card key={step.title} className="border-white/10 bg-slate-900/70">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-100">
                  <span className="inline-flex size-7 items-center justify-center rounded-full border border-cyan-400/35 bg-cyan-500/10 text-xs font-semibold text-cyan-200">
                    {index + 1}
                  </span>
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-slate-300">{step.description}</CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-100">{scenario.checklistTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm leading-7 text-slate-300">
              {scenario.checklistItems.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="h-11 w-full rounded-xl bg-blue-500 text-white hover:bg-blue-400">
              <Link
                href={scenario.primaryCta.href}
                onClick={() => onPrimaryCtaClick(scenario.primaryCta, scenario.id)}
              >
                {scenario.primaryCta.label}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
