import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "../../supabase/admin.ts";
import { buildLegacyServerSourceBackfillRows } from "./legacy-source-backfill.ts";
import { normalizeCanonicalName, normalizeRepositoryUrl, normalizeTag, normalizeUrlForIdentity } from "./normalize.ts";
import type {
  CatalogDedupeRecord,
  CatalogIngestionStore,
  CatalogSourceState,
  PublishedCandidateResult,
} from "./types.ts";

const SOURCE_FETCH_STATE_TABLE = "source_fetch_state";
const SOURCE_CANDIDATES_RAW_TABLE = "source_candidates_raw";
const SERVER_SOURCES_TABLE = "server_sources";
const VERIFICATION_RUNS_TABLE = "verification_runs";
const SERVERS_TABLE = "servers";
const GITHUB_WEBHOOK_DELIVERIES_TABLE = "catalog_github_webhook_deliveries";

const AUTO_MANAGED_TAG = "registry-auto";
const STALE_MARK_TAG = "registry-stale";
const STALE_CANDIDATE_TAG = "registry-stale-candidate";

type ServerRow = {
  id: string;
  slug: string;
  name: string;
  tags: string[] | null;
  owner_user_id: string | null;
  repo_url: string | null;
  server_url: string | null;
};

type ServerSourceRow = {
  id: string;
  server_id: string | null;
  canonical_name: string | null;
  repo_url_normalized: string | null;
  package_type: string | null;
  package_name: string | null;
  homepage_url: string | null;
  server_url: string | null;
};

function getCatalogAdminClientOrThrow(): SupabaseClient {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    throw new Error(
      "Supabase admin credentials are not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return adminClient;
}

function mergeTags(existingTags: string[] | null, candidateTags: string[], sourceType: string): string[] {
  const merged = new Set<string>();
  for (const tag of [...(existingTags ?? []), ...candidateTags, AUTO_MANAGED_TAG, `${sourceType}-sync`]) {
    const normalized = normalizeTag(tag);
    if (normalized) {
      merged.add(normalized);
    }
  }
  merged.delete(STALE_MARK_TAG);
  merged.delete(STALE_CANDIDATE_TAG);
  return [...merged].slice(0, 20);
}

function buildGraceCandidateTags(tags: string[] | null): string[] {
  const normalized = new Set<string>();
  for (const tag of tags ?? []) {
    const safeTag = normalizeTag(tag);
    if (safeTag && safeTag !== STALE_MARK_TAG) {
      normalized.add(safeTag);
    }
  }
  normalized.add(AUTO_MANAGED_TAG);
  normalized.add(STALE_CANDIDATE_TAG);
  return [...normalized].slice(0, 20);
}

function buildRejectedStaleTags(tags: string[] | null): string[] {
  const normalized = new Set<string>();
  for (const tag of tags ?? []) {
    const safeTag = normalizeTag(tag);
    if (safeTag && safeTag !== STALE_CANDIDATE_TAG) {
      normalized.add(safeTag);
    }
  }
  normalized.add(AUTO_MANAGED_TAG);
  normalized.add(STALE_MARK_TAG);
  return [...normalized].slice(0, 20);
}

function hasAutoManagedTag(tags: string[] | null): boolean {
  return (tags ?? []).some((tag) => normalizeTag(tag) === AUTO_MANAGED_TAG);
}

function buildPayloadHash(payload: unknown): { hash: string; bytes: number; json: string } {
  const json = JSON.stringify(payload ?? {});
  return {
    hash: createHash("sha256").update(json).digest("hex"),
    bytes: Buffer.byteLength(json, "utf8"),
    json,
  };
}

async function maybeIncrementFailureCount(
  adminClient: SupabaseClient,
  sourceType: string,
  scopeKey: string,
): Promise<number> {
  const { data } = await adminClient
    .from(SOURCE_FETCH_STATE_TABLE)
    .select("failure_count")
    .eq("source_type", sourceType)
    .eq("scope_key", scopeKey)
    .maybeSingle();
  return ((data as { failure_count?: number } | null)?.failure_count ?? 0) + 1;
}

async function ensureUniqueSlug(adminClient: SupabaseClient, baseSlug: string): Promise<string> {
  const normalizedBase = normalizeCanonicalName(baseSlug) ?? "server";
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const candidate = attempt === 0 ? normalizedBase : `${normalizedBase}-${attempt + 1}`;
    const { data, error } = await adminClient
      .from(SERVERS_TABLE)
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (error) {
      throw new Error(`Failed to check slug availability: ${error.message}`);
    }
    if (!data) {
      return candidate;
    }
  }

  throw new Error(`Failed to allocate a unique slug for ${baseSlug}`);
}

