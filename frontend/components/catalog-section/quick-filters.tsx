"use client";

import { Button } from "@/components/ui/button";
import { tr, type Locale } from "@/lib/i18n";

export function QuickFilters({
  locale,
  applyQuickFilter,
}: {
  locale: Locale;
  applyQuickFilter: (type: "official" | "healthy" | "no_auth") => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-xs text-muted-foreground">{tr(locale, "Quick filters:", "Quick filters:")}</p>
      <Button
        type="button"
        variant="outline"
        size="xs"
        className="border-border bg-card"
        onClick={() => applyQuickFilter("official")}
      >
        {tr(locale, "Official only", "Official only")}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="xs"
        className="border-border bg-card"
        onClick={() => applyQuickFilter("healthy")}
      >
        {tr(locale, "Healthy only", "Healthy only")}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="xs"
        className="border-border bg-card"
        onClick={() => applyQuickFilter("no_auth")}
      >
        {tr(locale, "No auth only", "No auth only")}
      </Button>
    </div>
  );
}
