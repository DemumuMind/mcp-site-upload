import { NextResponse } from "next/server";
import { parseNumberEnv } from "@/lib/api/auth-helpers";
import { isSafeHostname, normalizeHostname, parseServerUrl } from "@/lib/api/network-safety";
import { withCronAuth } from "@/lib/api/with-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { HealthStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const DEFAULT_REQUEST_TIMEOUT_MS = 8000;
const DEFAULT_MAX_ERROR_LENGTH = 400;
const DEFAULT_MAX_PROBE_ATTEMPTS = 2;
const DEFAULT_RETRY_DELAY_MS = 400;
const DEFAULT_PROBE_CONCURRENCY = 5;
const DEFAULT_UPDATE_CONCURRENCY = 10;
const hostnameSafetyCache = new Map<string, boolean>();

const REQUEST_TIMEOUT_MS = parseNumberEnv("HEALTH_CHECK_REQUEST_TIMEOUT_MS", DEFAULT_REQUEST_TIMEOUT_MS, { min: 500, max: 60000 });
const MAX_ERROR_LENGTH = parseNumberEnv("HEALTH_CHECK_MAX_ERROR_LENGTH", DEFAULT_MAX_ERROR_LENGTH, { min: 50, max: 2000 });
const MAX_PROBE_ATTEMPTS = parseNumberEnv("HEALTH_CHECK_MAX_PROBE_ATTEMPTS", DEFAULT_MAX_PROBE_ATTEMPTS, { min: 1, max: 5 });
const RETRY_DELAY_MS = parseNumberEnv("HEALTH_CHECK_RETRY_DELAY_MS", DEFAULT_RETRY_DELAY_MS, { min: 0, max: 10000 });
const PROBE_CONCURRENCY = parseNumberEnv("HEALTH_CHECK_PROBE_CONCURRENCY", DEFAULT_PROBE_CONCURRENCY, { min: 1, max: 30 });
const UPDATE_CONCURRENCY = parseNumberEnv("HEALTH_CHECK_UPDATE_CONCURRENCY", DEFAULT_UPDATE_CONCURRENCY, { min: 1, max: 30 });

type ActiveServerRow = {
    id: string;
    name: string;
    server_url: string | null;
};
type HealthProbe = {
    id: string;
    name: string;
    healthStatus: HealthStatus;
    healthError: string | null;
};

function classifyHttpStatus(statusCode: number): HealthStatus {
    if (statusCode >= 200 && statusCode < 400) {
        return "healthy";
    }
    if (statusCode >= 400 && statusCode < 500) {
        return "degraded";
    }
    return "down";
}

function toErrorText(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return "Unknown probe error";
}

function isRetryableProbeError(error: unknown): boolean {
    if (!(error instanceof Error)) {
        return false;
    }
    return error.name === "AbortError" || error.name === "TypeError";
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function isSafeProbeHostname(hostname: string): Promise<boolean> {
    const normalized = normalizeHostname(hostname);
    if (!normalized) return false;
    const cached = hostnameSafetyCache.get(normalized);
    if (cached !== undefined) return cached;
    const safe = await isSafeHostname(hostname);
    hostnameSafetyCache.set(normalized, safe);
    return safe;
}

async function fetchProbe(url: URL): Promise<Response> {
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        let currentUrl = new URL(url.toString());
        const maxRedirects = 3;
        for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
            const response = await fetch(currentUrl.toString(), {
                method: "GET",
                redirect: "manual",
                cache: "no-store",
                signal: controller.signal,
                headers: { "user-agent": "demumumind-mcp-health-check/1.0" },
            });

            const location = response.headers.get("location");
            if (!location || response.status < 300 || response.status >= 400) {
                return response;
            }

            if (redirectCount >= maxRedirects) {
                throw new Error("Too many redirects");
            }

            const nextUrl = new URL(location, currentUrl);
            if (nextUrl.protocol !== "http:" && nextUrl.protocol !== "https:") {
                throw new Error("Unsafe redirect protocol");
            }
            if (nextUrl.username || nextUrl.password) {
                throw new Error("Unsafe redirect credentials");
            }
            const safeRedirectHostname = await isSafeProbeHostname(nextUrl.hostname);
            if (!safeRedirectHostname) {
                throw new Error("Unsafe redirect host");
            }
            currentUrl = nextUrl;
        }

        throw new Error("Probe redirect loop");
    } finally {
        clearTimeout(timeoutHandle);
    }
}

