"use client";

import { FilterX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tr, type Locale } from "@/lib/i18n";
import type { ActiveFilterChip } from "@/components/catalog-section/use-catalog-controller";

export function ActiveFilterChips({
  locale,
  chips,
  onClearAll,
}: {
  locale: Locale;
  chips: ActiveFilterChip[];
  onClearAll: () => void;
}) {
  if (chips.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-2.5 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.9)] backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          {tr(locale, "Active filters", "Active filters")}
        </p>

        {chips.map(chip => (
          <button
            key={chip.key}
            type="button"
            onClick={chip.onRemove}
            className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground transition hover:bg-accent hover:text-foreground"
          >
            <span className="max-w-[170px] truncate">{chip.label}</span>
            <X className="size-3" />
          </button>
        ))}

        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={onClearAll}
          className="text-muted-foreground hover:bg-accent hover:text-foreground sm:ml-auto"
        >
          <FilterX className="size-3.5" />
          {tr(locale, "Clear all", "Clear all")}
        </Button>
      </div>
    </div>
  );
}
