"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TaxonomyEntry = {
  label: string;
  count?: number;
};

export type FilterOption<TValue extends string> = {
  value: TValue;
  label: string;
  count: number;
};

export function TaxonomyList({
  title,
  items,
}: {
  title: string;
  items: readonly TaxonomyEntry[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_0_0_1px_hsl(var(--border)/0.45)] backdrop-blur">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <li key={item.label} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <span>{item.label}</span>
            {typeof item.count === "number" ? (
              <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
                {item.count}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function parseToolsBound(rawValue: string): number | null {
  if (rawValue.trim().length === 0) return null;
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, parsed);
}

export function toTaxonomyEntries(
  entries: Array<[string, number]> | undefined,
  fallbackValues: readonly string[],
) {
  if (entries && entries.length > 0) {
    return entries.map(([label, count]) => ({ label, count }));
  }
  return fallbackValues.map(label => ({ label }));
}

export function FilterOptionsSection<TValue extends string>({
  title,
  options,
  selectedValues,
  onToggle,
  className,
  renderLabelPrefix,
}: {
  title: string;
  options: readonly FilterOption<TValue>[];
  selectedValues: readonly TValue[];
  onToggle: (value: TValue) => void;
  className?: string;
  renderLabelPrefix?: (option: FilterOption<TValue>) => ReactNode;
}) {
  return (
    <div className={cn("border-t border-border px-4 py-4", className)}>
      <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
      <div className="space-y-1">
        {options.map(option => (
          <label key={option.value} className="flex cursor-pointer items-center justify-between rounded-md px-1.5 py-1.5 transition hover:bg-muted/50">
            <span className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="size-4 rounded border-border bg-background text-primary focus:ring-primary"
                checked={selectedValues.includes(option.value)}
                onChange={() => onToggle(option.value)}
              />
              {renderLabelPrefix ? renderLabelPrefix(option) : null}
              <span className="text-sm text-muted-foreground">{option.label}</span>
            </span>
            <span className="text-xs text-muted-foreground">{option.count}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
