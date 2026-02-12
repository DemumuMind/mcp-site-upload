import type { RulesHistoryItem, RulesPreset } from "@/lib/tools/rules-engine";

const PRESETS_STORAGE_KEY = "tools.rules.presets.v1";
const HISTORY_STORAGE_KEY = "tools.rules.history.v1";

const MAX_PRESETS = 20;
const MAX_HISTORY_ITEMS = 30;

export type StorageLoadResult<T> = {
  items: T[];
  recoveredFromCorruption: boolean;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function parseStoredArray<T>(key: string): StorageLoadResult<T> {
  if (!isBrowser()) {
    return { items: [], recoveredFromCorruption: false };
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return { items: [], recoveredFromCorruption: false };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(key);
      return { items: [], recoveredFromCorruption: true };
    }

    return { items: parsed as T[], recoveredFromCorruption: false };
  } catch {
    window.localStorage.removeItem(key);
    return { items: [], recoveredFromCorruption: true };
  }
}

function persistArray<T>(key: string, values: T[]): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(values));
}

export function loadRulesPresets(): StorageLoadResult<RulesPreset> {
  return parseStoredArray<RulesPreset>(PRESETS_STORAGE_KEY);
}

export function upsertRulesPreset(preset: RulesPreset): RulesPreset[] {
  const current = loadRulesPresets().items;
  const withoutCurrent = current.filter((item) => item.id !== preset.id);
  const next = [preset, ...withoutCurrent].slice(0, MAX_PRESETS);
  persistArray(PRESETS_STORAGE_KEY, next);
  return next;
}

export function deleteRulesPreset(presetId: string): RulesPreset[] {
  const current = loadRulesPresets().items;
  const next = current.filter((item) => item.id !== presetId);
  persistArray(PRESETS_STORAGE_KEY, next);
  return next;
}

export function loadRulesHistory(): StorageLoadResult<RulesHistoryItem> {
  return parseStoredArray<RulesHistoryItem>(HISTORY_STORAGE_KEY);
}

export function appendRulesHistory(item: RulesHistoryItem): RulesHistoryItem[] {
  const current = loadRulesHistory().items;
  const next = [item, ...current].slice(0, MAX_HISTORY_ITEMS);
  persistArray(HISTORY_STORAGE_KEY, next);
  return next;
}

export function clearRulesHistory(): RulesHistoryItem[] {
  persistArray<RulesHistoryItem>(HISTORY_STORAGE_KEY, []);
  return [];
}
