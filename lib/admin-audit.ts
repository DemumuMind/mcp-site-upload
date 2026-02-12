import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminActorContext } from "@/lib/admin-auth";
export type AdminAuditAction = "moderate_server" | "save_dashboard_settings" | "save_dashboard_metrics" | "create_dashboard_event" | "delete_dashboard_event" | "blog_run_start" | "blog_run_success" | "blog_run_failed" | "admin_login" | "admin_logout";
export type AdminAuditTargetType = "server" | "dashboard_settings" | "dashboard_metrics" | "dashboard_event" | "blog_run" | "session";
export type AdminAuditLogEntry = {
    actor: AdminActorContext;
    action: AdminAuditAction | (string & {});
    targetType: AdminAuditTargetType | (string & {});
    targetId?: string;
    details?: Record<string, unknown>;
    occurredAt?: string;
};
function toSafeDetails(details: Record<string, unknown> | undefined): Record<string, unknown> {
    if (!details) {
        return {};
    }
    try {
        return JSON.parse(JSON.stringify(details)) as Record<string, unknown>;
    }
    catch {
        return {};
    }
}
export async function writeAdminAuditLog(adminClient: SupabaseClient, entry: AdminAuditLogEntry): Promise<void> {
    const { error } = await adminClient.from("admin_audit_log").insert({
        occurred_at: entry.occurredAt ?? new Date().toISOString(),
        actor_user_id: entry.actor.userId ?? null,
        actor_role: entry.actor.role ?? null,
        actor_source: entry.actor.source,
        action: entry.action,
        target_type: entry.targetType,
        target_id: entry.targetId ?? null,
        details: toSafeDetails(entry.details),
    });
    if (error) {
        throw new Error(`Failed to write admin audit log: ${error.message}`);
    }
}
