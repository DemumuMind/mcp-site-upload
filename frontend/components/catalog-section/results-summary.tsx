"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { tr, type Locale } from "@/lib/i18n";

export function ResultsSummary({
  locale,
  total,
  firstVisibleIndex,
  lastVisibleIndex,
  isLoading,
  requestError,
}: {
  locale: Locale;
  total: number;
  firstVisibleIndex: number;
  lastVisibleIndex: number;
  isLoading: boolean;
  requestError: string | null;
}) {
  return (
    <div className="space-y-1 text-sm text-foreground">
      <p>{tr(locale, `${total} tools found`, `${total} tools found`)}</p>
      {total > 0 ? (
        <p className="text-xs text-muted-foreground">
          {tr(
            locale,
            `Showing ${firstVisibleIndex}-${lastVisibleIndex} on this page`,
            `Showing ${firstVisibleIndex}-${lastVisibleIndex} on this page`,
          )}
        </p>
      ) : null}
      {isLoading ? (
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          {tr(locale, "Refreshing catalog...", "Refreshing catalog...")}
        </p>
      ) : null}
      {requestError ? (
        <p className="inline-flex items-center gap-1.5 text-xs text-rose-200">
          <AlertCircle className="size-3.5" />
          {tr(
            locale,
            "Could not sync latest catalog results. Showing the latest available snapshot.",
            "Could not sync latest catalog results. Showing the latest available snapshot.",
          )}
        </p>
      ) : null}
    </div>
  );
}
