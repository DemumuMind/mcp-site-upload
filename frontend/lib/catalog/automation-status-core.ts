type CatalogAutomationStatusRun = {
  id: string;
  trigger: string | null;
  status: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  fetched: number;
  upserted: number;
  failed: number;
  staleMarked: number;
  durationMs: number | null;
  errorSummary: string | null;
};

type CatalogAutomationStatusLock = {
  lockKey: string;
  holderId: string;
  lockedUntil: string;
};

type CatalogAutomationStatusDeps = {
  readCronSchedules: () => Promise<string[]>;
  hasCatalogSecret: () => boolean;
  readCatalogData: () => Promise<{
    supabaseConfigured: boolean;
    autoManagedActiveCount: number | null;
    lastAutoManagedCreatedAt: string | null;
    dataCheckError: string | null;
  }>;
  readRecentRuns: () => Promise<{
    degraded: boolean;
    data: CatalogAutomationStatusRun[];
  }>;
  readActiveLocks: () => Promise<{
    degraded: boolean;
    data: CatalogAutomationStatusLock[];
  }>;
};

export async function executeCatalogAutomationStatus(
  deps: CatalogAutomationStatusDeps,
): Promise<{
  ok: boolean;
  checks: {
    cronConfigured: boolean;
    secretConfigured: boolean;
    runtimeReady: boolean;
  };
  catalogAutoSync: {
    cronSchedules: string[];
    autoManagedActiveCount: number | null;
    lastAutoManagedCreatedAt: string | null;
    dataCheckError: string | null;
  };
  recentRuns: {
    items: CatalogAutomationStatusRun[];
    degraded: boolean;
  };
  activeLocks: {
    items: CatalogAutomationStatusLock[];
    degraded: boolean;
  };
  checkedAt: string;
}> {
  const [cronSchedules, catalogData, recentRunsResult, activeLocksResult] = await Promise.all([
    deps.readCronSchedules(),
    deps.readCatalogData(),
    deps.readRecentRuns(),
    deps.readActiveLocks(),
  ]);

  const checks = {
    cronConfigured: cronSchedules.length > 0,
    secretConfigured: deps.hasCatalogSecret(),
    runtimeReady: catalogData.supabaseConfigured && catalogData.dataCheckError === null,
  };

  return {
    ok: checks.cronConfigured && checks.secretConfigured && checks.runtimeReady,
    checks,
    catalogAutoSync: {
      cronSchedules,
      autoManagedActiveCount: catalogData.autoManagedActiveCount,
      lastAutoManagedCreatedAt: catalogData.lastAutoManagedCreatedAt,
      dataCheckError: catalogData.dataCheckError,
    },
    recentRuns: {
      items: recentRunsResult.data,
      degraded: recentRunsResult.degraded,
    },
    activeLocks: {
      items: activeLocksResult.data,
      degraded: activeLocksResult.degraded,
    },
    checkedAt: new Date().toISOString(),
  };
}
