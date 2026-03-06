type CatalogSmitherySyncResult = {
  ok: boolean;
  created: number;
  updated: number;
  failed: number;
  changedSlugs: string[];
};

type CatalogSmitherySyncDeps = {
  runSync: () => Promise<CatalogSmitherySyncResult>;
  onSuccess: (result: CatalogSmitherySyncResult) => Promise<void>;
  logInfo?: (event: string, details?: Record<string, unknown>) => void;
  logError?: (event: string, details?: Record<string, unknown>) => void;
};

function toCatalogSmitherySyncErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unknown catalog Smithery sync error";
}

function createCatalogSmitherySyncErrorBody() {
  return {
    ok: false as const,
    error: "Catalog Smithery sync failed.",
    code: "internal_error" as const,
  };
}

export async function executeCatalogSmitherySync(
  deps: CatalogSmitherySyncDeps,
): Promise<
  | {
      status: 200;
      body: CatalogSmitherySyncResult;
    }
  | {
      status: 500;
      body: ReturnType<typeof createCatalogSmitherySyncErrorBody>;
    }
> {
  deps.logInfo?.("catalog.smithery_sync.start");

  try {
    const result = await deps.runSync();
    await deps.onSuccess(result);

    deps.logInfo?.("catalog.smithery_sync.completed", {
      created: result.created,
      updated: result.updated,
      failed: result.failed,
    });

    return {
      status: 200,
      body: result,
    };
  } catch (error) {
    deps.logError?.("catalog.smithery_sync.error", {
      message: toCatalogSmitherySyncErrorMessage(error),
    });

    return {
      status: 500,
      body: createCatalogSmitherySyncErrorBody(),
    };
  }
}
