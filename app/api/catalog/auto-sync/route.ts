import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { runCatalogRegistrySync } from "@/lib/catalog/registry-sync";
import { CATALOG_SERVERS_CACHE_TAG } from "@/lib/catalog/snapshot";
export const dynamic = "force-dynamic";
const DEFAULT_PAGE_LIMIT = 100;
const DEFAULT_MAX_PAGES = 120;
const DEFAULT_STALE_CLEANUP_ENABLED = true;
const DEFAULT_MIN_STALE_BASELINE_RATIO = 0.7;
const DEFAULT_MAX_STALE_MARK_RATIO = 0.15;
const DEFAULT_QUALITY_FILTER_ENABLED = true;
type NumberEnvOptions = {
    min: number;
    max: number;
};
type AlertSeverity = "info" | "warning" | "error";
type AutoSyncAlertSignal = {
    code: string;
    severity: AlertSeverity;
    message: string;
    value?: number;
    threshold?: number;
};
type AutoSyncAlerting = {
    status: "ok" | "partial" | "error";
    shouldWarn: boolean;
    shouldPage: boolean;
    signalCount: number;
    signals: AutoSyncAlertSignal[];
};
function parseNumber(value: string | null | undefined, fallback: number, options: NumberEnvOptions): number {
    const raw = value?.trim();
    if (!raw) {
        return fallback;
    }
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) {
        return fallback;
    }
    if (parsed < options.min || parsed > options.max) {
        return fallback;
    }
    return parsed;
}
function parseBoolean(value: string | null | undefined, fallback: boolean): boolean {
    const normalized = value?.trim().toLowerCase();
    if (!normalized) {
        return fallback;
    }
    if (["1", "true", "yes", "on"].includes(normalized)) {
        return true;
    }
    if (["0", "false", "no", "off"].includes(normalized)) {
        return false;
    }
    return fallback;
}
function parseRatio(value: string | null | undefined, fallback: number): number {
    const raw = value?.trim();
    if (!raw) {
        return fallback;
    }
    const parsed = Number.parseFloat(raw);
    if (!Number.isFinite(parsed)) {
        return fallback;
    }
    if (parsed < 0 || parsed > 1) {
        return fallback;
    }
    return parsed;
}
function parseNumberEnv(envName: string, fallback: number, options: NumberEnvOptions): number {
    return parseNumber(process.env[envName], fallback, options);
}
function parseBooleanEnv(envName: string, fallback: boolean): boolean {
    return parseBoolean(process.env[envName], fallback);
}
function parsePatternList(value: string | null | undefined): string[] {
    return (value ?? "")
        .split(/[,;\n]/)
        .map((entry) => entry.trim())
        .filter(Boolean);
}
function parsePatternListEnv(envName: string): string[] {
    return parsePatternList(process.env[envName]);
}
function mergePatternLists(...lists: string[][]): string[] {
    const seen = new Set<string>();
    const merged: string[] = [];
    for (const list of lists) {
        for (const value of list) {
            const key = value.toLowerCase();
            if (seen.has(key)) {
                continue;
            }
            seen.add(key);
            merged.push(value);
        }
    }
    return merged;
}
function extractBearerToken(request: NextRequest): string | null {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
        return null;
    }
    const [scheme, token] = authHeader.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token) {
        return null;
    }
    return token;
}
function getExpectedCronToken(): string | null {
    return process.env.CATALOG_AUTOSYNC_CRON_SECRET || process.env.CRON_SECRET || null;
}
function isValidCronToken(providedToken: string, expectedToken: string): boolean {
    const provided = Buffer.from(providedToken);
    const expected = Buffer.from(expectedToken);
    if (provided.length !== expected.length) {
        return false;
    }
    return timingSafeEqual(provided, expected);
}
function buildAlertingSignals(result: Awaited<ReturnType<typeof runCatalogRegistrySync>>): AutoSyncAlerting {
    const signals: AutoSyncAlertSignal[] = [];
    if (result.failed > 0) {
        signals.push({
            code: "SYNC_FAILURES",
            severity: "error",
            message: "Sync finished with failures. Inspect failures[] for details.",
            value: result.failed,
            threshold: 0,
        });
    }
    if (result.staleCleanupEnabled && !result.staleCleanupApplied) {
        signals.push({
            code: "STALE_CLEANUP_SKIPPED",
            severity: "warning",
            message: result.staleCleanupReason ?? "Stale cleanup skipped.",
        });
    }
    if (result.staleCappedCount > 0) {
        signals.push({
            code: "STALE_CLEANUP_CAPPED",
            severity: "warning",
            message: "Stale cleanup deferred candidates due to per-run cap.",
            value: result.staleCappedCount,
            threshold: 0,
        });
    }
    if (typeof result.staleCoverageRatio === "number" &&
        result.staleCoverageRatio < result.minStaleBaselineRatio) {
        signals.push({
            code: "LOW_STALE_COVERAGE_RATIO",
            severity: "warning",
            message: "Fetched coverage is below stale cleanup safety threshold.",
            value: result.staleCoverageRatio,
            threshold: result.minStaleBaselineRatio,
        });
    }
    const hasError = signals.some((signal) => signal.severity === "error");
    const hasWarning = signals.some((signal) => signal.severity === "warning");
    return {
        status: hasError ? "error" : hasWarning ? "partial" : "ok",
        shouldWarn: hasWarning || hasError,
        shouldPage: hasError,
        signalCount: signals.length,
        signals,
    };
}
function logAutoSyncResult(alerting: AutoSyncAlerting, result: Awaited<ReturnType<typeof runCatalogRegistrySync>>) {
    const payload = {
        event: "catalog.auto_sync.completed",
        alertStatus: alerting.status,
        shouldWarn: alerting.shouldWarn,
        shouldPage: alerting.shouldPage,
        failed: result.failed,
        staleFailed: result.staleFailed,
        staleCleanupApplied: result.staleCleanupApplied,
        staleCleanupReason: result.staleCleanupReason,
        staleCappedCount: result.staleCappedCount,
        fetchedPages: result.fetchedPages,
        fetchedRecords: result.fetchedRecords,
        signals: alerting.signals,
    };
    if (alerting.shouldPage) {
        console.error(payload);
        return;
    }
    if (alerting.shouldWarn) {
        console.warn(payload);
    }
}
async function runCatalogAutoSync(request: NextRequest) {
    const expectedToken = getExpectedCronToken();
    if (!expectedToken) {
        return NextResponse.json({
            ok: false,
            message: "Missing cron secret. Set CATALOG_AUTOSYNC_CRON_SECRET or CRON_SECRET.",
        }, { status: 500 });
    }
    const providedToken = extractBearerToken(request);
    if (!providedToken || !isValidCronToken(providedToken, expectedToken)) {
        return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    const envPageLimit = parseNumberEnv("CATALOG_AUTOSYNC_PAGE_LIMIT", DEFAULT_PAGE_LIMIT, {
        min: 1,
        max: 100,
    });
    const envMaxPages = parseNumberEnv("CATALOG_AUTOSYNC_MAX_PAGES", DEFAULT_MAX_PAGES, {
        min: 1,
        max: 200,
    });
    const envCleanupStale = parseBooleanEnv("CATALOG_AUTOSYNC_STALE_CLEANUP_ENABLED", DEFAULT_STALE_CLEANUP_ENABLED);
    const envMinStaleBaselineRatio = parseRatio(process.env.CATALOG_AUTOSYNC_MIN_STALE_BASELINE_RATIO, DEFAULT_MIN_STALE_BASELINE_RATIO);
    const envMaxStaleMarkRatio = parseRatio(process.env.CATALOG_AUTOSYNC_MAX_STALE_MARK_RATIO, DEFAULT_MAX_STALE_MARK_RATIO);
    const envQualityFilter = parseBooleanEnv("CATALOG_AUTOSYNC_QUALITY_FILTER_ENABLED", DEFAULT_QUALITY_FILTER_ENABLED);
    const envAllowlistPatterns = parsePatternListEnv("CATALOG_AUTOSYNC_ALLOWLIST_PATTERNS");
    const envDenylistPatterns = parsePatternListEnv("CATALOG_AUTOSYNC_DENYLIST_PATTERNS");
    const pageLimit = parseNumber(request.nextUrl.searchParams.get("limit"), envPageLimit, {
        min: 1,
        max: 100,
    });
    const maxPages = parseNumber(request.nextUrl.searchParams.get("pages"), envMaxPages, {
        min: 1,
        max: 200,
    });
    const cleanupStale = parseBoolean(request.nextUrl.searchParams.get("cleanupStale"), envCleanupStale);
    const minStaleBaselineRatio = parseRatio(request.nextUrl.searchParams.get("minStaleBaselineRatio"), envMinStaleBaselineRatio);
    const maxStaleMarkRatio = parseRatio(request.nextUrl.searchParams.get("maxStaleMarkRatio"), envMaxStaleMarkRatio);
    const qualityFilter = parseBoolean(request.nextUrl.searchParams.get("qualityFilter"), envQualityFilter);
    const allowlistPatterns = mergePatternLists(envAllowlistPatterns, parsePatternList(request.nextUrl.searchParams.get("allowlist")));
    const denylistPatterns = mergePatternLists(envDenylistPatterns, parsePatternList(request.nextUrl.searchParams.get("denylist")));
    const registryUrl = process.env.CATALOG_AUTOSYNC_REGISTRY_URL?.trim();
    let result: Awaited<ReturnType<typeof runCatalogRegistrySync>>;
    try {
        result = await runCatalogRegistrySync({
            registryUrl,
            pageLimit,
            maxPages,
            cleanupStale,
            minStaleBaselineRatio,
            maxStaleMarkRatio,
            qualityFilter,
            allowlistPatterns,
            denylistPatterns,
        });
    }
    catch (error) {
        console.error({
            event: "catalog.auto_sync.unhandled_error",
            message: error instanceof Error ? error.message : "Unexpected auto-sync error",
        });
        return NextResponse.json({
            ok: false,
            message: "Catalog auto-sync failed before completion.",
            alerting: {
                status: "error",
                shouldWarn: true,
                shouldPage: true,
                signalCount: 1,
                signals: [
                    {
                        code: "SYNC_UNHANDLED_ERROR",
                        severity: "error",
                        message: "Catalog auto-sync failed before completion.",
                    },
                ],
            } satisfies AutoSyncAlerting,
        }, { status: 500 });
    }
    const alerting = buildAlertingSignals(result);
    logAutoSyncResult(alerting, result);
    revalidatePath("/");
    revalidatePath("/catalog");
    revalidatePath("/categories");
    revalidatePath("/sitemap.xml");
    for (const slug of result.changedSlugs.slice(0, 400)) {
        revalidatePath(`/server/${slug}`);
    }
    revalidateTag(CATALOG_SERVERS_CACHE_TAG, "max");
    return NextResponse.json({
        ok: alerting.status === "ok",
        ...result,
        alerting,
        safety: {
            coverage: {
                ratio: result.staleCoverageRatio,
                minRequiredRatio: result.minStaleBaselineRatio,
                baselineCount: result.staleBaselineCount,
            },
            staleCap: {
                maxPerRunRatio: result.maxStaleMarkRatio,
                totalCandidates: result.staleCandidates,
                deferredCount: result.staleCappedCount,
                processedCount: result.staleCandidates - result.staleCappedCount,
            },
            graceMode: {
                markedAsCandidates: result.staleGraceMarked,
                rejectedAfterGrace: result.staleRejectedAfterGrace,
            },
        },
        settings: {
            pageLimit,
            maxPages,
            cleanupStale,
            minStaleBaselineRatio,
            maxStaleMarkRatio,
            qualityFilter,
            allowlistPatternCount: allowlistPatterns.length,
            denylistPatternCount: denylistPatterns.length,
        },
    }, { status: alerting.status === "error" ? 207 : 200 });
}
export async function GET(request: NextRequest) {
    return runCatalogAutoSync(request);
}
export async function POST(request: NextRequest) {
    return runCatalogAutoSync(request);
}
