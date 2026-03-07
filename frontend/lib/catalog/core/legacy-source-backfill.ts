import {
  normalizeCanonicalName,
  normalizeRepositoryUrl,
  normalizeTag,
} from "./normalize.ts";

export type LegacyAutoManagedServerRow = {
  id: string;
  slug: string;
  name: string;
  repo_url: string | null;
  server_url: string | null;
  tags: string[] | null;
};

export type LegacyServerSourceBackfillRow = {
  serverId: string;
  sourceType: "github" | "smithery" | "npm" | "registry";
  sourceNativeId: string;
  canonicalName: string | null;
  repoUrl: string | null;
  repoUrlNormalized: string | null;
  serverUrl: string | null;
  homepageUrl: string | null;
  packageType: string | null;
  packageName: string | null;
  packageVersion: string | null;
  matchReason: string;
};

function inferLegacySourceType(tags: string[] | null): LegacyServerSourceBackfillRow["sourceType"] | null {
  const normalizedTags = new Set((tags ?? []).map((tag) => normalizeTag(tag)).filter(Boolean));
  if (normalizedTags.has("github-sync")) {
    return "github";
  }
  if (normalizedTags.has("smithery-sync")) {
    return "smithery";
  }
  if (normalizedTags.has("npm-sync")) {
    return "npm";
  }
  if (normalizedTags.has("scrapy-sync") || normalizedTags.has("registry-sync")) {
    return "registry";
  }
  return null;
}

export function buildLegacyServerSourceBackfillRows(
  rows: LegacyAutoManagedServerRow[],
): LegacyServerSourceBackfillRow[] {
  const backfillRows: LegacyServerSourceBackfillRow[] = [];

  for (const row of rows) {
    const sourceType = inferLegacySourceType(row.tags);
    if (!sourceType) {
      continue;
    }
    const repo = normalizeRepositoryUrl(row.repo_url);
    backfillRows.push({
      serverId: row.id,
      sourceType,
      sourceNativeId:
        sourceType === "github" && repo.normalized
          ? `github:${repo.normalized}`
          : `${sourceType}:${row.slug}`,
      canonicalName: normalizeCanonicalName(row.name) ?? normalizeCanonicalName(row.slug),
      repoUrl: repo.url,
      repoUrlNormalized: repo.normalized,
      serverUrl: row.server_url,
      homepageUrl: row.server_url,
      packageType: sourceType === "npm" ? "npm" : null,
      packageName: sourceType === "npm" ? row.slug : null,
      packageVersion: null,
      matchReason: "legacy_registry_auto_backfill",
    });
  }

  return backfillRows;
}
