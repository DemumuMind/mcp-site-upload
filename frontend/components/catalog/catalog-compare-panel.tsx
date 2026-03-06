"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, ChevronUp, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildCatalogCompareItems,
  type CatalogShortlistItem,
} from "@/lib/catalog/compare";
import { tr, type Locale } from "@/lib/i18n";

type CatalogComparePanelProps = {
  locale: Locale;
  items: CatalogShortlistItem[];
  onClearShortlist: () => void;
};

type CatalogMobileCompareDockProps = CatalogComparePanelProps & {
  isOpen: boolean;
  onOpenChange: (nextOpen: boolean) => void;
};

type CompareMetricRow = {
  label: string;
  getValue: (item: ReturnType<typeof buildCatalogCompareItems>[number]) => string;
};

const compareMetricRows: CompareMetricRow[] = [
  {
    label: "Trust",
    getValue: (item) => item.trustScore.toFixed(1),
  },
  {
    label: "Health",
    getValue: (item) => formatHealthLabel(item.healthStatus),
  },
  {
    label: "Auth",
    getValue: (item) => formatAuthLabel(item.authType),
  },
  {
    label: "Tool depth",
    getValue: (item) => `${item.toolsCount} tools`,
  },
  {
    label: "Category",
    getValue: (item) => item.category,
  },
  {
    label: "Best use",
    getValue: (item) => item.bestUse,
  },
  {
    label: "Verdict",
    getValue: (item) => item.verdict,
  },
];

function formatAuthLabel(authType: CatalogShortlistItem["authType"]) {
  switch (authType) {
    case "none":
      return "None";
    case "oauth":
      return "OAuth";
    case "api_key":
      return "API key";
  }
}

function formatHealthLabel(healthStatus: CatalogShortlistItem["healthStatus"]) {
  switch (healthStatus) {
    case "healthy":
      return "Healthy";
    case "unknown":
      return "Unknown";
    case "degraded":
      return "Degraded";
    case "down":
      return "Down";
  }
}

function useCompareItems(items: CatalogShortlistItem[]) {
  return useMemo(() => buildCatalogCompareItems(items).slice(0, 3), [items]);
}

