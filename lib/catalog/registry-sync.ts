import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AuthType, ServerStatus, VerificationLevel } from "@/lib/types";
const DEFAULT_REGISTRY_URL = "https://registry.modelcontextprotocol.io/v0.1/servers";
const DEFAULT_PAGE_LIMIT = 100;
const DEFAULT_MAX_PAGES = 120;
const DEFAULT_MIN_STALE_BASELINE_RATIO = 0.7;
const DEFAULT_MAX_STALE_MARK_RATIO = 0.15;
const MAX_PAGE_LIMIT = 100;
const MAX_PAGES = 200;
const UPSERT_CHUNK_SIZE = 50;
const STALE_UPDATE_CHUNK_SIZE = 25;
const QUALITY_FILTER_SAMPLE_LIMIT = 50;
const MODERATION_FILTER_SAMPLE_LIMIT = 50;
const STALE_MARK_TAG = "registry-stale";
const STALE_CANDIDATE_TAG = "registry-stale-candidate";
const AUTO_MANAGED_TAG = "registry-auto";
const REGISTRY_SOURCE_TAG = "mcp-registry";
const FALLBACK_CATEGORY = "Other Tools and Integrations";
const AUTO_STATUS: ServerStatus = "active";
const AUTO_VERIFICATION_LEVEL: VerificationLevel = "community";
type RegistryTransport = {
    type?: string;
    url?: string;
};
type RegistryEnvironmentVariable = {
    name?: string;
    isSecret?: boolean;
};
type RegistryPackage = {
    registryType?: string;
    transport?: RegistryTransport;
    environmentVariables?: RegistryEnvironmentVariable[];
};
type RegistryRepository = {
    url?: string;
    source?: string;
};
type RegistryServer = {
    name?: string;
    title?: string;
    description?: string;
    repository?: RegistryRepository;
    remotes?: RegistryTransport[];
    packages?: RegistryPackage[];
};
type RegistryOfficialMeta = {
    status?: string;
};
type RegistryRecord = {
    server?: RegistryServer;
    _meta?: {
        "io.modelcontextprotocol.registry/official"?: RegistryOfficialMeta;
    };
};
type RegistryResponse = {
    servers?: RegistryRecord[];
    metadata?: {
        nextCursor?: string | null;
        count?: number;
    };
};
type ExistingServerRow = {
    slug: string;
    tags: string[] | null;
};
type AutoManagedActiveRow = {
    slug: string;
    tags: string[] | null;
};
type SyncRowPayload = {
    name: string;
    slug: string;
    description: string;
    server_url: string | null;
    category: string;
    auth_type: AuthType;
    tags: string[];
    repo_url: string | null;
    maintainer: {
        name: string;
        email?: string;
    };
    status: ServerStatus;
    verification_level: VerificationLevel;
};
export type CatalogRegistrySyncFailure = {
    slug: string;
    reason: string;
};
export type CatalogRegistrySyncQualityFilterHit = {
    slug: string;
    score: number;
    reason: string;
};
export type CatalogRegistrySyncModerationFilterHit = {
    slug: string;
    reason: string;
};
export type CatalogRegistrySyncResult = {
    executedAt: string;
    registryUrl: string;
    pageLimit: number;
    maxPages: number;
    fetchedPages: number;
    fetchedRecords: number;
    candidates: number;
    queuedForUpsert: number;
    created: number;
    updated: number;
    moderationRulesEnabled: boolean;
    allowlistPatternCount: number;
    denylistPatternCount: number;
    allowlisted: number;
    moderationFiltered: number;
    moderationFilteredSamples: CatalogRegistrySyncModerationFilterHit[];
    qualityFilterEnabled: boolean;
    qualityFiltered: number;
    qualityFilteredSamples: CatalogRegistrySyncQualityFilterHit[];
    skippedManual: number;
    skippedInvalid: number;
    failed: number;
    failures: CatalogRegistrySyncFailure[];
    changedSlugs: string[];
    staleCleanupEnabled: boolean;
    staleCleanupApplied: boolean;
    staleCleanupReason: string | null;
    minStaleBaselineRatio: number;
    maxStaleMarkRatio: number;
    staleBaselineCount: number;
    staleCoverageRatio: number | null;
    staleCandidates: number;
    staleCappedCount: number;
    staleGraceMarked: number;
    staleRejectedAfterGrace: number;
    staleMarked: number;
    staleFailed: number;
};
export type CatalogRegistrySyncOptions = {
    registryUrl?: string;
    pageLimit?: number;
    maxPages?: number;
    cleanupStale?: boolean;
    minStaleBaselineRatio?: number;
    maxStaleMarkRatio?: number;
    qualityFilter?: boolean;
    allowlistPatterns?: string[];
    denylistPatterns?: string[];
};
type CategoryRule = {
    category: string;
    keywords: string[];
};
type QualitySignal = {
    name: string;
    pattern: RegExp;
    weight: number;
};
type ModerationPatternMatcher = {
    raw: string;
    regex: RegExp;
};
const categoryRules: CategoryRule[] = [
    {
        category: "Developer Tools",
        keywords: ["developer", "code", "coding", "git", "github", "gitlab", "repo", "ci", "devops"],
    },
    {
        category: "Communication",
        keywords: ["chat", "message", "messaging", "slack", "discord", "teams", "email", "telegram"],
    },
    {
        category: "Search",
        keywords: ["search", "crawler", "crawl", "scrape", "scraper", "discovery", "index"],
    },
    {
        category: "Databases",
        keywords: ["database", "db", "sql", "postgres", "mysql", "redis", "mongodb"],
    },
    {
        category: "Cloud Platforms",
        keywords: ["cloud", "aws", "azure", "gcp", "kubernetes", "docker", "vercel"],
    },
    {
        category: "Monitoring",
        keywords: ["monitor", "monitoring", "observability", "trace", "metrics", "sentry", "logs"],
    },
    {
        category: "Finance & Fintech",
        keywords: ["finance", "fintech", "payment", "billing", "bank", "invoice", "stripe", "crypto"],
    },
    {
        category: "Calendar & Productivity",
        keywords: ["calendar", "task", "todo", "productivity", "notion", "asana", "trello", "jira"],
    },
    {
        category: "Knowledge & Memory",
        keywords: ["knowledge", "memory", "wiki", "docs", "documentation", "notebook"],
    },
    {
        category: "File Systems",
        keywords: ["storage", "files", "filesystem", "drive", "dropbox", "s3", "bucket"],
    },
    {
        category: "Social Media",
        keywords: ["twitter", "x.com", "linkedin", "facebook", "instagram", "youtube", "social"],
    },
    {
        category: "Security",
        keywords: ["security", "auth", "oauth", "token", "secret", "vault", "compliance"],
    },
];
const qualitySignals: QualitySignal[] = [
    {
        name: "staging/sandbox marker",
        pattern: /\b(staging|sandbox|localhost)\b/i,
        weight: 2,
    },
    {
        name: "proof-of-concept marker",
        pattern: /\b(poc|proof[- ]of[- ]concept)\b/i,
        weight: 2,
    },
    {
        name: "testing marker",
        pattern: /\b(test|testing|qa)\b/i,
        weight: 1,
    },
    {
        name: "demo/sample marker",
        pattern: /\b(demo|sample|example|tutorial)\b/i,
        weight: 1,
    },
    {
        name: "template marker",
        pattern: /\b(template|boilerplate|starter)\b/i,
        weight: 1,
    },
    {
        name: "homework marker",
        pattern: /\b(hw|homework|assignment)\b/i,
        weight: 1,
    },
    {
        name: "hello marker",
        pattern: /\bhello(?:[- ]world)?\b/i,
        weight: 1,
    },
    {
        name: "personal marker",
        pattern: /\b(my[- ]?mcp|personal[- ]?mcp)\b/i,
        weight: 1,
    },
];
function parseBoundedInt(raw: number | undefined, fallback: number, min: number, max: number): number {
    const numericRaw = typeof raw === "number" ? raw : Number.NaN;
    if (!Number.isFinite(numericRaw)) {
        return fallback;
    }
    return Math.max(min, Math.min(Math.round(numericRaw), max));
}
function parseBoundedRatio(raw: number | undefined, fallback: number, min: number, max: number): number {
    const numericRaw = typeof raw === "number" ? raw : Number.NaN;
    if (!Number.isFinite(numericRaw)) {
        return fallback;
    }
    return Math.max(min, Math.min(numericRaw, max));
}
function toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return "Unexpected sync error";
}
function normalizeWhitespace(value: string): string {
    return value.trim().replace(/\s+/g, " ");
}
function toSafeString(value: unknown): string {
    return typeof value === "string" ? normalizeWhitespace(value) : "";
}
function normalizeTag(value: string): string {
    return value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);
}
function normalizeSlug(value: string): string {
    return value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 90);
}
function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function buildModerationPatternMatcher(rawPattern: string): ModerationPatternMatcher | null {
    const pattern = normalizeWhitespace(rawPattern);
    if (!pattern) {
        return null;
    }
    const regexCandidate = pattern.match(/^\/(.+)\/([dgimsuvy]*)$/);
    if (regexCandidate) {
        const [, body, flags] = regexCandidate;
        try {
            return {
                raw: pattern,
                regex: new RegExp(body, flags),
            };
        }
        catch {
            return null;
        }
    }
    const wildcardPattern = escapeRegex(pattern).replace(/\\\*/g, ".*").replace(/\\\?/g, ".");
    try {
        return {
            raw: pattern,
            regex: new RegExp(wildcardPattern, "i"),
        };
    }
    catch {
        return null;
    }
}
function buildModerationPatternMatchers(patterns: string[] | undefined): ModerationPatternMatcher[] {
    const uniquePatterns = new Set<string>();
    const matchers: ModerationPatternMatcher[] = [];
    for (const pattern of patterns ?? []) {
        const normalizedPattern = normalizeWhitespace(pattern);
        if (!normalizedPattern || uniquePatterns.has(normalizedPattern.toLowerCase())) {
            continue;
        }
        uniquePatterns.add(normalizedPattern.toLowerCase());
        const matcher = buildModerationPatternMatcher(normalizedPattern);
        if (!matcher) {
            continue;
        }
        matchers.push(matcher);
    }
    return matchers;
}
function createFallbackSlug(seed: string): string {
    const hash = createHash("sha256").update(seed).digest("hex").slice(0, 12);
    return `registry-${hash}`;
}
function isHttpUrl(value: string): boolean {
    try {
        const parsed = new URL(value);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    }
    catch {
        return false;
    }
}
function toHttpUrlOrNull(value: unknown): string | null {
    const candidate = toSafeString(value);
    if (!candidate || !isHttpUrl(candidate)) {
        return null;
    }
    return candidate;
}
function getServerName(registryName: string, title: string): string {
    if (title) {
        return title.slice(0, 120);
    }
    const candidate = registryName.split("/").at(-1) ?? registryName;
    const formatted = candidate
        .replace(/[._-]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
        .trim();
    return (formatted || registryName).slice(0, 120);
}
function getMaintainerName(registryName: string): string {
    const namespace = registryName.split("/")[0] ?? "MCP Registry";
    const formatted = namespace
        .replace(/[._-]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
        .trim();
    return (formatted || "MCP Registry").slice(0, 120);
}
function inferCategory(source: string): string {
    const normalizedSource = source.toLowerCase();
    for (const rule of categoryRules) {
        if (rule.keywords.some((keyword) => normalizedSource.includes(keyword))) {
            return rule.category;
        }
    }
    return FALLBACK_CATEGORY;
}
function inferAuthType(server: RegistryServer, source: string): AuthType {
    const normalizedSource = source.toLowerCase();
    if (normalizedSource.includes("oauth")) {
        return "oauth";
    }
    const hasSecretEnvironmentVariables = (server.packages ?? []).some((entry) => (entry.environmentVariables ?? []).some((environmentVariable) => Boolean(environmentVariable.isSecret)));
    if (hasSecretEnvironmentVariables ||
        normalizedSource.includes("api key") ||
        normalizedSource.includes("token") ||
        normalizedSource.includes("secret")) {
        return "api_key";
    }
    return "none";
}
function pickRemoteUrl(server: RegistryServer): string | null {
    for (const remote of server.remotes ?? []) {
        const url = toHttpUrlOrNull(remote.url);
        if (url) {
            return url;
        }
    }
    for (const entry of server.packages ?? []) {
        const url = toHttpUrlOrNull(entry.transport?.url);
        if (url) {
            return url;
        }
    }
    return null;
}
function buildTags(server: RegistryServer): string[] {
    const tags = new Set<string>([AUTO_MANAGED_TAG, REGISTRY_SOURCE_TAG]);
    for (const remote of server.remotes ?? []) {
        const transportTag = normalizeTag(`transport-${toSafeString(remote.type)}`);
        if (transportTag) {
            tags.add(transportTag);
        }
    }
    for (const entry of server.packages ?? []) {
        const packageTag = normalizeTag(`package-${toSafeString(entry.registryType)}`);
        if (packageTag) {
            tags.add(packageTag);
        }
        const transportTag = normalizeTag(`transport-${toSafeString(entry.transport?.type)}`);
        if (transportTag) {
            tags.add(transportTag);
        }
    }
    const repoSourceTag = normalizeTag(`source-${toSafeString(server.repository?.source)}`);
    if (repoSourceTag) {
        tags.add(repoSourceTag);
    }
    return [...tags].slice(0, 12);
}
function toSyncPayload(record: RegistryRecord): SyncRowPayload | null {
    const server = record.server;
    if (!server) {
        return null;
    }
    const registryName = toSafeString(server.name);
    if (!registryName) {
        return null;
    }
    const slugCandidate = normalizeSlug(registryName.replace(/\//g, "-"));
    const slug = slugCandidate || createFallbackSlug(registryName);
    const title = toSafeString(server.title);
    const description = toSafeString(server.description) ||
        `Automatically imported from MCP Registry entry: ${registryName}.`;
    const serverUrl = pickRemoteUrl(server);
    const repoUrl = toHttpUrlOrNull(server.repository?.url);
    const sourceForInference = [registryName, title, description, repoUrl ?? ""].join(" ");
    const authType = inferAuthType(server, sourceForInference);
    const category = inferCategory(sourceForInference);
    const officialStatus = toSafeString(record._meta?.["io.modelcontextprotocol.registry/official"]?.status).toLowerCase();
    if (officialStatus && officialStatus !== "active") {
        return null;
    }
    return {
        name: getServerName(registryName, title),
        slug,
        description: description.slice(0, 800),
        server_url: serverUrl,
        category,
        auth_type: authType,
        tags: buildTags(server),
        repo_url: repoUrl,
        maintainer: {
            name: getMaintainerName(registryName),
        },
        status: AUTO_STATUS,
        verification_level: AUTO_VERIFICATION_LEVEL,
    };
}
function getQualityFilterHit(payload: SyncRowPayload): CatalogRegistrySyncQualityFilterHit | null {
    const source = [payload.slug, payload.name, payload.description, payload.repo_url ?? ""].join(" ");
    let score = 0;
    const reasons: string[] = [];
    let hasStrongSignal = false;
    for (const signal of qualitySignals) {
        if (!signal.pattern.test(source)) {
            continue;
        }
        score += signal.weight;
        reasons.push(signal.name);
        if (signal.weight >= 2) {
            hasStrongSignal = true;
        }
    }
    if (!payload.repo_url && !payload.server_url) {
        score += 1;
        reasons.push("missing repo/server URL");
    }
    if (/-[a-f0-9]{8,}$/i.test(payload.slug)) {
        score += 1;
        reasons.push("hash-suffixed slug");
    }
    if (payload.description.startsWith("Automatically imported from MCP Registry entry:")) {
        score += 1;
        reasons.push("missing human description");
    }
    const shouldFilter = score >= 3 || (score >= 2 && hasStrongSignal);
    if (!shouldFilter) {
        return null;
    }
    return {
        slug: payload.slug,
        score,
        reason: [...new Set(reasons)].slice(0, 3).join(", "),
    };
}
function getModerationPatternMatch(payload: SyncRowPayload, matchers: ModerationPatternMatcher[]): string | null {
    const source = [payload.slug, payload.name, payload.description, payload.repo_url ?? ""].join(" ");
    for (const matcher of matchers) {
        if (matcher.regex.test(source)) {
            return matcher.raw;
        }
    }
    return null;
}
function buildRequestUrl(baseUrl: string, pageLimit: number, cursor: string | null): URL {
    const requestUrl = new URL(baseUrl);
    requestUrl.searchParams.set("limit", String(pageLimit));
    if (cursor) {
        requestUrl.searchParams.set("cursor", cursor);
    }
    return requestUrl;
}
async function fetchRegistryPage(registryUrl: string, pageLimit: number, cursor: string | null): Promise<RegistryResponse> {
    const requestUrl = buildRequestUrl(registryUrl, pageLimit, cursor);
    const response = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
        headers: {
            accept: "application/json",
        },
    });
    if (!response.ok) {
        throw new Error(`Registry request failed (${response.status})`);
    }
    const payload = (await response.json()) as RegistryResponse;
    return payload;
}
function isAutoManaged(row: ExistingServerRow): boolean {
    return (row.tags ?? []).some((tag) => tag.trim().toLowerCase() === AUTO_MANAGED_TAG);
}
function chunkArray<TValue>(values: TValue[], chunkSize: number): TValue[][] {
    if (values.length === 0) {
        return [];
    }
    const chunks: TValue[][] = [];
    for (let index = 0; index < values.length; index += chunkSize) {
        chunks.push(values.slice(index, index + chunkSize));
    }
    return chunks;
}
function addChangedSlug(result: CatalogRegistrySyncResult, slug: string): void {
    if (!result.changedSlugs.includes(slug)) {
        result.changedSlugs.push(slug);
    }
}
async function fetchExistingRows(adminClient: SupabaseClient, slugs: string[]): Promise<Map<string, ExistingServerRow>> {
    const existingBySlug = new Map<string, ExistingServerRow>();
    for (const slugChunk of chunkArray(slugs, 250)) {
        const { data, error } = await adminClient
            .from("servers")
            .select("slug, tags")
            .in("slug", slugChunk);
        if (error) {
            throw new Error(`Failed to read existing servers: ${error.message}`);
        }
        for (const row of (data ?? []) as ExistingServerRow[]) {
            existingBySlug.set(row.slug, row);
        }
    }
    return existingBySlug;
}
async function fetchActiveAutoManagedRows(adminClient: SupabaseClient): Promise<AutoManagedActiveRow[]> {
    const rows: AutoManagedActiveRow[] = [];
    const pageSize = 1000;
    for (let rangeStart = 0;; rangeStart += pageSize) {
        const { data, error } = await adminClient
            .from("servers")
            .select("slug, tags")
            .eq("status", "active")
            .contains("tags", [AUTO_MANAGED_TAG])
            .range(rangeStart, rangeStart + pageSize - 1);
        if (error) {
            throw new Error(`Failed to read auto-managed active servers: ${error.message}`);
        }
        const pageRows = (data ?? []) as AutoManagedActiveRow[];
        rows.push(...pageRows);
        if (pageRows.length < pageSize) {
            break;
        }
    }
    return rows;
}
async function upsertRows(adminClient: SupabaseClient, rows: SyncRowPayload[], existingBySlug: Map<string, ExistingServerRow>, result: CatalogRegistrySyncResult): Promise<void> {
    for (const chunk of chunkArray(rows, UPSERT_CHUNK_SIZE)) {
        const { error } = await adminClient.from("servers").upsert(chunk, {
            onConflict: "slug",
            ignoreDuplicates: false,
        });
        if (!error) {
            for (const row of chunk) {
                if (existingBySlug.has(row.slug)) {
                    result.updated += 1;
                }
                else {
                    result.created += 1;
                }
                addChangedSlug(result, row.slug);
            }
            continue;
        }
        for (const row of chunk) {
            const { error: rowError } = await adminClient.from("servers").upsert(row, {
                onConflict: "slug",
                ignoreDuplicates: false,
            });
            if (rowError) {
                result.failed += 1;
                result.failures.push({
                    slug: row.slug,
                    reason: rowError.message,
                });
                continue;
            }
            if (existingBySlug.has(row.slug)) {
                result.updated += 1;
            }
            else {
                result.created += 1;
            }
            addChangedSlug(result, row.slug);
        }
    }
}
function hasTag(tags: string[] | null, expected: string): boolean {
    return (tags ?? []).some((tag) => normalizeTag(tag) === expected);
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
    return [...normalized].slice(0, 12);
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
    return [...normalized].slice(0, 12);
}
async function markStaleRows(adminClient: SupabaseClient, staleRows: AutoManagedActiveRow[], result: CatalogRegistrySyncResult): Promise<void> {
    for (const chunk of chunkArray(staleRows, STALE_UPDATE_CHUNK_SIZE)) {
        const outcomes = await Promise.all(chunk.map(async (row) => {
            const shouldRejectNow = hasTag(row.tags, STALE_CANDIDATE_TAG);
            const { error } = await adminClient
                .from("servers")
                .update(shouldRejectNow
                ? {
                    status: "rejected",
                    tags: buildRejectedStaleTags(row.tags),
                }
                : {
                    tags: buildGraceCandidateTags(row.tags),
                })
                .eq("slug", row.slug);
            return {
                slug: row.slug,
                shouldRejectNow,
                error,
            };
        }));
        for (const outcome of outcomes) {
            if (outcome.error) {
                result.failed += 1;
                result.staleFailed += 1;
                result.failures.push({
                    slug: outcome.slug,
                    reason: `stale_cleanup: ${outcome.error.message}`,
                });
                continue;
            }
            if (outcome.shouldRejectNow) {
                result.staleRejectedAfterGrace += 1;
                result.staleMarked += 1;
            }
            else {
                result.staleGraceMarked += 1;
            }
            addChangedSlug(result, outcome.slug);
        }
    }
}
export async function runCatalogRegistrySync(options: CatalogRegistrySyncOptions = {}): Promise<CatalogRegistrySyncResult> {
    const registryUrl = options.registryUrl?.trim() || DEFAULT_REGISTRY_URL;
    const pageLimit = parseBoundedInt(options.pageLimit, DEFAULT_PAGE_LIMIT, 1, MAX_PAGE_LIMIT);
    const maxPages = parseBoundedInt(options.maxPages, DEFAULT_MAX_PAGES, 1, MAX_PAGES);
    const cleanupStale = options.cleanupStale ?? true;
    const minStaleBaselineRatio = parseBoundedRatio(options.minStaleBaselineRatio, DEFAULT_MIN_STALE_BASELINE_RATIO, 0, 1);
    const maxStaleMarkRatio = parseBoundedRatio(options.maxStaleMarkRatio, DEFAULT_MAX_STALE_MARK_RATIO, 0, 1);
    const qualityFilter = options.qualityFilter ?? true;
    const allowlistMatchers = buildModerationPatternMatchers(options.allowlistPatterns);
    const denylistMatchers = buildModerationPatternMatchers(options.denylistPatterns);
    const moderationRulesEnabled = allowlistMatchers.length > 0 || denylistMatchers.length > 0;
    const result: CatalogRegistrySyncResult = {
        executedAt: new Date().toISOString(),
        registryUrl,
        pageLimit,
        maxPages,
        fetchedPages: 0,
        fetchedRecords: 0,
        candidates: 0,
        queuedForUpsert: 0,
        created: 0,
        updated: 0,
        moderationRulesEnabled,
        allowlistPatternCount: allowlistMatchers.length,
        denylistPatternCount: denylistMatchers.length,
        allowlisted: 0,
        moderationFiltered: 0,
        moderationFilteredSamples: [],
        qualityFilterEnabled: qualityFilter,
        qualityFiltered: 0,
        qualityFilteredSamples: [],
        skippedManual: 0,
        skippedInvalid: 0,
        failed: 0,
        failures: [],
        changedSlugs: [],
        staleCleanupEnabled: cleanupStale,
        staleCleanupApplied: false,
        staleCleanupReason: null,
        minStaleBaselineRatio,
        maxStaleMarkRatio,
        staleBaselineCount: 0,
        staleCoverageRatio: null,
        staleCandidates: 0,
        staleCappedCount: 0,
        staleGraceMarked: 0,
        staleRejectedAfterGrace: 0,
        staleMarked: 0,
        staleFailed: 0,
    };
    const adminClient = createSupabaseAdminClient();
    if (!adminClient) {
        throw new Error("Supabase admin credentials are not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    }
    const candidateMap = new Map<string, SyncRowPayload>();
    const allowlistedSlugs = new Set<string>();
    const filteredModerationSlugs = new Set<string>();
    const filteredQualitySlugs = new Set<string>();
    let cursor: string | null = null;
    let reachedRegistryEnd = false;
    for (let pageIndex = 0; pageIndex < maxPages; pageIndex += 1) {
        let responsePayload: RegistryResponse;
        try {
            responsePayload = await fetchRegistryPage(registryUrl, pageLimit, cursor);
        }
        catch (error) {
            result.failed += 1;
            result.failures.push({
                slug: `page-${pageIndex + 1}`,
                reason: toErrorMessage(error),
            });
            break;
        }
        const records = Array.isArray(responsePayload.servers) ? responsePayload.servers : [];
        result.fetchedPages += 1;
        result.fetchedRecords += records.length;
        for (const record of records) {
            const payload = toSyncPayload(record);
            if (!payload) {
                result.skippedInvalid += 1;
                continue;
            }
            const allowlistedBy = getModerationPatternMatch(payload, allowlistMatchers);
            if (allowlistedBy) {
                if (!allowlistedSlugs.has(payload.slug)) {
                    allowlistedSlugs.add(payload.slug);
                    result.allowlisted += 1;
                }
            }
            else {
                const denylistedBy = getModerationPatternMatch(payload, denylistMatchers);
                if (denylistedBy) {
                    if (filteredModerationSlugs.has(payload.slug)) {
                        continue;
                    }
                    filteredModerationSlugs.add(payload.slug);
                    result.moderationFiltered += 1;
                    if (result.moderationFilteredSamples.length < MODERATION_FILTER_SAMPLE_LIMIT) {
                        result.moderationFilteredSamples.push({
                            slug: payload.slug,
                            reason: `denylist: ${denylistedBy}`,
                        });
                    }
                    continue;
                }
            }
            if (qualityFilter) {
                const qualityHit = getQualityFilterHit(payload);
                if (qualityHit) {
                    if (filteredQualitySlugs.has(qualityHit.slug)) {
                        continue;
                    }
                    filteredQualitySlugs.add(qualityHit.slug);
                    result.qualityFiltered += 1;
                    if (result.qualityFilteredSamples.length < QUALITY_FILTER_SAMPLE_LIMIT) {
                        result.qualityFilteredSamples.push(qualityHit);
                    }
                    continue;
                }
            }
            if (!candidateMap.has(payload.slug)) {
                candidateMap.set(payload.slug, payload);
            }
        }
        const nextCursor = typeof responsePayload.metadata?.nextCursor === "string"
            ? responsePayload.metadata.nextCursor
            : null;
        if (!nextCursor) {
            reachedRegistryEnd = true;
            break;
        }
        cursor = nextCursor;
    }
    const candidates = [...candidateMap.values()];
    result.candidates = candidates.length;
    if (candidates.length === 0) {
        if (result.moderationFiltered > 0) {
            result.staleCleanupReason =
                "Skipped because all fetched entries were filtered by moderation denylist rules.";
        }
        else if (result.qualityFiltered > 0) {
            result.staleCleanupReason = "Skipped because all fetched entries were filtered by quality rules.";
        }
        else {
            result.staleCleanupReason = "Skipped because no registry candidates were fetched.";
        }
        return result;
    }
    const existingBySlug = await fetchExistingRows(adminClient, candidates.map((candidate) => candidate.slug));
    const rowsToUpsert: SyncRowPayload[] = [];
    for (const candidate of candidates) {
        const existing = existingBySlug.get(candidate.slug);
        if (!existing) {
            rowsToUpsert.push(candidate);
            continue;
        }
        if (isAutoManaged(existing)) {
            rowsToUpsert.push(candidate);
            continue;
        }
        result.skippedManual += 1;
    }
    result.queuedForUpsert = rowsToUpsert.length;
    if (rowsToUpsert.length > 0) {
        await upsertRows(adminClient, rowsToUpsert, existingBySlug, result);
    }
    if (!cleanupStale) {
        result.staleCleanupReason = "Disabled by configuration.";
        return result;
    }
    if (!reachedRegistryEnd) {
        result.staleCleanupReason =
            "Skipped because registry pagination did not reach the end. Increase CATALOG_AUTOSYNC_MAX_PAGES.";
        return result;
    }
    if (result.failed > 0) {
        result.staleCleanupReason = "Skipped because sync encountered failures.";
        return result;
    }
    const activeAutoManagedRows = await fetchActiveAutoManagedRows(adminClient);
    result.staleBaselineCount = activeAutoManagedRows.length;
    if (activeAutoManagedRows.length > 0) {
        const staleCoverageRatio = candidates.length / activeAutoManagedRows.length;
        result.staleCoverageRatio = staleCoverageRatio;
        if (staleCoverageRatio < minStaleBaselineRatio) {
            result.staleCleanupReason =
                `Skipped because fetched registry coverage (${(staleCoverageRatio * 100).toFixed(1)}%) is below safety threshold (${(minStaleBaselineRatio * 100).toFixed(1)}%).`;
            return result;
        }
    }
    result.staleCleanupApplied = true;
    const registrySlugSet = new Set(candidates.map((candidate) => candidate.slug));
    const staleRows = activeAutoManagedRows.filter((row) => !registrySlugSet.has(row.slug));
    result.staleCandidates = staleRows.length;
    if (staleRows.length === 0) {
        result.staleCleanupReason = "No stale auto-managed rows found.";
        return result;
    }
    const staleLimit = maxStaleMarkRatio <= 0
        ? 0
        : Math.max(1, Math.floor(activeAutoManagedRows.length * maxStaleMarkRatio));
    let staleRowsToProcess = staleRows;
    if (staleRows.length > staleLimit) {
        result.staleCappedCount = staleRows.length - staleLimit;
        staleRowsToProcess = [...staleRows].sort((left, right) => left.slug.localeCompare(right.slug)).slice(0, staleLimit);
    }
    if (staleRowsToProcess.length === 0) {
        result.staleCleanupReason =
            "Skipped because max stale mark ratio is 0; stale candidates were detected but not processed.";
        return result;
    }
    await markStaleRows(adminClient, staleRowsToProcess, result);
    if (result.staleFailed === 0) {
        if (result.staleRejectedAfterGrace > 0) {
            result.staleCleanupReason =
                "Stale cleanup applied with grace: previously marked rows were rejected, newly stale rows were marked as candidates.";
        }
        else {
            result.staleCleanupReason =
                "Stale cleanup applied with grace: rows were marked as stale candidates and will be rejected only if still stale on the next healthy sync.";
        }
        if (result.staleCappedCount > 0) {
            result.staleCleanupReason += ` Processing was capped this run (deferred ${result.staleCappedCount} stale rows).`;
        }
    }
    else {
        result.staleCleanupReason =
            "Stale cleanup finished with partial failures. See failures[] for details.";
    }
    return result;
}
export const catalogRegistrySyncDefaults = {
    registryUrl: DEFAULT_REGISTRY_URL,
    pageLimit: DEFAULT_PAGE_LIMIT,
    maxPages: DEFAULT_MAX_PAGES,
};
