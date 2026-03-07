import { matchCatalogCandidate } from "./dedupe.ts";
import { normalizePackageName, uniqueValues } from "./normalize.ts";
import { verifyCatalogCandidate } from "./verify.ts";
import type {
  CatalogMatchResult,
  CatalogPipelineLogger,
  CatalogPipelineResult,
  CatalogProvider,
  CatalogPublishState,
  CatalogSourceType,
  CatalogIngestionStore,
  NormalizedCandidate,
} from "./types.ts";

type PipelineInput = {
  runId: string | null;
  providers: CatalogProvider[];
  store: CatalogIngestionStore;
  sourceTypes?: CatalogSourceType[];
  logger: CatalogPipelineLogger;
  nowIso?: () => string;
};

function createSourceSummary(fullSweepCompleted: boolean) {
  return {
    fetched: 0,
    normalized: 0,
    published: 0,
    quarantined: 0,
    rejected: 0,
    failed: 0,
    fullSweepCompleted,
  };
}

function createResult(executedAt: string): CatalogPipelineResult {
  return {
    executedAt,
    created: 0,
    updated: 0,
    published: 0,
    quarantined: 0,
    rejected: 0,
    failed: 0,
    changedSlugs: [],
    failures: [],
    staleCandidates: 0,
    staleMarked: 0,
    staleRejectedAfterGrace: 0,
    staleCleanupApplied: false,
    staleCleanupReason: null,
    sources: {},
    metricsByStage: {
      fetched: 0,
      normalized: 0,
      verified: 0,
      published: 0,
      quarantined: 0,
      rejected: 0,
      stale: 0,
    },
  };
}

function addChangedSlug(result: CatalogPipelineResult, slug: string): void {
  if (!result.changedSlugs.includes(slug)) {
    result.changedSlugs.push(slug);
  }
}

function buildCorroborationIndex(candidates: NormalizedCandidate[]): Map<string, Set<CatalogSourceType>> {
  const index = new Map<string, Set<CatalogSourceType>>();

  for (const candidate of candidates) {
    const keys = [
      candidate.identity.repoUrlNormalized ? `repo:${candidate.identity.repoUrlNormalized}` : null,
      candidate.identity.packageType && candidate.identity.packageName
        ? `pkg:${normalizePackageName(candidate.identity.packageType)}:${normalizePackageName(candidate.identity.packageName)}`
        : null,
      candidate.identity.homepageUrlNormalized ? `home:${candidate.identity.homepageUrlNormalized}` : null,
      candidate.identity.serverUrlNormalized ? `srv:${candidate.identity.serverUrlNormalized}` : null,
    ].filter((value): value is string => Boolean(value));

    for (const key of keys) {
      const sources = index.get(key) ?? new Set<CatalogSourceType>();
      sources.add(candidate.sourceType);
      index.set(key, sources);
    }
  }

  return index;
}

function getCorroboratingSources(
  candidate: NormalizedCandidate,
  corroborationIndex: Map<string, Set<CatalogSourceType>>,
): CatalogSourceType[] {
  const keys = [
    candidate.identity.repoUrlNormalized ? `repo:${candidate.identity.repoUrlNormalized}` : null,
    candidate.identity.packageType && candidate.identity.packageName
      ? `pkg:${normalizePackageName(candidate.identity.packageType)}:${normalizePackageName(candidate.identity.packageName)}`
      : null,
    candidate.identity.homepageUrlNormalized ? `home:${candidate.identity.homepageUrlNormalized}` : null,
    candidate.identity.serverUrlNormalized ? `srv:${candidate.identity.serverUrlNormalized}` : null,
  ].filter((value): value is string => Boolean(value));

  const sourceTypes = new Set<CatalogSourceType>();
  for (const key of keys) {
    for (const sourceType of corroborationIndex.get(key) ?? []) {
      sourceTypes.add(sourceType);
    }
  }
  return [...sourceTypes];
}

