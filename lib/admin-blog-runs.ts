import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
export type AdminBlogRunStatus = "started" | "success" | "failed";
export type AdminBlogRunRecord = {
    id: string;
    createdAt: string;
    updatedAt: string;
    actorUserId?: string;
    actorRole?: string;
    actorSource: string;
    status: AdminBlogRunStatus;
    topic: string;
    slug?: string;
    researchPacketId?: string;
    sourceCount?: number;
    errorMessage?: string;
};
type AdminBlogRunRow = {
    id: string;
    created_at: string;
    updated_at: string;
    actor_user_id: string | null;
    actor_role: string | null;
    actor_source: string | null;
    status: string;
    topic: string;
    slug: string | null;
    research_packet_id: string | null;
    source_count: number | null;
    error_message: string | null;
};
type CreateAdminBlogRunInput = {
    actorUserId?: string;
    actorRole?: string;
    actorSource: string;
    topic: string;
    slug?: string;
    status?: AdminBlogRunStatus;
};
type UpdateAdminBlogRunInput = {
    status?: AdminBlogRunStatus;
    slug?: string;
    researchPacketId?: string;
    sourceCount?: number;
    errorMessage?: string;
};
function toRunStatus(value: string): AdminBlogRunStatus {
    if (value === "success" || value === "failed" || value === "started") {
        return value;
    }
    return "started";
}
function mapRow(row: AdminBlogRunRow): AdminBlogRunRecord {
    return {
        id: row.id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        actorUserId: row.actor_user_id ?? undefined,
        actorRole: row.actor_role ?? undefined,
        actorSource: row.actor_source ?? "system",
        status: toRunStatus(row.status),
        topic: row.topic,
        slug: row.slug ?? undefined,
        researchPacketId: row.research_packet_id ?? undefined,
        sourceCount: typeof row.source_count === "number" ? row.source_count : undefined,
        errorMessage: row.error_message ?? undefined,
    };
}
export async function createAdminBlogRun(adminClient: SupabaseClient, input: CreateAdminBlogRunInput): Promise<string> {
    const { data, error } = await adminClient
        .from("admin_blog_runs")
        .insert({
        actor_user_id: input.actorUserId ?? null,
        actor_role: input.actorRole ?? null,
        actor_source: input.actorSource,
        status: input.status ?? "started",
        topic: input.topic,
        slug: input.slug ?? null,
    })
        .select("id")
        .limit(1)
        .single<{
        id: string;
    }>();
    if (error || !data) {
        throw new Error(`Failed to create admin blog run: ${error?.message ?? "Unknown error"}`);
    }
    return data.id;
}
export async function updateAdminBlogRun(adminClient: SupabaseClient, runId: string, input: UpdateAdminBlogRunInput): Promise<void> {
    const payload: Record<string, unknown> = {};
    if (input.status) {
        payload.status = input.status;
    }
    if (input.slug !== undefined) {
        payload.slug = input.slug || null;
    }
    if (input.researchPacketId !== undefined) {
        payload.research_packet_id = input.researchPacketId || null;
    }
    if (input.sourceCount !== undefined) {
        payload.source_count = input.sourceCount;
    }
    if (input.errorMessage !== undefined) {
        payload.error_message = input.errorMessage || null;
    }
    if (Object.keys(payload).length === 0) {
        return;
    }
    const { error } = await adminClient
        .from("admin_blog_runs")
        .update(payload)
        .eq("id", runId)
        .limit(1);
    if (error) {
        throw new Error(`Failed to update admin blog run ${runId}: ${error.message}`);
    }
}
export async function getRecentAdminBlogRuns(params?: {
    limit?: number;
    status?: AdminBlogRunStatus;
}): Promise<AdminBlogRunRecord[]> {
    const adminClient = createSupabaseAdminClient();
    if (!adminClient) {
        return [];
    }
    const limit = Math.max(1, Math.min(params?.limit ?? 20, 100));
    let query = adminClient
        .from("admin_blog_runs")
        .select("id, created_at, updated_at, actor_user_id, actor_role, actor_source, status, topic, slug, research_packet_id, source_count, error_message")
        .order("created_at", { ascending: false })
        .limit(limit);
    if (params?.status) {
        query = query.eq("status", params.status);
    }
    const { data, error } = await query.returns<AdminBlogRunRow[]>();
    if (error || !data) {
        return [];
    }
    return data.map(mapRow);
}
