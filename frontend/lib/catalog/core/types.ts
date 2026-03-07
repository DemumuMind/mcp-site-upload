import type { AuthType, HealthStatus, VerificationLevel } from "@/lib/types";

export type CatalogSourceType = "github" | "smithery" | "npm" | "pypi" | "oci" | "registry";

export type CatalogPublishState = "pending" | "published" | "quarantined" | "rejected";

export type VerificationDecision = "publish" | "quarantine" | "reject";

export type CandidateIdentity = {
  canonicalName: string | null;
  repoUrlNormalized: string | null;
  packageType: string | null;
  packageName: string | null;
  packageVersion: string | null;
  homepageUrlNormalized: string | null;
  serverUrlNormalized: string | null;
};

export type CandidateVerificationHints = {
  repoMatch: boolean;
  packageExists: boolean;
  providerVerified: boolean;
  registryCorroborated?: boolean;
  trustedPublishing: boolean;
  provenance: boolean;
  smitheryVerified?: boolean;
  readmePresent: boolean;
  docsPresent: boolean;
  healthStatus: HealthStatus;
  riskyFlags: string[];
};

export type NormalizedCandidate = {
  sourceType: CatalogSourceType;
  sourceNativeId: string;
  scopeKey: string;
  name: string;
  slug: string;
  description: string;
  serverUrl: string | null;
  homepageUrl: string | null;
  repoUrl: string | null;
  repoUrlNormalized: string | null;
  category: string;
  authType: AuthType;
  tags: string[];
  maintainer: {
    name: string;
    email?: string | null;
  } | null;
  identity: CandidateIdentity;
  sourceMeta: Record<string, unknown>;
  verificationHints: CandidateVerificationHints;
};

export type CatalogDedupeRecord = {
  serverId: string;
  slug: string;
  name: string;
  tags: string[];
  ownerUserId: string | null;
  protectedManual: boolean;
  canonicalNames: string[];
  repoUrlsNormalized: string[];
  packageIdentities: Array<{ packageType: string; packageName: string }>;
  homepageUrlsNormalized: string[];
  serverUrlsNormalized: string[];
};

export type CatalogMatchType =
  | "manual_override"
  | "canonical_name"
  | "repo_url"
  | "package_identity"
  | "homepage_url"
  | "server_url";

export type CatalogMatchResult = {
  serverId: string;
  slug: string;
  matchType: CatalogMatchType;
  explainability: string;
  protectedManual: boolean;
};

export type VerificationResult = {
  decision: VerificationDecision;
  trustScore: number;
  verificationLevel: VerificationLevel;
  reasons: string[];
  signals: Record<string, boolean | number | string | string[]>;
};

export type ProviderRawCandidate = {
  sourceNativeId: string;
  payload: unknown;
  summary?: Record<string, unknown>;
};

export type CatalogSourceState = {
  sourceType: CatalogSourceType;
  scopeKey: string;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  failureCount: number;
  etag: string | null;
  lastModified: string | null;
  cursor: string | null;
  nextAllowedAt: string | null;
  lastHttpStatus: number | null;
  lastError: string | null;
};

export type ProviderFetchMetadata = {
  httpStatus?: number | null;
  notModified: boolean;
  itemCount: number;
  etag?: string | null;
  lastModified?: string | null;
  cursor?: string | null;
  retryAfterMs?: number | null;
};

export type ProviderFetchResult = {
  scopeKey: string;
  rawCandidates: ProviderRawCandidate[];
  fullSweepCompleted: boolean;
  staleCleanupAllowed?: boolean;
  staleCleanupReason?: string | null;
  staleCandidateCount?: number;
  stalePublishedSlugs?: string[];
  fetchMetadata: ProviderFetchMetadata;
};

export type CatalogProviderSeed = {
  packageName?: string | null;
  repoHint?: string | null;
  rawText?: string | null;
};

