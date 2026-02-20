import { revalidatePath, revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { parseNumber, parseNumberEnv } from "@/lib/api/auth-helpers";
import { withCronAuth } from "@/lib/api/with-auth";
import { runCatalogGithubSync, type CatalogSyncResult } from "@/lib/catalog/github-sync";
import { CATALOG_SERVERS_CACHE_TAG } from "@/lib/catalog/snapshot";

export const dynamic = "force-dynamic";

const DEFAULT_MAX_PAGES = 120;
const MAX_GITHUB_SEARCH_PAGES = 200;
const NETWORK_RETRY_ATTEMPTS = 3;
const NETWORK_RETRY_DELAY_MS = 1500;

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

function toErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return "Unexpected auto-sync error";
}

function isNetworkFetchFailure(error: unknown): boolean {
    const message = toErrorMessage(error).toLowerCase();
    if (message.includes("fetch failed") || message.includes("econn") || message.includes("etimedout")) {
        return true;
    }
    if (error instanceof Error && "cause" in error) {
        const cause = (error as { cause?: unknown }).cause;
        if (cause && typeof cause === "object") {
            const causeCode = String((cause as { code?: unknown }).code ?? "").toUpperCase();
            return causeCode.startsWith("ECONN") || causeCode === "ETIMEDOUT" || causeCode === "ENOTFOUND";
        }
    }
    return false;
}

async function delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

function buildAlertingSignals(result: CatalogSyncResult): AutoSyncAlerting {
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

const handlers = withCronAuth(
    async (request: NextRequest, { logger }) => {
        const envMaxPages = parseNumberEnv("CATALOG_AUTOSYNC_MAX_PAGES", DEFAULT_MAX_PAGES, {
            min: 1,
            max: MAX_GITHUB_SEARCH_PAGES,
        });
        const maxPages = parseNumber(request.nextUrl.searchParams.get("pages"), envMaxPages, {
            min: 1,
            max: MAX_GITHUB_SEARCH_PAGES,
        });

        let result: CatalogSyncResult | null = null;
        let lastError: unknown = null;
        for (let attempt = 1; attempt <= NETWORK_RETRY_ATTEMPTS; attempt += 1) {
            try {
                result = await runCatalogGithubSync({ maxPages });
                lastError = null;
                break;
            } catch (error) {
                lastError = error;
                const retryable = isNetworkFetchFailure(error);
                logger.warn("catalog.auto_sync.retry", {
                    attempt,
                    maxAttempts: NETWORK_RETRY_ATTEMPTS,
                    retryable,
                    message: toErrorMessage(error),
                });
                if (!retryable || attempt >= NETWORK_RETRY_ATTEMPTS) {
                    break;
                }
                await delay(NETWORK_RETRY_DELAY_MS * attempt);
            }
        }

        if (!result) {
            const error = lastError ?? new Error("Catalog auto-sync failed before completion.");
            const errorMessage = toErrorMessage(error);
            logger.error("catalog.auto_sync.unhandled_error", {
                message: errorMessage,
            });
            const debug =
                process.env.NODE_ENV === "production"
                    ? undefined
                    : {
                          message: errorMessage,
                          stack: error instanceof Error ? error.stack : undefined,
                      };

            if (isNetworkFetchFailure(error)) {
                return NextResponse.json({
                    ok: false,
                    error: "Catalog auto-sync partially unavailable due to GitHub network failure.",
                    debug,
                    alerting: {
                        status: "partial",
                        shouldWarn: true,
                        shouldPage: false,
                        signalCount: 1,
                        signals: [
                            {
                                code: "SYNC_NETWORK_FAILURE",
                                severity: "warning",
                                message: errorMessage,
                            },
                        ],
                    } satisfies AutoSyncAlerting,
                }, { status: 207 });
            }

            return NextResponse.json({
                ok: false,
                error: "Catalog auto-sync failed before completion.",
                debug,
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

        if (alerting.shouldPage) {
            logger.error("catalog.auto_sync.completed", {
                alertStatus: alerting.status,
                failed: result.failed,
                signals: alerting.signals,
            });
        } else if (alerting.shouldWarn) {
            logger.warn("catalog.auto_sync.completed", {
                alertStatus: alerting.status,
                failed: result.failed,
                signals: alerting.signals,
            });
        }

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
                source: "github",
                maxPages,
            },
        }, { status: alerting.status === "error" ? 207 : 200 });
    },
    ["CATALOG_AUTOSYNC_CRON_SECRET"],
    "catalog.auto_sync",
);

export const GET = handlers.GET;
export const POST = handlers.POST;