async function loadServerRows(adminClient: SupabaseClient): Promise<ServerRow[]> {
  const { data, error } = await adminClient
    .from(SERVERS_TABLE)
    .select("id, slug, name, tags, owner_user_id, repo_url, server_url")
    .range(0, 9999);

  if (error) {
    throw new Error(`Failed to read servers for dedupe: ${error.message}`);
  }

  return (data ?? []) as ServerRow[];
}

async function loadServerSourceRows(adminClient: SupabaseClient): Promise<ServerSourceRow[]> {
  const { data, error } = await adminClient
    .from(SERVER_SOURCES_TABLE)
    .select("id, server_id, canonical_name, repo_url_normalized, package_type, package_name, homepage_url, server_url")
    .range(0, 9999);

  if (error) {
    throw new Error(`Failed to read server_sources for dedupe: ${error.message}`);
  }

  return (data ?? []) as ServerSourceRow[];
}

function buildDedupeRecords(servers: ServerRow[], serverSources: ServerSourceRow[]): CatalogDedupeRecord[] {
  const byServerId = new Map<string, CatalogDedupeRecord>();

  for (const server of servers) {
    const repoUrlNormalized = normalizeRepositoryUrl(server.repo_url).normalized;
    byServerId.set(server.id, {
      serverId: server.id,
      slug: server.slug,
      name: server.name,
      tags: server.tags ?? [],
      ownerUserId: server.owner_user_id,
      protectedManual: Boolean(server.owner_user_id) || !hasAutoManagedTag(server.tags),
      canonicalNames: [normalizeCanonicalName(server.name) ?? normalizeCanonicalName(server.slug) ?? server.slug],
      repoUrlsNormalized: repoUrlNormalized ? [repoUrlNormalized] : [],
      packageIdentities: [],
      homepageUrlsNormalized: [],
      serverUrlsNormalized: [normalizeUrlForIdentity(server.server_url)].filter((value): value is string => Boolean(value)),
    });
  }

  for (const source of serverSources) {
    if (!source.server_id) {
      continue;
    }
    const record = byServerId.get(source.server_id);
    if (!record) {
      continue;
    }

    const canonicalName = normalizeCanonicalName(source.canonical_name);
    if (canonicalName) {
      record.canonicalNames.push(canonicalName);
    }
    if (source.repo_url_normalized) {
      record.repoUrlsNormalized.push(source.repo_url_normalized);
    }
    if (source.package_type && source.package_name) {
      record.packageIdentities.push({
        packageType: source.package_type,
        packageName: source.package_name,
      });
    }
    const normalizedHomepage = normalizeUrlForIdentity(source.homepage_url);
    if (normalizedHomepage) {
      record.homepageUrlsNormalized.push(normalizedHomepage);
    }
    const normalizedServerUrl = normalizeUrlForIdentity(source.server_url);
    if (normalizedServerUrl) {
      record.serverUrlsNormalized.push(normalizedServerUrl);
    }
  }

  return [...byServerId.values()].map((record) => ({
    ...record,
    canonicalNames: [...new Set(record.canonicalNames.filter(Boolean))],
    repoUrlsNormalized: [...new Set(record.repoUrlsNormalized.filter(Boolean))],
    homepageUrlsNormalized: [...new Set(record.homepageUrlsNormalized.filter(Boolean))],
    serverUrlsNormalized: [...new Set(record.serverUrlsNormalized.filter(Boolean))],
    packageIdentities: record.packageIdentities.filter(
      (identity, index, values) =>
        values.findIndex(
          (value) => value.packageType === identity.packageType && value.packageName === identity.packageName,
        ) === index,
    ),
  }));
}