export type CatalogProvider = {
  sourceType: CatalogSourceType;
  supportsFullSweep: boolean;
  supportsConditionalFetch: boolean;
  buildScopeKey: (input?: { sourceScope?: string | null; seed?: string | null }) => string;
  fetch: (input: {
    sourceScope?: string | null;
    scopeKey: string;
    state: CatalogSourceState | null;
    seeds?: CatalogProviderSeed[];
    fetchImpl?: typeof fetch;
  }) => Promise<ProviderFetchResult>;
  normalize: (input: {
    rawCandidate: ProviderRawCandidate;
    scopeKey: string;
    seeds?: CatalogProviderSeed[];
  }) => Promise<NormalizedCandidate[]>;
};

export type PublishedCandidateInput = {
  match: CatalogMatchResult | null;
  candidate: NormalizedCandidate;
  mergedCandidate: NormalizedCandidate;
  verification: VerificationResult;
};

export type PublishedCandidateResult = {
  created: boolean;
  changed: boolean;
  serverId: string;
  slug: string;
};

export type CatalogIngestionStore = {
  loadSourceState: (
    sourceType: CatalogSourceType,
    scopeKey: string,
  ) => Promise<CatalogSourceState | null>;
  recordSourceAttempt: (input: {
    sourceType: CatalogSourceType;
    scopeKey: string;
    attemptedAt: string;
  }) => Promise<void>;
  recordSourceSuccess: (input: {
    sourceType: CatalogSourceType;
    scopeKey: string;
    attemptedAt: string;
    succeededAt: string;
    metadata: ProviderFetchMetadata;
  }) => Promise<void>;
  recordSourceFailure: (input: {
    sourceType: CatalogSourceType;
    scopeKey: string;
    attemptedAt: string;
    errorMessage: string;
    httpStatus?: number | null;
    retryAfterMs?: number | null;
  }) => Promise<void>;
  recordRawCandidate: (input: {
    runId: string | null;
    sourceType: CatalogSourceType;
    scopeKey: string;
    rawCandidate: ProviderRawCandidate;
  }) => Promise<string>;
  loadDedupeRecords: () => Promise<CatalogDedupeRecord[]>;
  upsertServerSource: (input: {
    serverId: string | null;
    rawCandidateId: string | null;
    candidate: NormalizedCandidate;
    match: CatalogMatchResult | null;
    publishState: CatalogPublishState;
  }) => Promise<string>;
  recordVerificationRun: (input: {
    runId: string | null;
    serverSourceId: string;
    serverId: string | null;
    verification: VerificationResult;
    candidate: NormalizedCandidate;
  }) => Promise<void>;
  publishCandidate: (input: PublishedCandidateInput) => Promise<PublishedCandidateResult>;
  loadAutoManagedRecords: (
    sourceType: CatalogSourceType,
  ) => Promise<Array<{ slug: string; tags: string[] | null }>>;
  markStaleCandidate: (
    slug: string,
  ) => Promise<{ changed: boolean; rejected: boolean }>;
};

export type CatalogPipelineLogger = {
  info: (event: string, details?: Record<string, unknown>) => void;
  warn: (event: string, details?: Record<string, unknown>) => void;
  error: (event: string, details?: Record<string, unknown>) => void;
};

export type CatalogPipelineResult = {
  executedAt: string;
  created: number;
  updated: number;
  published: number;
  quarantined: number;
  rejected: number;
  failed: number;
  changedSlugs: string[];
  failures: Array<{ source: CatalogSourceType; entityKey: string; stage: string; reason: string }>;
  staleCandidates: number;
  staleMarked: number;
  staleRejectedAfterGrace: number;
  staleCleanupApplied: boolean;
  staleCleanupReason: string | null;
  sources: Partial<Record<CatalogSourceType, {
    fetched: number;
    normalized: number;
    published: number;
    quarantined: number;
    rejected: number;
    failed: number;
    fullSweepCompleted: boolean;
  }>>;
  metricsByStage: Record<string, number>;
};
