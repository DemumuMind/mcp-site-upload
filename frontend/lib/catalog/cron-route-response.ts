export type CatalogCronErrorCode = "already_running" | "partial_failure" | "internal_error";

export type CatalogCronErrorBody = {
  ok: false;
  error: string;
  code: CatalogCronErrorCode;
};

export function toCatalogCronErrorMessage(
  error: unknown,
  fallback = "Unexpected catalog cron error",
): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}

export function createCatalogCronErrorBody(
  error: string,
  code: CatalogCronErrorCode,
): CatalogCronErrorBody {
  return {
    ok: false,
    error,
    code,
  };
}