export function createCatalogIngestionStore(): CatalogIngestionStore {
  return {
    async loadSourceState(sourceType, scopeKey) {
      const adminClient = getCatalogAdminClientOrThrow();
      const { data, error } = await adminClient
        .from(SOURCE_FETCH_STATE_TABLE)
        .select(
          "source_type, scope_key, last_attempt_at, last_success_at, failure_count, etag, last_modified, cursor, next_allowed_at, last_http_status, last_error",
        )
        .eq("source_type", sourceType)
        .eq("scope_key", scopeKey)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to read source fetch state: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      const row = data as Record<string, unknown>;
      return {
        sourceType,
        scopeKey,
        lastAttemptAt: (row.last_attempt_at as string | null) ?? null,
        lastSuccessAt: (row.last_success_at as string | null) ?? null,
        failureCount: Number(row.failure_count ?? 0),
        etag: (row.etag as string | null) ?? null,
        lastModified: (row.last_modified as string | null) ?? null,
        cursor: (row.cursor as string | null) ?? null,
        nextAllowedAt: (row.next_allowed_at as string | null) ?? null,
        lastHttpStatus: (row.last_http_status as number | null) ?? null,
        lastError: (row.last_error as string | null) ?? null,
      } satisfies CatalogSourceState;
    },

    async recordSourceAttempt(input) {
      const adminClient = getCatalogAdminClientOrThrow();
      const { error } = await adminClient.from(SOURCE_FETCH_STATE_TABLE).upsert(
        {
          source_type: input.sourceType,
          scope_key: input.scopeKey,
          last_attempt_at: input.attemptedAt,
        },
        { onConflict: "source_type,scope_key" },
      );

      if (error) {
        throw new Error(`Failed to record source attempt: ${error.message}`);
      }
    },

    async recordSourceSuccess(input) {
      const adminClient = getCatalogAdminClientOrThrow();
      const { error } = await adminClient.from(SOURCE_FETCH_STATE_TABLE).upsert(
        {
          source_type: input.sourceType,
          scope_key: input.scopeKey,
          last_attempt_at: input.attemptedAt,
          last_success_at: input.succeededAt,
          failure_count: 0,
          etag: input.metadata.etag ?? null,
          last_modified: input.metadata.lastModified ?? null,
          cursor: input.metadata.cursor ?? null,
          next_allowed_at:
            typeof input.metadata.retryAfterMs === "number"
              ? new Date(Date.now() + input.metadata.retryAfterMs).toISOString()
              : null,
          last_http_status: input.metadata.httpStatus ?? null,
          last_error: null,
        },
        { onConflict: "source_type,scope_key" },
      );

      if (error) {
        throw new Error(`Failed to record source success: ${error.message}`);
      }
    },

    async recordSourceFailure(input) {
      const adminClient = getCatalogAdminClientOrThrow();
      const failureCount = await maybeIncrementFailureCount(adminClient, input.sourceType, input.scopeKey);
      const { error } = await adminClient.from(SOURCE_FETCH_STATE_TABLE).upsert(
        {
          source_type: input.sourceType,
          scope_key: input.scopeKey,
          last_attempt_at: input.attemptedAt,
          failure_count: failureCount,
          next_allowed_at:
            typeof input.retryAfterMs === "number"
              ? new Date(Date.now() + input.retryAfterMs).toISOString()
              : null,
          last_http_status: input.httpStatus ?? null,
          last_error: input.errorMessage.slice(0, 1000),
        },
        { onConflict: "source_type,scope_key" },
      );

      if (error) {
        throw new Error(`Failed to record source failure: ${error.message}`);
      }
    },

    async recordRawCandidate(input) {
      const adminClient = getCatalogAdminClientOrThrow();
      const payload = buildPayloadHash(input.rawCandidate.payload);
      const { data, error } = await adminClient
        .from(SOURCE_CANDIDATES_RAW_TABLE)
        .insert({
          sync_run_id: input.runId,
          source_type: input.sourceType,
          scope_key: input.scopeKey,
          source_native_id: input.rawCandidate.sourceNativeId,
          payload_hash: payload.hash,
          payload_bytes: payload.bytes,
          raw_payload: input.rawCandidate.payload ?? {},
          normalized_summary: input.rawCandidate.summary ?? {},
        })
        .select("id")
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to record raw candidate: ${error.message}`);
      }

      return String((data as { id?: string } | null)?.id ?? "");
    },

    async loadDedupeRecords() {
      const adminClient = getCatalogAdminClientOrThrow();
      const [servers, sources] = await Promise.all([
        loadServerRows(adminClient),
        loadServerSourceRows(adminClient),
      ]);
      return buildDedupeRecords(servers, sources);
    },

    async upsertServerSource(input) {
      const adminClient = getCatalogAdminClientOrThrow();
      const existing = await adminClient
        .from(SERVER_SOURCES_TABLE)
        .select("id, first_seen_at")
        .eq("source_type", input.candidate.sourceType)
        .eq("source_native_id", input.candidate.sourceNativeId)
        .maybeSingle();

      if (existing.error) {
        throw new Error(`Failed to load server source: ${existing.error.message}`);
      }

      const repo = normalizeRepositoryUrl(input.candidate.repoUrl);
      const { data, error } = await adminClient
        .from(SERVER_SOURCES_TABLE)
        .upsert(
          {
            id: (existing.data as { id?: string } | null)?.id,
            server_id: input.serverId,
            source_type: input.candidate.sourceType,
            scope_key: input.candidate.scopeKey,
            source_native_id: input.candidate.sourceNativeId,
            canonical_name: input.candidate.identity.canonicalName,
            repo_url: repo.url,
            repo_url_normalized: repo.normalized,
            homepage_url: input.candidate.homepageUrl,
            server_url: input.candidate.serverUrl,
            package_type: input.candidate.identity.packageType,
            package_name: input.candidate.identity.packageName,
            package_version: input.candidate.identity.packageVersion,
            publish_state: input.publishState,
            match_reason: input.match?.explainability ?? null,
            source_metadata: {
              ...input.candidate.sourceMeta,
              tags: input.candidate.tags,
              verificationHints: input.candidate.verificationHints,
            },
            latest_raw_candidate_id: input.rawCandidateId,
            first_seen_at:
              (existing.data as { first_seen_at?: string } | null)?.first_seen_at ?? new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: "source_type,source_native_id" },
        )
        .select("id")
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to upsert server source: ${error.message}`);
      }

      return String((data as { id?: string } | null)?.id ?? "");
    },

    async recordVerificationRun(input) {
      const adminClient = getCatalogAdminClientOrThrow();
      const { error } = await adminClient.from(VERIFICATION_RUNS_TABLE).insert({
        sync_run_id: input.runId,
        server_source_id: input.serverSourceId,
        server_id: input.serverId,
        decision: input.verification.decision,
        verification_level: input.verification.verificationLevel,
        trust_score: input.verification.trustScore,
        reasons: input.verification.reasons,
        signals: input.verification.signals,
        health_summary: {
          healthStatus: input.candidate.verificationHints.healthStatus,
        },
      });

      if (error) {
        throw new Error(`Failed to record verification run: ${error.message}`);
      }
    },

    async publishCandidate(input): Promise<PublishedCandidateResult> {
      const adminClient = getCatalogAdminClientOrThrow();
      const mergedTags = mergeTags(input.match ? null : null, input.mergedCandidate.tags, input.mergedCandidate.sourceType);

      if (input.match) {
        const { data: existingServer, error: existingError } = await adminClient
          .from(SERVERS_TABLE)
          .select("id, slug, tags, owner_user_id")
          .eq("id", input.match.serverId)
          .maybeSingle();

        if (existingError) {
          throw new Error(`Failed to load existing server for publish: ${existingError.message}`);
        }

        const existing = existingServer as { id: string; slug: string; tags: string[] | null; owner_user_id: string | null } | null;
        if (existing && (existing.owner_user_id || !hasAutoManagedTag(existing.tags))) {
          throw new Error(`Refusing to overwrite protected manual row ${existing.slug}`);
        }

        const { error } = await adminClient
          .from(SERVERS_TABLE)
          .update({
            name: input.mergedCandidate.name,
            description: input.mergedCandidate.description,
            server_url: input.mergedCandidate.serverUrl,
            category: input.mergedCandidate.category,
            auth_type: input.mergedCandidate.authType,
            tags: mergeTags(existing?.tags ?? null, input.mergedCandidate.tags, input.mergedCandidate.sourceType),
            repo_url: input.mergedCandidate.repoUrl,
            maintainer: input.mergedCandidate.maintainer,
            status: "active",
            verification_level: input.verification.verificationLevel,
          })
          .eq("id", input.match.serverId);

        if (error) {
          throw new Error(`Failed to update published server: ${error.message}`);
        }

        return {
          created: false,
          changed: true,
          serverId: input.match.serverId,
          slug: existing?.slug ?? input.match.slug,
        };
      }

      const slug = await ensureUniqueSlug(adminClient, input.mergedCandidate.slug);
      const { data, error } = await adminClient
        .from(SERVERS_TABLE)
        .insert({
          name: input.mergedCandidate.name,
          slug,
          description: input.mergedCandidate.description,
          server_url: input.mergedCandidate.serverUrl,
          category: input.mergedCandidate.category,
          auth_type: input.mergedCandidate.authType,
          tags: mergedTags,
          repo_url: input.mergedCandidate.repoUrl,
          maintainer: input.mergedCandidate.maintainer,
          status: "active",
          verification_level: input.verification.verificationLevel,
        })
        .select("id")
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to insert published server: ${error.message}`);
      }

      return {
        created: true,
        changed: true,
        serverId: String((data as { id?: string } | null)?.id ?? ""),
        slug,
      };
    },

    async loadAutoManagedRecords(sourceType) {
      const adminClient = getCatalogAdminClientOrThrow();
      const { data: sourceRows, error: sourceError } = await adminClient
        .from(SERVER_SOURCES_TABLE)
        .select("server_id")
        .eq("source_type", sourceType)
        .eq("publish_state", "published")
        .not("server_id", "is", null)
        .range(0, 9999);

      if (sourceError) {
        throw new Error(`Failed to load auto-managed source rows: ${sourceError.message}`);
      }

      const serverIds = (sourceRows ?? [])
        .map((row) => (row as { server_id?: string | null }).server_id)
        .filter((value): value is string => Boolean(value));

      if (serverIds.length === 0) {
        const fallbackTag = `${sourceType}-sync`;
        const { data: fallbackRows, error: fallbackError } = await adminClient
          .from(SERVERS_TABLE)
          .select("slug, tags")
          .eq("status", "active")
          .contains("tags", [AUTO_MANAGED_TAG, fallbackTag]);

        if (fallbackError) {
          throw new Error(`Failed to load fallback auto-managed servers: ${fallbackError.message}`);
        }

        return (fallbackRows ?? []) as Array<{ slug: string; tags: string[] | null }>;
      }

      const { data, error } = await adminClient
        .from(SERVERS_TABLE)
        .select("slug, tags")
        .in("id", serverIds);

      if (error) {
        throw new Error(`Failed to load auto-managed servers: ${error.message}`);
      }

      return ((data ?? []) as Array<{ slug: string; tags: string[] | null }>);
    },

    async markStaleCandidate(slug) {
      const adminClient = getCatalogAdminClientOrThrow();
      const { data, error } = await adminClient
        .from(SERVERS_TABLE)
        .select("slug, tags")
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to load stale candidate row: ${error.message}`);
      }

      const row = data as { slug: string; tags: string[] | null } | null;
      if (!row) {
        return { changed: false, rejected: false };
      }

      const shouldReject = (row.tags ?? []).some((tag) => normalizeTag(tag) === STALE_CANDIDATE_TAG);
      const { error: updateError } = await adminClient
        .from(SERVERS_TABLE)
        .update(
          shouldReject
            ? { status: "rejected", tags: buildRejectedStaleTags(row.tags) }
            : { tags: buildGraceCandidateTags(row.tags) },
        )
        .eq("slug", slug);

      if (updateError) {
        throw new Error(`Failed to mark stale candidate: ${updateError.message}`);
      }

      return { changed: true, rejected: shouldReject };
    },
  };
}

