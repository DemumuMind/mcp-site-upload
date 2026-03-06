import { unstable_cache } from "next/cache";
import { applyServerCatalogDefaults } from "@/lib/server-catalog-defaults";
import { CACHE_TAGS, getServerDataRevalidateSeconds } from "@/lib/cache/policy";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthType, HealthStatus, McpServer, ServerStatus, VerificationLevel, } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type SupabaseServerRow = {
    id: string;
    created_at: string | null;
    name: string;
    slug: string;
    description: string | null;
    server_url: string | null;
    category: string | null;
    auth_type: string | null;
    tags: string[] | null;
    repo_url: string | null;
    maintainer: {
        name?: string;
        email?: string;
    } | null;
    status: string | null;
    verification_level: string | null;
    health_status: string | null;
    health_checked_at: string | null;
    health_error: string | null;
};

const localFallbackServers: McpServer[] = [
    applyServerCatalogDefaults({
        id: "local-fallback-github",
        createdAt: "2026-03-06T00:00:00.000Z",
        name: "GitHub MCP",
        slug: "github",
        description: "Repository and workflow operations for engineering teams validating MCP integrations locally.",
        serverUrl: "https://github.com/modelcontextprotocol/servers",
        category: "Developer Tools",
        authType: "oauth",
        tags: ["local-fallback", "github", "developer-tools", "catalog-preview"],
        repoUrl: "https://github.com/modelcontextprotocol/servers",
        maintainer: {
            name: "DemumuMind Preview",
        },
        status: "active",
        verificationLevel: "official",
        healthStatus: "healthy",
        healthCheckedAt: "2026-03-06T00:00:00.000Z",
        tools: [],
    }),
    applyServerCatalogDefaults({
        id: "local-fallback-postgres",
        createdAt: "2026-03-05T00:00:00.000Z",
        name: "Postgres MCP",
        slug: "postgres",
        description: "SQL-first data exploration and schema inspection for teams testing integrations without production data.",
        serverUrl: "https://www.postgresql.org/docs/",
        category: "Databases",
        authType: "api_key",
        tags: ["local-fallback", "postgres", "data", "catalog-preview"],
        repoUrl: "https://www.postgresql.org/docs/",
        maintainer: {
            name: "DemumuMind Preview",
        },
        status: "active",
        verificationLevel: "partner",
        healthStatus: "healthy",
        healthCheckedAt: "2026-03-06T00:00:00.000Z",
        tools: [],
    }),
    applyServerCatalogDefaults({
        id: "local-fallback-playwright",
        createdAt: "2026-03-04T00:00:00.000Z",
        name: "Playwright MCP",
        slug: "playwright",
        description: "Browser automation and UI verification surface for local QA, smoke checks, and release rehearsal.",
        serverUrl: "https://playwright.dev/",
        category: "Developer Tools",
        authType: "none",
        tags: ["local-fallback", "playwright", "testing", "catalog-preview"],
        repoUrl: "https://playwright.dev/",
        maintainer: {
            name: "DemumuMind Preview",
        },
        status: "active",
        verificationLevel: "community",
        healthStatus: "healthy",
        healthCheckedAt: "2026-03-06T00:00:00.000Z",
        tools: [],
    }),
];

function shouldUseLocalCatalogFallback(): boolean {
    return process.env.NODE_ENV !== "production";
}

export function getLocalFallbackServers(): McpServer[] {
    return localFallbackServers;
}

