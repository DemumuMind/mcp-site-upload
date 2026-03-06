export type CatalogSearchErrorCode = "invalid_request" | "internal_error";

export type CatalogSearchErrorBody = {
  ok: false;
  error: string;
  code: CatalogSearchErrorCode;
};

type CatalogSearchErrorDescriptor = {
  status: number;
  body: CatalogSearchErrorBody;
};

type ApiErrorLike = {
  message: string;
  statusCode: number;
};

function isApiErrorLike(error: unknown): error is ApiErrorLike {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string" &&
    "statusCode" in error &&
    typeof (error as { statusCode?: unknown }).statusCode === "number"
  );
}

export function classifyCatalogSearchError(error: unknown): CatalogSearchErrorDescriptor {
  if (isApiErrorLike(error) && error.statusCode >= 400 && error.statusCode < 500) {
    return {
      status: error.statusCode,
      body: {
        ok: false,
        error: error.message,
        code: "invalid_request",
      },
    };
  }

  if (error instanceof URIError) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Invalid catalog search request.",
        code: "invalid_request",
      },
    };
  }

  return {
    status: 500,
    body: {
      ok: false,
      error: "Catalog search failed.",
      code: "internal_error",
    },
  };
}
