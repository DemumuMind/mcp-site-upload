type HealthCheckResult = unknown;

type CatalogHealthCheckDeps = {
  runHealthCheck: () => Promise<HealthCheckResult | undefined>;
  logInfo?: (event: string, details?: Record<string, unknown>) => void;
  logError?: (event: string, details?: Record<string, unknown>) => void;
};

function toCatalogHealthCheckErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unknown catalog health-check error";
}

function createCatalogHealthCheckErrorBody() {
  return {
    ok: false as const,
    error: "Catalog health check failed.",
    code: "internal_error" as const,
  };
}

export async function executeCatalogHealthCheck(
  deps: CatalogHealthCheckDeps,
): Promise<
  | {
      status: 200;
      body: {
        ok: true;
        checkedCount: number;
        results: HealthCheckResult | undefined;
      };
    }
  | {
      status: 500;
      body: ReturnType<typeof createCatalogHealthCheckErrorBody>;
    }
> {
  deps.logInfo?.("catalog.health_check.start");

  try {
    const results = await deps.runHealthCheck();
    const checkedCount = Array.isArray(results)
      ? results.length
      : typeof results === "object" && results !== null && "total" in results && typeof (results as { total?: unknown }).total === "number"
        ? Number((results as { total?: number }).total)
        : 0;
    deps.logInfo?.("catalog.health_check.completed", { count: checkedCount });

    return {
      status: 200,
      body: {
        ok: true,
        checkedCount,
        results,
      },
    };
  } catch (error) {
    deps.logError?.("catalog.health_check.error", {
      message: toCatalogHealthCheckErrorMessage(error),
    });

    return {
      status: 500,
      body: createCatalogHealthCheckErrorBody(),
    };
  }
}