export function CatalogComparePanel({
  locale,
  items,
  onClearShortlist,
}: CatalogComparePanelProps) {
  const compareItems = useCompareItems(items);
  const recommended = compareItems[0];

  if (!recommended) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-primary/20 bg-[linear-gradient(180deg,hsl(var(--surface-1))/0.98,hsl(var(--background))/0.94)] shadow-[0_26px_70px_-38px_hsl(var(--foreground)/0.55)]">
      <div className="border-b border-border/60 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
              <ShieldCheck className="size-3.5" />
              <span>{tr(locale, "Compare shortlist", "Compare shortlist")}</span>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-foreground">
              {tr(locale, "Trust + fit matrix", "Trust + fit matrix")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {tr(
                locale,
                "Resolve the shortlist here before opening deeper detail pages.",
                "Resolve the shortlist here before opening deeper detail pages.",
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-primary/25 bg-primary/10 px-3 text-sm font-semibold text-primary">
              {compareItems.length}
            </span>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={onClearShortlist}
            >
              {tr(locale, "Clear", "Clear")}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
            {tr(locale, "Best fit now", "Best fit now")}
          </p>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg font-semibold text-foreground">{recommended.name}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {tr(
                  locale,
                  `${recommended.name} leads on trust signal, auth simplicity, and rollout readiness.`,
                  `${recommended.name} leads on trust signal, auth simplicity, and rollout readiness.`,
                )}
              </p>
            </div>
            <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-primary" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
              {tr(locale, `Trust ${recommended.trustScore.toFixed(1)}`, `Trust ${recommended.trustScore.toFixed(1)}`)}
            </Badge>
            <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
              {tr(locale, formatHealthLabel(recommended.healthStatus), formatHealthLabel(recommended.healthStatus))}
            </Badge>
            <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
              {tr(locale, recommended.bestUse, recommended.bestUse)}
            </Badge>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {compareItems.map((item, index) => (
            <div
              key={item.slug}
              className={cn(
                "rounded-2xl border px-3 py-3",
                index === 0 ? "border-primary/30 bg-primary/10" : "border-border/60 bg-background/70",
              )}
            >
              <p className={cn("text-sm font-semibold", index === 0 ? "text-primary" : "text-foreground")}>
                {item.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{tr(locale, item.bestUse, item.bestUse)}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/80">
          <div className="grid grid-cols-[112px_repeat(3,minmax(0,1fr))] border-b border-border/60 bg-card/70 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            <div className="px-3 py-3">{tr(locale, "Signal", "Signal")}</div>
            {compareItems.map((item) => (
              <div key={item.slug} className="px-3 py-3 text-foreground normal-case tracking-normal">
                {item.name}
              </div>
            ))}
          </div>
          {compareMetricRows.map((row, rowIndex) => (
            <div
              key={row.label}
              className={cn(
                "grid grid-cols-[112px_repeat(3,minmax(0,1fr))] text-sm",
                rowIndex !== compareMetricRows.length - 1 && "border-b border-border/60",
              )}
            >
              <div className="px-3 py-3 text-muted-foreground">{tr(locale, row.label, row.label)}</div>
              {compareItems.map((item, itemIndex) => (
                <div
                  key={`${item.slug}-${row.label}`}
                  className={cn(
                    "px-3 py-3",
                    itemIndex === 0 ? "font-medium text-primary" : "text-foreground",
                  )}
                >
                  {tr(locale, row.getValue(item), row.getValue(item))}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button asChild className="flex-1 rounded-xl">
            <Link href={recommended.href}>{tr(locale, "Open recommended server", "Open recommended server")}</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href={recommended.href}>{tr(locale, "View full details", "View full details")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function CatalogMobileCompareDock({
  locale,
  items,
  isOpen,
  onOpenChange,
  onClearShortlist,
}: CatalogMobileCompareDockProps) {
  const compareItems = useCompareItems(items);
  const recommended = compareItems[0] ?? null;
  const [activeSlug, setActiveSlug] = useState<string | null>(recommended?.slug ?? null);

  const activeItem = compareItems.find((item) => item.slug === activeSlug) ?? recommended;
  const runnerUp = compareItems.find((item) => item.slug !== activeItem?.slug) ?? null;

  if (!recommended) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-x-3 bottom-3 z-40 xl:hidden">
        <Button
          type="button"
          className="h-12 w-full rounded-2xl shadow-[0_20px_44px_-24px_hsl(var(--primary)/0.75)]"
          onClick={() => onOpenChange(true)}
        >
          <SlidersHorizontal className="size-4" />
          {tr(locale, `Compare (${compareItems.length})`, `Compare (${compareItems.length})`)}
          <ChevronUp className="size-4" />
        </Button>
      </div>

      {isOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-[2px] xl:hidden"
            onClick={() => onOpenChange(false)}
            aria-label={tr(locale, "Close compare", "Close compare")}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-[1.75rem] border border-primary/15 bg-[linear-gradient(180deg,hsl(var(--surface-1))/0.98,hsl(var(--background))/0.98)] px-4 pb-5 pt-4 shadow-[0_-24px_64px_-28px_rgba(0,0,0,0.8)] xl:hidden">
            <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-border/80" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
                  {tr(locale, "Compare shortlist", "Compare shortlist")}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                  {tr(locale, "Trust + fit", "Trust + fit")}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-primary/25 bg-primary/10 px-2.5 text-xs font-semibold text-primary">
                  {compareItems.length}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full"
                  onClick={() => onOpenChange(false)}
                  aria-label={tr(locale, "Close compare", "Close compare")}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {compareItems.map((item) => {
                const isActive = item.slug === activeItem?.slug;
                return (
                  <button
                    key={item.slug}
                    type="button"
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      isActive
                        ? "border-primary/35 bg-primary/10 text-primary"
                        : "border-border/70 bg-background/80 text-muted-foreground",
                    )}
                    onClick={() => setActiveSlug(item.slug)}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>

            {activeItem ? (
              <div className="mt-4 rounded-[1.5rem] border border-primary/20 bg-primary/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-foreground">{activeItem.name}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {activeItem.description}
                    </p>
                  </div>
                  {activeItem.slug === recommended.slug ? (
                    <Badge className="rounded-full bg-primary px-2.5 py-1 text-[10px] text-primary-foreground">
                      {tr(locale, "Best overall", "Best overall")}
                    </Badge>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
                    {tr(locale, `Trust ${activeItem.trustScore.toFixed(1)}`, `Trust ${activeItem.trustScore.toFixed(1)}`)}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
                    {tr(locale, formatHealthLabel(activeItem.healthStatus), formatHealthLabel(activeItem.healthStatus))}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px]">
                    {tr(locale, formatAuthLabel(activeItem.authType), formatAuthLabel(activeItem.authType))}
                  </Badge>
                </div>

                <div className="mt-4 space-y-2 rounded-2xl border border-border/60 bg-background/70 p-3">
                  <MobileMetricRow
                    label={tr(locale, "Tools", "Tools")}
                    value={tr(locale, `${activeItem.toolsCount} tools`, `${activeItem.toolsCount} tools`)}
                  />
                  <MobileMetricRow label={tr(locale, "Best use", "Best use")} value={tr(locale, activeItem.bestUse, activeItem.bestUse)} />
                  <MobileMetricRow label={tr(locale, "Verdict", "Verdict")} value={tr(locale, activeItem.verdict, activeItem.verdict)} />
                </div>

                <div className="mt-4 flex gap-2">
                  <Button asChild className="flex-1 rounded-xl">
                    <Link href={recommended.href}>{tr(locale, "Open recommended", "Open recommended")}</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl">
                    <Link href={activeItem.href}>{tr(locale, "Details", "Details")}</Link>
                  </Button>
                </div>
              </div>
            ) : null}

            {runnerUp ? (
              <div className="mt-4 rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-primary uppercase">
                  {tr(locale, "Runner-up", "Runner-up")}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {tr(
                    locale,
                    `${runnerUp.name} is the strongest alternative when ${runnerUp.bestUse.toLowerCase()} matters more than immediate adoption speed.`,
                    `${runnerUp.name} is the strongest alternative when ${runnerUp.bestUse.toLowerCase()} matters more than immediate adoption speed.`,
                  )}
                </p>
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>
                {tr(locale, "Compare unlocks at 2+ saved.", "Compare unlocks at 2+ saved.")}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={onClearShortlist}
              >
                {tr(locale, "Clear", "Clear")}
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

function MobileMetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
