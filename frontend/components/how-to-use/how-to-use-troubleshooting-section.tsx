"use client";

import { TriangleAlert } from "lucide-react";
import type { HowToUseLocaleContent } from "@/lib/content/how-to-use";

type HowToUseTroubleshootingSectionProps = { troubleshooting: HowToUseLocaleContent["troubleshooting"]; };

export function HowToUseTroubleshootingSection({ troubleshooting }: HowToUseTroubleshootingSectionProps) {
  return (
    <div className="editorial-panel">
      <div className="space-y-2"><h2 className="type-section-title flex items-center gap-2 text-foreground"><TriangleAlert className="size-6 text-primary" />{troubleshooting.title}</h2><p className="text-sm leading-7 text-muted-foreground sm:text-base">{troubleshooting.description}</p></div>
      <div className="mt-6 grid gap-px border border-border/60 bg-border/60 md:grid-cols-2">
        {troubleshooting.items.map((item) => <div key={item.problem} className="bg-background px-5 py-5 sm:px-6"><h3 className="text-lg font-semibold text-foreground">{item.problem}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{item.fix}</p></div>)}
      </div>
    </div>
  );
}
