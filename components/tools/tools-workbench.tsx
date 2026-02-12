"use client";

import { RulesGeneratorPanel } from "@/components/tools/rules-generator-panel";
import { TokenCalculatorPanel } from "@/components/tools/token-calculator-panel";

export function ToolsWorkbench() {
  return (
    <section id="tools" className="space-y-4">
      <div className="rounded-2xl border border-slate-500/25 bg-slate-950/55 px-4 py-3 backdrop-blur-md">
        <p className="text-xs text-slate-300">
          Built for practical workflow speed: estimate token pressure, then generate opinionated project rules
          with reusable presets and export-ready outputs.
        </p>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <TokenCalculatorPanel />
        <RulesGeneratorPanel />
      </div>
    </section>
  );
}
