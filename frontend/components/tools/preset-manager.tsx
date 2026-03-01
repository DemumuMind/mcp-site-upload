"use client";

import { Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RulesPreset } from "@/lib/tools/rules-engine";

type PresetManagerProps = {
  presets: RulesPreset[];
  canSave: boolean;
  onSavePreset: (presetName: string) => void;
  onLoadPreset: (preset: RulesPreset) => void;
  onDeletePreset: (presetId: string) => void;
};

function toRelativeDate(isoDate: string): string {
  const timestamp = Date.parse(isoDate);
  if (!Number.isFinite(timestamp)) {
    return "unknown time";
  }

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diffSeconds = Math.round((timestamp - Date.now()) / 1_000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffSeconds) < 60) {
    return formatter.format(diffSeconds, "second");
  }
  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }
  return formatter.format(diffDays, "day");
}

export function PresetManager({
  presets,
  canSave,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
}: PresetManagerProps) {
  const [presetName, setPresetName] = useState("");

  const sortedPresets = useMemo(
    () =>
      [...presets].sort((a, b) => Date.parse(b.createdAt || "") - Date.parse(a.createdAt || "")),
    [presets],
  );

  function handleSave() {
    const trimmedName = presetName.trim();
    if (!trimmedName || !canSave) {
      return;
    }

    onSavePreset(trimmedName);
    setPresetName("");
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-500/30 bg-slate-950/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-100">Presets</p>
        <Badge variant="outline" className="border-slate-500/40 bg-slate-900/70 text-slate-200">
          {presets.length}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          value={presetName}
          onChange={(event) => setPresetName(event.target.value)}
          placeholder="Preset name"
          className="h-9 min-w-[10rem] flex-1 border-slate-500/40 bg-slate-900/70"
        />
        <Button type="button" size="sm" onClick={handleSave} disabled={!presetName.trim() || !canSave}>
          <Save className="size-3.5" />
          Save
        </Button>
      </div>

      <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
        {sortedPresets.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-600/40 px-3 py-2 text-xs text-slate-400">
            No presets yet. Save your current form to reuse later.
          </p>
        ) : (
          sortedPresets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-slate-500/20 bg-slate-900/40 p-2"
            >
              <button
                type="button"
                onClick={() => onLoadPreset(preset)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm font-medium text-slate-100">{preset.name}</p>
                <p className="text-xs text-slate-400">Saved {toRelativeDate(preset.createdAt)}</p>
              </button>
              <Button
                type="button"
                size="icon-xs"
                variant="outline"
                onClick={() => onDeletePreset(preset.id)}
                aria-label={`Delete preset ${preset.name}`}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
