"use client";

import { History } from "lucide-react";
import { formatTimestamp } from "@/components/tools/rules-generator-panel/use-rules-generator-controller";
import { Badge } from "@/components/ui/badge";
import type { RulesHistoryItem } from "@/lib/tools/rules-engine";

type HistoryListProps = {
  historyItems: RulesHistoryItem[];
  onLoadHistory: (item: RulesHistoryItem) => void;
};

export function HistoryList({ historyItems, onLoadHistory }: HistoryListProps) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">Generation History</p>
        <Badge variant="outline" className="border-border bg-muted/50 text-foreground">
          {historyItems.length}
        </Badge>
      </div>

      <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
        {historyItems.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/70 px-3 py-2 text-xs text-muted-foreground">
            No generations yet.
          </p>
        ) : (
          historyItems.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => onLoadHistory(item)}
              className="flex w-full items-start justify-between gap-3 rounded-lg border border-border/70 bg-muted/40 p-2 text-left hover:border-border"
            >
              <span className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.input.projectName || "Untitled project"}
                </p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{item.input.description}</p>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                <History className="mb-1 ml-auto size-3.5" />
                {formatTimestamp(item.createdAt)}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