export async function loadCatalogEnrichmentSeeds(): Promise<Array<{ packageName?: string | null; repoHint?: string | null; rawText?: string | null }>> {
  const adminClient = getCatalogAdminClientOrThrow();
  const [{ data: serverRows, error: serverError }, { data: sourceRows, error: sourceError }] = await Promise.all([
    adminClient
      .from(SERVERS_TABLE)
      .select("name, slug, repo_url, description")
      .range(0, 9999),
    adminClient
      .from(SERVER_SOURCES_TABLE)
      .select("package_name, repo_url, canonical_name")
      .range(0, 9999),
  ]);

  if (serverError) {
    throw new Error(`Failed to load server enrichment seeds: ${serverError.message}`);
  }
  if (sourceError) {
    throw new Error(`Failed to load source enrichment seeds: ${sourceError.message}`);
  }

  const seeds = [
    ...(serverRows ?? []).map((row) => {
      const record = row as { name?: string; slug?: string; repo_url?: string | null; description?: string | null };
      return {
        packageName: record.slug ?? record.name ?? null,
        repoHint: record.repo_url ?? null,
        rawText: record.description ?? null,
      };
    }),
    ...(sourceRows ?? []).map((row) => {
      const record = row as { package_name?: string | null; repo_url?: string | null; canonical_name?: string | null };
      return {
        packageName: record.package_name ?? record.canonical_name ?? null,
        repoHint: record.repo_url ?? null,
        rawText: null,
      };
    }),
  ];

  return seeds;
}

