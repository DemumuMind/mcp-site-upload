import { getCatalogEntriesFromDisk } from "@/lib/catalog/disk-content";
import { mockServers } from "@/lib/mock-servers";
import { applyServerCatalogDefaults } from "@/lib/server-catalog-defaults";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AuthType,
  HealthStatus,
  McpServer,
  ServerStatus,
  VerificationLevel,
} from "@/lib/types";

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
  maintainer: { name?: string; email?: string } | null;
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
  if (
    value === "unknown" ||
    value === "healthy" ||
    value === "degraded" ||
    value === "down"
  ) {
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

function withMockHealthFallback(mcpServer: McpServer): McpServer {
  if (mcpServer.healthStatus) {
    return mcpServer;
  }

  return {
    ...mcpServer,
    healthStatus: mcpServer.status === "active" ? "healthy" : "unknown",
    healthCheckedAt: mcpServer.status === "active" ? new Date().toISOString() : undefined,
  };
}

function mergeServersBySlug(baseServers: McpServer[], overrideServers: McpServer[]): McpServer[] {
  const serverMap = new Map<string, McpServer>();

  for (const mcpServer of baseServers) {
    serverMap.set(mcpServer.slug.toLowerCase(), mcpServer);
  }

  for (const mcpServer of overrideServers) {
    serverMap.set(mcpServer.slug.toLowerCase(), mcpServer);
  }

  return [...serverMap.values()];
}

export async function getActiveServers(): Promise<McpServer[]> {
  const supabaseClient = createSupabaseServerClient();
  const diskActiveServers = getCatalogEntriesFromDisk("active");

  if (!supabaseClient) {
    return mergeServersBySlug(
      mockServers
        .filter((mcpServer) => mcpServer.status === "active")
        .map(withMockHealthFallback),
      diskActiveServers.map(withMockHealthFallback),
    );
  }

  try {
    const { data, error } = await supabaseClient
      .from("servers")
      .select(
        "id, created_at, name, slug, description, server_url, category, auth_type, tags, repo_url, maintainer, status, verification_level, health_status, health_checked_at, health_error",
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error || !data) {
      return mergeServersBySlug(
        mockServers
          .filter((mcpServer) => mcpServer.status === "active")
          .map(withMockHealthFallback),
        diskActiveServers.map(withMockHealthFallback),
      );
    }

    return mergeServersBySlug(
      (data as SupabaseServerRow[]).map(mapSupabaseRow),
      diskActiveServers,
    );
  } catch {
    return mergeServersBySlug(
      mockServers
        .filter((mcpServer) => mcpServer.status === "active")
        .map(withMockHealthFallback),
      diskActiveServers.map(withMockHealthFallback),
    );
  }
}

export async function getPendingServers(): Promise<McpServer[]> {
  const supabaseClient = createSupabaseServerClient();
  const diskPendingServers = getCatalogEntriesFromDisk("pending");

  if (!supabaseClient) {
    return mergeServersBySlug(
      mockServers
        .filter((mcpServer) => mcpServer.status === "pending")
        .map(withMockHealthFallback),
      diskPendingServers.map(withMockHealthFallback),
    );
  }

  try {
    const { data, error } = await supabaseClient
      .from("servers")
      .select(
        "id, created_at, name, slug, description, server_url, category, auth_type, tags, repo_url, maintainer, status, verification_level, health_status, health_checked_at, health_error",
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return diskPendingServers.map(withMockHealthFallback);
    }

    return mergeServersBySlug(
      (data as SupabaseServerRow[]).map(mapSupabaseRow),
      diskPendingServers,
    );
  } catch {
    return diskPendingServers.map(withMockHealthFallback);
  }
}

export async function getServerBySlug(slug: string): Promise<McpServer | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  const supabaseClient = createSupabaseServerClient();
  const activeCatalogEntries = getCatalogEntriesFromDisk("active");

  if (!supabaseClient) {
    const fallbackServer = mergeServersBySlug(
      mockServers.filter((mcpServer) => mcpServer.status === "active"),
      activeCatalogEntries,
    ).find((mcpServer) => mcpServer.slug.toLowerCase() === normalizedSlug);

    return fallbackServer ? withMockHealthFallback(fallbackServer) : null;
  }

  try {
    const { data, error } = await supabaseClient
      .from("servers")
      .select(
        "id, created_at, name, slug, description, server_url, category, auth_type, tags, repo_url, maintainer, status, verification_level, health_status, health_checked_at, health_error",
      )
      .eq("slug", normalizedSlug)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      const diskMatch = activeCatalogEntries.find(
        (catalogEntry) => catalogEntry.slug.toLowerCase() === normalizedSlug,
      );
      return diskMatch ? withMockHealthFallback(diskMatch) : null;
    }

    const supabaseServer = mapSupabaseRow(data as SupabaseServerRow);
    const diskOverride = activeCatalogEntries.find(
      (catalogEntry) => catalogEntry.slug.toLowerCase() === normalizedSlug,
    );

    return diskOverride ?? supabaseServer;
  } catch {
    const diskMatch = activeCatalogEntries.find(
      (catalogEntry) => catalogEntry.slug.toLowerCase() === normalizedSlug,
    );
    return diskMatch ? withMockHealthFallback(diskMatch) : null;
  }
}
