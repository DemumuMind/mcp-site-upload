import {
  normalizePackageName,
  normalizeUrlForIdentity,
} from "./normalize.ts";
import type {
  CatalogDedupeRecord,
  CatalogMatchResult,
  CatalogMatchType,
  NormalizedCandidate,
} from "./types.ts";

type MatchInput = {
  candidate: NormalizedCandidate;
  records: CatalogDedupeRecord[];
  manualOverrideMap?: Record<string, string>;
};

function buildManualOverrideKey(candidate: NormalizedCandidate): string {
  return `${candidate.sourceType}:${candidate.sourceNativeId}`;
}

function createMatch(
  record: CatalogDedupeRecord,
  matchType: CatalogMatchType,
  explainability: string,
): CatalogMatchResult {
  return {
    serverId: record.serverId,
    slug: record.slug,
    matchType,
    explainability,
    protectedManual: record.protectedManual,
  };
}

export function matchCatalogCandidate(input: MatchInput): CatalogMatchResult | null {
  const manualOverrideKey = buildManualOverrideKey(input.candidate);
  const overriddenServerId = input.manualOverrideMap?.[manualOverrideKey];
  if (overriddenServerId) {
    const overriddenRecord = input.records.find((record) => record.serverId === overriddenServerId);
    if (overriddenRecord) {
      return createMatch(overriddenRecord, "manual_override", `manual override matched ${manualOverrideKey}`);
    }
  }

  const repoUrlNormalized = input.candidate.identity.repoUrlNormalized;
  const packageType = normalizePackageName(input.candidate.identity.packageType);
  const packageName = normalizePackageName(input.candidate.identity.packageName);
  const homepageUrlNormalized = normalizeUrlForIdentity(input.candidate.identity.homepageUrlNormalized);
  const serverUrlNormalized = normalizeUrlForIdentity(input.candidate.identity.serverUrlNormalized);

  if (repoUrlNormalized) {
    const match = input.records.find((record) => record.repoUrlsNormalized.includes(repoUrlNormalized));
    if (match) {
      return createMatch(match, "repo_url", `repo URL matched ${repoUrlNormalized}`);
    }
  }

  if (packageType && packageName) {
    const match = input.records.find((record) =>
      record.packageIdentities.some(
        (identity) =>
          normalizePackageName(identity.packageType) === packageType &&
          normalizePackageName(identity.packageName) === packageName,
      ),
    );
    if (match) {
      return createMatch(match, "package_identity", `package identity matched ${packageType}:${packageName}`);
    }
  }

  if (homepageUrlNormalized) {
    const match = input.records.find((record) =>
      record.homepageUrlsNormalized.some((value) => normalizeUrlForIdentity(value) === homepageUrlNormalized),
    );
    if (match) {
      return createMatch(match, "homepage_url", `homepage URL matched ${homepageUrlNormalized}`);
    }
  }

  if (serverUrlNormalized) {
    const match = input.records.find((record) =>
      record.serverUrlsNormalized.some((value) => normalizeUrlForIdentity(value) === serverUrlNormalized),
    );
    if (match) {
      return createMatch(match, "server_url", `server URL matched ${serverUrlNormalized}`);
    }
  }

  return null;
}
