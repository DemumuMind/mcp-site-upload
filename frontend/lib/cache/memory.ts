import { getMemoryTtlSeconds } from "./policy.ts";

type ProcessMemoryEntry<T> = {
  expiresAtMs: number;
  value: T;
};

const processMemoryCache = new Map<string, ProcessMemoryEntry<unknown>>();

export function readProcessMemoryCache<T>(
  policyKey: "howToUsePaths" | "sectionIndex",
  cacheKey: string,
  loader: () => T,
  now: () => number = Date.now,
): T {
  const currentTime = now();
  const cachedEntry = processMemoryCache.get(cacheKey) as ProcessMemoryEntry<T> | undefined;

  if (cachedEntry && cachedEntry.expiresAtMs > currentTime) {
    return cachedEntry.value;
  }

  const value = loader();
  processMemoryCache.set(cacheKey, {
    value,
    expiresAtMs: currentTime + getMemoryTtlSeconds(policyKey) * 1000,
  });

  return value;
}

export function clearProcessMemoryCache(cacheKey?: string): void {
  if (cacheKey) {
    processMemoryCache.delete(cacheKey);
    return;
  }

  processMemoryCache.clear();
}
