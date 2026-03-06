type CatalogSearchErrorCode = "invalid_request" | "internal_error";

type CatalogSearchErrorPayload = {
  ok?: boolean;
  error?: unknown;
  code?: unknown;
};

export type CatalogSearchClientError = {
  message: string;
  code: CatalogSearchErrorCode | "unknown";
};

function isCatalogSearchErrorCode(value: unknown): value is CatalogSearchErrorCode {
  return value === "invalid_request" || value === "internal_error";
}

export async function getCatalogSearchClientError(response: Response): Promise<CatalogSearchClientError> {
  try {
    const payload = (await response.json()) as CatalogSearchErrorPayload;
    if (
      payload &&
      payload.ok === false &&
      typeof payload.error === "string" &&
      payload.error.trim().length > 0 &&
      isCatalogSearchErrorCode(payload.code)
    ) {
      return {
        message: payload.error,
        code: payload.code,
      };
    }
  } catch {
    // Fall through to the status-based fallback when the response body is absent or malformed.
  }

  return {
    message: `Failed to load catalog (${response.status})`,
    code: "unknown",
  };
}