async function mapWithConcurrency<TInput, TOutput>(
    items: readonly TInput[],
    concurrency: number,
    mapper: (item: TInput) => Promise<TOutput>,
): Promise<TOutput[]> {
    if (items.length === 0) return [];
    const boundedConcurrency = Math.max(1, Math.min(concurrency, items.length));
    const results = new Array<TOutput>(items.length);
    let nextIndex = 0;
    async function worker() {
        while (true) {
            const currentIndex = nextIndex;
            nextIndex += 1;
            if (currentIndex >= items.length) return;
            results[currentIndex] = await mapper(items[currentIndex]);
        }
    }
    await Promise.all(Array.from({ length: boundedConcurrency }, () => worker()));
    return results;
}

function sanitizeError(error: string | null): string | null {
    if (!error) return null;
    return error.length > MAX_ERROR_LENGTH ? error.slice(0, MAX_ERROR_LENGTH) : error;
}

async function probeServer(row: ActiveServerRow): Promise<HealthProbe> {
    const serverUrl = row.server_url?.trim();
    if (!serverUrl) {
        return { id: row.id, name: row.name, healthStatus: "unknown", healthError: "Missing server URL" };
    }
    const parsedServerUrl = parseServerUrl(serverUrl);
    if (!parsedServerUrl) {
        return { id: row.id, name: row.name, healthStatus: "unknown", healthError: "Invalid server URL" };
    }
    const safeHostname = await isSafeProbeHostname(parsedServerUrl.hostname);
    if (!safeHostname) {
        return { id: row.id, name: row.name, healthStatus: "unknown", healthError: "Unsafe server URL host" };
    }
    let lastError: string | null = null;
    for (let attempt = 1; attempt <= MAX_PROBE_ATTEMPTS; attempt += 1) {
        try {
            const response = await fetchProbe(parsedServerUrl);
            if (response.ok) {
                return { id: row.id, name: row.name, healthStatus: classifyHttpStatus(response.status), healthError: null };
            }
            const statusHealth = classifyHttpStatus(response.status);
            const statusError = `HTTP ${response.status}`;
            if (response.status >= 500 && attempt < MAX_PROBE_ATTEMPTS) {
                lastError = statusError;
                await delay(RETRY_DELAY_MS * attempt);
                continue;
            }
            return { id: row.id, name: row.name, healthStatus: statusHealth, healthError: statusError };
        } catch (error) {
            lastError = toErrorText(error);
            if (attempt < MAX_PROBE_ATTEMPTS && isRetryableProbeError(error)) {
                await delay(RETRY_DELAY_MS * attempt);
                continue;
            }
            return { id: row.id, name: row.name, healthStatus: "unknown", healthError: lastError };
        }
    }
    return { id: row.id, name: row.name, healthStatus: "unknown", healthError: lastError || "Unknown probe error" };
}

const handlers = withCronAuth(
    async () => {
        const supabaseAdminClient = createSupabaseAdminClient();
        if (!supabaseAdminClient) {
            return NextResponse.json({
                ok: false,
                error: "Supabase admin credentials are not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
            }, { status: 500 });
        }

        const { data, error } = await supabaseAdminClient
            .from("servers")
            .select("id, name, server_url")
            .eq("status", "active");
        if (error) {
            return NextResponse.json({ ok: false, error: `Failed to query active servers: ${error.message}` }, { status: 500 });
        }

        const activeServers = (data ?? []) as ActiveServerRow[];
        if (activeServers.length === 0) {
            return NextResponse.json({
                ok: true,
                checkedAt: new Date().toISOString(),
                total: 0,
                summary: { healthy: 0, degraded: 0, down: 0, unknown: 0 },
                updateErrors: [],
            });
        }

        const probeResults = await mapWithConcurrency(activeServers, PROBE_CONCURRENCY, async (row) => probeServer(row));
        const checkedAt = new Date().toISOString();
        const summary: Record<HealthStatus, number> = { healthy: 0, degraded: 0, down: 0, unknown: 0 };
        for (const result of probeResults) {
            summary[result.healthStatus] += 1;
        }

        const updateErrors = (await mapWithConcurrency(probeResults, UPDATE_CONCURRENCY, async (result) => {
            const { error: updateError } = await supabaseAdminClient
                .from("servers")
                .update({
                    health_status: result.healthStatus,
                    health_checked_at: checkedAt,
                    health_error: sanitizeError(result.healthError),
                })
                .eq("id", result.id);
            return updateError ? `${result.name}: ${updateError.message}` : null;
        })).filter((value): value is string => value !== null);

        return NextResponse.json({
            ok: updateErrors.length === 0,
            checkedAt,
            total: probeResults.length,
            summary,
            updateErrors,
        });
    },
    ["HEALTH_CHECK_CRON_SECRET", "CRON_SECRET"],
    "health_check",
);

export const GET = handlers.GET;
export const POST = handlers.POST;