export async function backfillLegacyServerSources(): Promise<number> {
  const adminClient = getCatalogAdminClientOrThrow();
  const [{ data: serverRows, error: serverError }, { data: existingSourceRows, error: sourceError }] = await Promise.all([
    adminClient
      .from(SERVERS_TABLE)
      .select("id, slug, name, repo_url, server_url, tags")
      .eq("status", "active")
      .contains("tags", [AUTO_MANAGED_TAG])
      .range(0, 9999),
    adminClient
      .from(SERVER_SOURCES_TABLE)
      .select("server_id, source_type")
      .not("server_id", "is", null)
      .range(0, 9999),
  ]);

  if (serverError) {
    throw new Error(`Failed to load legacy auto-managed rows for backfill: ${serverError.message}`);
  }
  if (sourceError) {
    throw new Error(`Failed to load existing server_sources for backfill: ${sourceError.message}`);
  }

  const existingKeys = new Set(
    (existingSourceRows ?? []).map((row) => {
      const record = row as { server_id?: string | null; source_type?: string | null };
      return `${record.server_id ?? ""}:${record.source_type ?? ""}`;
    }),
  );

  const candidateRows = buildLegacyServerSourceBackfillRows((serverRows ?? []) as Array<{
    id: string;
    slug: string;
    name: string;
    repo_url: string | null;
    server_url: string | null;
    tags: string[] | null;
  }>);

  const rowsToInsert = candidateRows
    .filter((row) => !existingKeys.has(`${row.serverId}:${row.sourceType}`))
    .map((row) => ({
      server_id: row.serverId,
      source_type: row.sourceType,
      scope_key: "legacy-backfill",
      source_native_id: row.sourceNativeId,
      canonical_name: row.canonicalName,
      repo_url: row.repoUrl,
      repo_url_normalized: row.repoUrlNormalized,
      homepage_url: row.homepageUrl,
      server_url: row.serverUrl,
      package_type: row.packageType,
      package_name: row.packageName,
      package_version: row.packageVersion,
      publish_state: "published",
      match_reason: row.matchReason,
      source_metadata: {
        legacyBackfill: true,
      },
      first_seen_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    }));

  if (rowsToInsert.length === 0) {
    return 0;
  }

  const { error } = await adminClient
    .from(SERVER_SOURCES_TABLE)
    .upsert(rowsToInsert, { onConflict: "source_type,source_native_id" });

  if (error) {
    throw new Error(`Failed to backfill legacy server_sources: ${error.message}`);
  }

  return rowsToInsert.length;
}