function getCatalogReadClient(): SupabaseClient | null {
    return createSupabaseAdminClient() ?? createSupabaseServerClient();
}
function toAuthType(value: string | null): AuthType {
    if (value === "oauth" || value === "api_key" || value === "none") {
        return value;
    }
    return "none";
}
function toStatus(value: string | null): ServerStatus {
    if (value === "pending" || value === "active" || value === "rejected") {
        return value;
    }
    return "active";
}
function toVerificationLevel(value: string | null): VerificationLevel {
    if (value === "community" || value === "partner" || value === "official") {
        return value;
    }
    return "community";
}
function toHealthStatus(value: string | null): HealthStatus {
    if (value === "unknown" ||
        value === "healthy" ||
        value === "degraded" ||
        value === "down") {
        return value;
    }
    return "unknown";
}
function mapSupabaseRow(row: SupabaseServerRow): McpServer {
    return applyServerCatalogDefaults({
        id: row.id,
        createdAt: row.created_at ?? undefined,
        name: row.name,
        slug: row.slug || row.name.toLowerCase().replace(/\s+/g, "-"),
        description: row.description ?? "No description provided.",
        serverUrl: row.server_url ?? "",
        category: row.category ?? "Other",
        authType: toAuthType(row.auth_type),
        tags: row.tags ?? [],
        repoUrl: row.repo_url ?? undefined,
        maintainer: row.maintainer
            ? {
                name: row.maintainer.name ?? "Unknown",
                email: row.maintainer.email,
            }
            : undefined,
        status: toStatus(row.status),
        verificationLevel: toVerificationLevel(row.verification_level),
        healthStatus: toHealthStatus(row.health_status),
        healthCheckedAt: row.health_checked_at ?? undefined,
        healthError: row.health_error ?? undefined,
        tools: [],
    });
}

type ServerQueryOptions = {
    bypassCache?: boolean;
};

async function readActiveServersFromSource(): Promise<McpServer[]> {
    const supabaseClient = getCatalogReadClient();
    if (!supabaseClient) {
        return shouldUseLocalCatalogFallback() ? localFallbackServers : [];
    }
    try {
        const { data, error } = await supabaseClient
            .from("servers")
            .select("id, created_at, name, slug, description, server_url, category, auth_type, tags, repo_url, maintainer, status, verification_level, health_status, health_checked_at, health_error")
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .range(0, 4999);
        if (error || !data) {
            return shouldUseLocalCatalogFallback() ? localFallbackServers : [];
        }
        const servers = (data as SupabaseServerRow[]).map(mapSupabaseRow);
        if (servers.length === 0 && shouldUseLocalCatalogFallback()) {
            return localFallbackServers;
        }
        return servers;
    }
    catch {
        return shouldUseLocalCatalogFallback() ? localFallbackServers : [];
    }
}
async function readPendingServersFromSource(): Promise<McpServer[]> {
    const supabaseClient = getCatalogReadClient();
    if (!supabaseClient) {
        return [];
    }
    try {
        const { data, error } = await supabaseClient
            .from("servers")
            .select("id, created_at, name, slug, description, server_url, category, auth_type, tags, repo_url, maintainer, status, verification_level, health_status, health_checked_at, health_error")
            .eq("status", "pending")
            .order("created_at", { ascending: false });
        if (error || !data || data.length === 0) {
            return [];
        }
        return (data as SupabaseServerRow[]).map(mapSupabaseRow);
    }
    catch {
        return [];
    }
}
const getCachedActiveServers = unstable_cache(async () => readActiveServersFromSource(), ["servers-active"], {
    revalidate: getServerDataRevalidateSeconds("catalogActiveServers"),
    tags: [CACHE_TAGS.catalogServers],
});

const getCachedPendingServers = unstable_cache(async () => readPendingServersFromSource(), ["servers-pending"], {
    revalidate: getServerDataRevalidateSeconds("adminDashboard"),
    tags: [CACHE_TAGS.adminDashboard],
});

export async function getActiveServers(options: ServerQueryOptions = {}): Promise<McpServer[]> {
    return options.bypassCache ? readActiveServersFromSource() : getCachedActiveServers();
}

export async function getPendingServers(options: ServerQueryOptions = {}): Promise<McpServer[]> {
    return options.bypassCache ? readPendingServersFromSource() : getCachedPendingServers();
}

export async function getServerBySlug(slug: string, options: ServerQueryOptions = {}): Promise<McpServer | null> {
    const normalizedSlug = slug.trim().toLowerCase();
    if (!normalizedSlug) {
        return null;
    }

    const activeServers = await getActiveServers(options);
    return activeServers.find((server) => server.slug.trim().toLowerCase() === normalizedSlug) ?? null;
}
