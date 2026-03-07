type CatalogCacheInvalidateDeps = {
  parseJsonBody: () => Promise<unknown>;
  invalidate: (input: { changedSlugs: string[]; includeAdmin: boolean }) => void;
};

function normalizeChangedSlugs(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }
  return [...new Set(
    input
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean),
  )];
}

export async function executeCatalogCacheInvalidate(
  deps: CatalogCacheInvalidateDeps,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const payload = await deps.parseJsonBody();
  const changedSlugs = normalizeChangedSlugs(
    payload && typeof payload === "object" ? (payload as { changedSlugs?: unknown }).changedSlugs : undefined,
  );
  const includeAdmin = Boolean(
    payload && typeof payload === "object" ? (payload as { includeAdmin?: unknown }).includeAdmin : false,
  );

  if (changedSlugs.length === 0) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "changedSlugs must contain at least one slug.",
      },
    };
  }

  deps.invalidate({
    changedSlugs,
    includeAdmin,
  });

  return {
    status: 200,
    body: {
      ok: true,
      changedSlugs,
      includeAdmin,
    },
  };
}