function mergeCandidates(candidates: NormalizedCandidate[]): NormalizedCandidate {
  const [primary, ...rest] = candidates;
  const mergedTags = new Set(primary.tags);
  const sourceMeta = { ...primary.sourceMeta };
  const riskyFlags = new Set(primary.verificationHints.riskyFlags);

  for (const candidate of rest) {
    candidate.tags.forEach((tag) => mergedTags.add(tag));
    Object.assign(sourceMeta, candidate.sourceMeta);
    candidate.verificationHints.riskyFlags.forEach((flag) => riskyFlags.add(flag));
  }

  return {
    ...primary,
    tags: [...mergedTags],
    sourceMeta,
    verificationHints: {
      repoMatch: candidates.some((candidate) => candidate.verificationHints.repoMatch),
      packageExists: candidates.some((candidate) => candidate.verificationHints.packageExists),
      providerVerified: candidates.some((candidate) => candidate.verificationHints.providerVerified),
      registryCorroborated: candidates.some((candidate) => candidate.verificationHints.registryCorroborated),
      trustedPublishing: candidates.some((candidate) => candidate.verificationHints.trustedPublishing),
      provenance: candidates.some((candidate) => candidate.verificationHints.provenance),
      smitheryVerified: candidates.some((candidate) => candidate.verificationHints.smitheryVerified),
      readmePresent: candidates.some((candidate) => candidate.verificationHints.readmePresent),
      docsPresent: candidates.some((candidate) => candidate.verificationHints.docsPresent),
      healthStatus: primary.verificationHints.healthStatus,
      riskyFlags: [...riskyFlags],
    },
  };
}

function buildGroupKey(candidate: NormalizedCandidate, match: CatalogMatchResult | null): string {
  if (match) {
    return `server:${match.serverId}`;
  }
  if (candidate.identity.repoUrlNormalized) {
    return `repo:${candidate.identity.repoUrlNormalized}`;
  }
  if (candidate.identity.packageType && candidate.identity.packageName) {
    return `pkg:${normalizePackageName(candidate.identity.packageType)}:${normalizePackageName(candidate.identity.packageName)}`;
  }
  if (candidate.identity.serverUrlNormalized) {
    return `srv:${candidate.identity.serverUrlNormalized}`;
  }
  if (candidate.identity.homepageUrlNormalized) {
    return `home:${candidate.identity.homepageUrlNormalized}`;
  }
  return `candidate:${candidate.sourceType}:${candidate.sourceNativeId}`;
}

async function applyStaleCleanup(
  input: {
    store: CatalogIngestionStore;
    providerType: CatalogSourceType;
    stalePublishedSlugs: string[];
    staleCandidateCount?: number;
    staleCleanupAllowed?: boolean;
    staleCleanupReason?: string | null;
    fullSweepCompleted: boolean;
  },
  result: CatalogPipelineResult,
): Promise<void> {
  if (input.providerType !== "github") {
    return;
  }
  result.staleCandidates += input.staleCandidateCount ?? input.stalePublishedSlugs.length;

  if (!input.fullSweepCompleted || input.staleCleanupAllowed === false) {
    result.staleCleanupApplied = false;
    result.staleCleanupReason =
      input.staleCleanupReason ??
      (input.fullSweepCompleted
        ? "GitHub stale cleanup skipped."
        : "GitHub full sweep was incomplete; stale cleanup skipped.");
    return;
  }

  result.staleCleanupApplied = true;
  result.staleCleanupReason = input.staleCleanupReason ?? "GitHub full sweep completed.";

  for (const slug of input.stalePublishedSlugs) {
    const mutation = await input.store.markStaleCandidate(slug);
    if (!mutation.changed) {
      continue;
    }
    result.staleMarked += 1;
    if (mutation.rejected) {
      result.staleRejectedAfterGrace += 1;
    }
    result.metricsByStage.stale += 1;
    addChangedSlug(result, slug);
  }
}

