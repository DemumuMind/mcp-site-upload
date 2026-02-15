import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { runCatalogRegistrySync } from "@/lib/catalog/registry-sync";
import { CATALOG_SERVERS_CACHE_TAG } from "@/lib/catalog/snapshot";
export const dynamic = "force-dynamic";
const DEFAULT_PAGE_LIMIT = 100;
const DEFAULT_MAX_PAGES = 120;
const DEFAULT_STALE_CLEANUP_ENABLED = true;
const DEFAULT_QUALITY_FILTER_ENABLED = true;
type NumberEnvOptions = {
    min: number;
    max: number;
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
    const qualityFilter = parseBoolean(request.nextUrl.searchParams.get("qualityFilter"), envQualityFilter);
    const allowlistPatterns = mergePatternLists(envAllowlistPatterns, parsePatternList(request.nextUrl.searchParams.get("allowlist")));
    const denylistPatterns = mergePatternLists(envDenylistPatterns, parsePatternList(request.nextUrl.searchParams.get("denylist")));
    const registryUrl = process.env.CATALOG_AUTOSYNC_REGISTRY_URL?.trim();
    const result = await runCatalogRegistrySync({
        registryUrl,
        pageLimit,
        maxPages,
        cleanupStale,
        qualityFilter,
        allowlistPatterns,
        denylistPatterns,
    });
    revalidatePath("/");
    revalidatePath("/catalog");
    revalidatePath("/categories");
    revalidatePath("/sitemap.xml");
    for (const slug of result.changedSlugs.slice(0, 400)) {
        revalidatePath(`/server/${slug}`);
    }
    revalidateTag(CATALOG_SERVERS_CACHE_TAG, "max");
    return NextResponse.json({
        ok: result.failed === 0,
        ...result,
        settings: {
            pageLimit,
            maxPages,
            cleanupStale,
            qualityFilter,
            allowlistPatternCount: allowlistPatterns.length,
            denylistPatternCount: denylistPatterns.length,
        },
    }, { status: result.failed === 0 ? 200 : 207 });
}
export async function GET(request: NextRequest) {
    return runCatalogAutoSync(request);
}
export async function POST(request: NextRequest) {
    return runCatalogAutoSync(request);
}
