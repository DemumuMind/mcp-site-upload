import { applyServerCatalogDefaults } from "@/lib/server-catalog-defaults";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthType, HealthStatus, McpServer, ServerStatus, VerificationLevel, } from "@/lib/types";
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
export async function getActiveServers(): Promise<McpServer[]> {
    const supabaseClient = createSupabaseServerClient();
    if (!supabaseClient) {
        return [];
    }
    try {
        const { data, error } = await supabaseClient
            .from("servers")
            .select("id, created_at, name, slug, description, server_url, category, auth_type, tags, repo_url, maintainer, status, verification_level, health_status, health_checked_at, health_error")
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .range(0, 4999);
        if (error || !data) {
            return [];
        }
        return (data as SupabaseServerRow[]).map(mapSupabaseRow);
    }
    catch {
        return [];
    }
}
export async function getPendingServers(): Promise<McpServer[]> {
    const supabaseClient = createSupabaseServerClient();
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
export async function getServerBySlug(slug: string): Promise<McpServer | null> {
    const normalizedSlug = slug.trim().toLowerCase();
    const supabaseClient = createSupabaseServerClient();
    if (!supabaseClient) {
        return null;
    }
    try {
        const { data, error } = await supabaseClient
            .from("servers")
            .select("id, created_at, name, slug, description, server_url, category, auth_type, tags, repo_url, maintainer, status, verification_level, health_status, health_checked_at, health_error")
            .eq("slug", normalizedSlug)
            .eq("status", "active")
            .limit(1)
            .maybeSingle();
        if (error || !data) {
            return null;
        }
        return mapSupabaseRow(data as SupabaseServerRow);
    }
    catch {
        return null;
    }
}