export async function loadPendingGithubWebhookSeeds(): Promise<Array<{
  deliveryId: string;
  packageName?: string | null;
  repoHint?: string | null;
  rawText?: string | null;
}>> {
  const adminClient = getCatalogAdminClientOrThrow();
  const { data, error } = await adminClient
    .from(GITHUB_WEBHOOK_DELIVERIES_TABLE)
    .select("delivery_id, repo_full_name, repo_url")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(50);

  if (error) {
    throw new Error(`Failed to load pending GitHub webhook deliveries: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const record = row as { delivery_id?: string; repo_full_name?: string | null; repo_url?: string | null };
    return {
      deliveryId: record.delivery_id ?? "",
      packageName: record.repo_full_name?.split("/").at(-1) ?? null,
      repoHint: record.repo_url ?? null,
      rawText: record.repo_full_name ?? null,
    };
  });
}

export async function markGithubWebhookDeliveriesProcessed(
  deliveryIds: string[],
  runId: string | null,
): Promise<void> {
  if (deliveryIds.length === 0) {
    return;
  }
  const adminClient = getCatalogAdminClientOrThrow();
  const { error } = await adminClient
    .from(GITHUB_WEBHOOK_DELIVERIES_TABLE)
    .update({
      status: "processed",
      sync_run_id: runId,
      processed_at: new Date().toISOString(),
    })
    .in("delivery_id", deliveryIds);

  if (error) {
    throw new Error(`Failed to mark GitHub webhook deliveries processed: ${error.message}`);
  }
}

export async function enqueueCatalogGithubWebhookDelivery(input: {
  deliveryId: string;
  eventType: string;
  repoFullName: string | null;
  repoUrl: string | null;
  repoUrlNormalized: string | null;
  payload: unknown;
}): Promise<{ duplicate: boolean }> {
  const adminClient = getCatalogAdminClientOrThrow();
  const payloadHash = buildPayloadHash(input.payload);
  const { data: existing, error: existingError } = await adminClient
    .from(GITHUB_WEBHOOK_DELIVERIES_TABLE)
    .select("id")
    .eq("delivery_id", input.deliveryId)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Failed to check GitHub webhook delivery id: ${existingError.message}`);
  }
  if (existing) {
    return { duplicate: true };
  }

  const { error } = await adminClient
    .from(GITHUB_WEBHOOK_DELIVERIES_TABLE)
    .insert({
      delivery_id: input.deliveryId,
      event_type: input.eventType,
      repo_full_name: input.repoFullName,
      repo_url: input.repoUrl,
      repo_url_normalized: input.repoUrlNormalized,
      payload_hash: payloadHash.hash,
      payload: input.payload ?? {},
      status: "queued",
    });

  if (error) {
    throw new Error(`Failed to enqueue GitHub webhook delivery: ${error.message}`);
  }

  return { duplicate: false };
}
