type CatalogNpmSyncResult = {
  ok: boolean;
  created: number;
  updated: number;
  failed: number;
  changedSlugs: string[];
};

type CatalogNpmSyncDeps = {
  runSync: () => Promise<CatalogNpmSyncResult>;
  onSuccess: (result: CatalogNpmSyncResult) => Promise<void>;
  logInfo?: (event: string, details?: Record<string, unknown>) => void;
  logError?: (event: string, details?: Record<string, unknown>) => void;
};

function toCatalogNpmSyncErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unknown catalog npm sync error";
}

function createCatalogNpmSyncErrorBody() {
  return {
    ok: false as const,
    error: "Catalog npm sync failed.",
    code: "internal_error" as const,
  };
}

export async function executeCatalogNpmSync(
  deps: CatalogNpmSyncDeps,
): Promise<
  | {
      status: 200;
      body: CatalogNpmSyncResult;
    }
  | {
      status: 500;
      body: ReturnType<typeof createCatalogNpmSyncErrorBody>;
    }
> {
  deps.logInfo?.("catalog.npm_sync.start");

  try {
    const result = await deps.runSync();
    await deps.onSuccess(result);

    deps.logInfo?.("catalog.npm_sync.completed", {
      created: result.created,
      updated: result.updated,
      failed: result.failed,
    });

    return {
      status: 200,
      body: result,
    };
  } catch (error) {
    deps.logError?.("catalog.npm_sync.error", {
      message: toCatalogNpmSyncErrorMessage(error),
    });

    return {
      status: 500,
      body: createCatalogNpmSyncErrorBody(),
    };
  }
}