export async function runCatalogIngestionPipeline(input: PipelineInput): Promise<CatalogPipelineResult> {
  const nowIso = input.nowIso ?? (() => new Date().toISOString());
  const result = createResult(nowIso());
  const providers = input.providers.filter((provider) =>
    input.sourceTypes ? input.sourceTypes.includes(provider.sourceType) : true,
  );
  const dedupeRecords = await input.store.loadDedupeRecords();
  const normalizedCandidates: Array<{
    candidate: NormalizedCandidate;
    match: CatalogMatchResult | null;
    rawCandidateId: string | null;
  }> = [];

  for (const provider of providers) {
    const scopeKey = provider.buildScopeKey();
    const attemptedAt = nowIso();
    await input.store.recordSourceAttempt({
      sourceType: provider.sourceType,
      scopeKey,
      attemptedAt,
    });

    try {
      const sourceState = await input.store.loadSourceState(provider.sourceType, scopeKey);
      const fetchResult = await provider.fetch({
        sourceScope: null,
        scopeKey,
        state: sourceState,
      });
      result.sources[provider.sourceType] = createSourceSummary(fetchResult.fullSweepCompleted);
      result.sources[provider.sourceType]!.fetched = fetchResult.rawCandidates.length;
      result.metricsByStage.fetched += fetchResult.rawCandidates.length;

      await input.store.recordSourceSuccess({
        sourceType: provider.sourceType,
        scopeKey: fetchResult.scopeKey,
        attemptedAt,
        succeededAt: nowIso(),
        metadata: fetchResult.fetchMetadata,
      });

      for (const rawCandidate of fetchResult.rawCandidates) {
        const rawCandidateId = await input.store.recordRawCandidate({
          runId: input.runId,
          sourceType: provider.sourceType,
          scopeKey: fetchResult.scopeKey,
          rawCandidate,
        });
        const normalized = await provider.normalize({
          rawCandidate,
          scopeKey: fetchResult.scopeKey,
        });

        result.sources[provider.sourceType]!.normalized += normalized.length;
        result.metricsByStage.normalized += normalized.length;

        for (const candidate of normalized) {
          normalizedCandidates.push({
            candidate,
            match: matchCatalogCandidate({
              candidate,
              records: dedupeRecords,
            }),
            rawCandidateId,
          });
        }
      }

      await applyStaleCleanup(
        {
          store: input.store,
          providerType: provider.sourceType,
          stalePublishedSlugs: fetchResult.stalePublishedSlugs ?? [],
          staleCandidateCount: fetchResult.staleCandidateCount,
          staleCleanupAllowed: fetchResult.staleCleanupAllowed,
          staleCleanupReason: fetchResult.staleCleanupReason,
          fullSweepCompleted: fetchResult.fullSweepCompleted,
        },
        result,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown provider failure";
      await input.store.recordSourceFailure({
        sourceType: provider.sourceType,
        scopeKey,
        attemptedAt,
        errorMessage: message,
      });
      result.failed += 1;
      result.failures.push({
        source: provider.sourceType,
        entityKey: provider.sourceType,
        stage: "fetch",
        reason: message,
      });
      result.sources[provider.sourceType] = createSourceSummary(false);
      result.sources[provider.sourceType]!.failed += 1;
      input.logger.warn("catalog.pipeline.provider_failed", {
        provider: provider.sourceType,
        message,
      });
    }
  }

  const corroborationIndex = buildCorroborationIndex(normalizedCandidates.map((item) => item.candidate));
  const groupedCandidates = new Map<string, Array<typeof normalizedCandidates[number]>>();

  for (const candidateRecord of normalizedCandidates) {
    const groupKey = buildGroupKey(candidateRecord.candidate, candidateRecord.match);
    const group = groupedCandidates.get(groupKey) ?? [];
    group.push(candidateRecord);
    groupedCandidates.set(groupKey, group);
  }

  for (const group of groupedCandidates.values()) {
    const mergedCandidate = mergeCandidates(group.map((item) => item.candidate));
    const match = group.find((item) => item.match)?.match ?? null;
    const corroboratingSources = getCorroboratingSources(mergedCandidate, corroborationIndex);
    const verification = verifyCatalogCandidate({
      candidate: mergedCandidate,
      corroboratingSources,
    });

    let publishedServerId: string | null = match?.serverId ?? null;
    if (!match?.protectedManual && verification.decision === "publish") {
      const publishResult = await input.store.publishCandidate({
        match,
        candidate: group[0].candidate,
        mergedCandidate,
        verification,
      });
      publishedServerId = publishResult.serverId;
      result.published += 1;
      result.metricsByStage.published += 1;
      if (publishResult.created) {
        result.created += 1;
      } else if (publishResult.changed) {
        result.updated += 1;
      }
      if (publishResult.changed) {
        addChangedSlug(result, publishResult.slug);
      }
    }

    for (const item of group) {
      let publishState: CatalogPublishState =
        verification.decision === "publish"
          ? "published"
          : verification.decision === "reject"
            ? "rejected"
            : "quarantined";

      if (item.match?.protectedManual) {
        publishState = "quarantined";
      }

      const serverSourceId = await input.store.upsertServerSource({
        serverId: publishState === "published" ? publishedServerId : item.match?.serverId ?? null,
        rawCandidateId: item.rawCandidateId,
        candidate: item.candidate,
        match: item.match,
        publishState,
      });

      await input.store.recordVerificationRun({
        runId: input.runId,
        serverSourceId,
        serverId: publishState === "published" ? publishedServerId : item.match?.serverId ?? null,
        verification,
        candidate: mergedCandidate,
      });
    }

    result.metricsByStage.verified += 1;

    if (match?.protectedManual) {
      result.quarantined += 1;
      result.metricsByStage.quarantined += 1;
      continue;
    }

    if (verification.decision === "publish") {
      continue;
    }

    if (verification.decision === "reject") {
      result.rejected += 1;
      result.metricsByStage.rejected += 1;
      continue;
    }

    result.quarantined += 1;
    result.metricsByStage.quarantined += 1;
  }

  result.changedSlugs = uniqueValues(result.changedSlugs);
  return result;
}
