import { getActiveServers } from "@/lib/servers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { HealthStatus } from "@/lib/types";
export type AdminEventLevel = "info" | "success" | "warning" | "error";
export type AdminDashboardSettings = {
    statusUpdateIntervalSec: number;
    requestLimitPerMinute: number;
    notifyEmailOnErrors: boolean;
    notifyPushNotifications: boolean;
    notifyWebhookIntegrations: boolean;
};
export type AdminDashboardDistributionItem = {
    serverSlug: string;
    serverName: string;
    requestCount: number;
    sharePercent: number;
};
export type AdminDashboardEventItem = {
    id: string;
    timeLabel: string;
    occurredAt?: string;
    level: AdminEventLevel;
    messageEn: string;
};
export type AdminDashboardAuditItem = {
    id: string;
    timeLabel: string;
    action: string;
    actorLabel: string;
    targetLabel: string;
    targetId?: string;
};
export type AdminDashboardSnapshot = {
    overview: {
        activeServers: number;
        totalRequests: number;
        averageLatencyMs: number;
        uptimePercent: number;
    };
    analytics: {
        requestDistribution: AdminDashboardDistributionItem[];
        latestEvents: AdminDashboardEventItem[];
    };
    settings: AdminDashboardSettings;
    audit: {
        recentActions: AdminDashboardAuditItem[];
    };
};
type SettingsRow = {
    status_update_interval_sec: number | null;
    request_limit_per_minute: number | null;
    notify_email_on_errors: boolean | null;
    notify_push_notifications: boolean | null;
    notify_webhook_integrations: boolean | null;
};
type MetricsRow = {
    total_requests: number | null;
    average_latency_ms: number | null;
    uptime_percent: number | null;
};
type DistributionRow = {
    server_slug: string | null;
    server_name: string | null;
    request_count: number | null;
};
type EventRow = {
    id: string;
    occurred_at: string | null;
    level: string | null;
    message_en: string | null;
    message_secondary: string | null;
};
type AuditRow = {
    id: string;
    occurred_at: string | null;
    action: string | null;
    actor_source: string | null;
    actor_role: string | null;
    actor_user_id: string | null;
    target_type: string | null;
    target_id: string | null;
};
const DEFAULT_SETTINGS: AdminDashboardSettings = {
    statusUpdateIntervalSec: 5,
    requestLimitPerMinute: 1000,
    notifyEmailOnErrors: true,
    notifyPushNotifications: false,
    notifyWebhookIntegrations: true,
};
const DEFAULT_METRICS = {
    totalRequests: 847000,
    averageLatencyMs: 45,
    uptimePercent: 99.9,
};
const DEFAULT_DISTRIBUTION_BASE: Array<{
    serverSlug: string;
    serverName: string;
    requestCount: number;
}> = [
    { serverSlug: "gateway-01", serverName: "gateway-01", requestCount: 241000 },
    { serverSlug: "gateway-02", serverName: "gateway-02", requestCount: 198000 },
    { serverSlug: "gateway-03", serverName: "gateway-03", requestCount: 153000 },
    { serverSlug: "gateway-04", serverName: "gateway-04", requestCount: 127000 },
    { serverSlug: "gateway-05", serverName: "gateway-05", requestCount: 128000 },
];
const DEFAULT_EVENTS_BASE: Array<{
    id: string;
    timeLabel: string;
    level: AdminEventLevel;
    messageEn: string;
}> = [
    {
        id: "default-1",
        timeLabel: "12:14",
        level: "success",
        messageEn: "gateway-02 latency returned to baseline",
    },
    {
        id: "default-2",
        timeLabel: "11:58",
        level: "warning",
        messageEn: "Webhook delivery retried for 4 endpoints",
    },
    {
        id: "default-3",
        timeLabel: "11:42",
        level: "error",
        messageEn: "Rate limit reached on gateway-04",
    },
    {
        id: "default-4",
        timeLabel: "11:27",
        level: "success",
        messageEn: "Health check passed for all active servers",
    },
];
function toFiniteNonNegativeInt(value: number | null | undefined, fallbackValue: number): number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return fallbackValue;
    }
    return Math.max(0, Math.round(value));
}
function toPercent(value: number | null | undefined, fallbackValue: number): number {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return fallbackValue;
    }
    const normalized = Math.max(0, Math.min(100, value));
    return Math.round(normalized * 10) / 10;
}
function toEventLevel(value: string | null): AdminEventLevel {
    if (value === "success" || value === "warning" || value === "error" || value === "info") {
        return value;
    }
    return "info";
}
function getSharePercent(requestCount: number, totalRequestCount: number): number {
    if (totalRequestCount <= 0) {
        return 0;
    }
    return Math.round((requestCount / totalRequestCount) * 100);
}
function toTimeLabel(occurredAt: string | null | undefined): string {
    if (!occurredAt) {
        return "--:--";
    }
    const dateValue = new Date(occurredAt);
    if (Number.isNaN(dateValue.getTime())) {
        return "--:--";
    }
    return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(dateValue);
}
function toHealthEventLevel(healthStatus: HealthStatus | undefined): AdminEventLevel {
    if (healthStatus === "healthy") {
        return "success";
    }
    if (healthStatus === "degraded") {
        return "warning";
    }
    if (healthStatus === "down") {
        return "error";
    }
    return "info";
}
function toAuditActorLabel(row: AuditRow): string {
    if (row.actor_user_id) {
        const prefix = row.actor_role || "admin";
        return `${prefix}:${row.actor_user_id.slice(0, 8)}`;
    }
    if (row.actor_source === "fallback_token") {
        return "fallback-token";
    }
    if (row.actor_source === "system") {
        return "system";
    }
    return row.actor_source || "unknown";
}
function toAuditTargetLabel(row: AuditRow): string {
    const targetType = row.target_type || "target";
    const targetId = row.target_id?.trim();
    if (!targetId) {
        return targetType;
    }
    return `${targetType}:${targetId}`;
}
export async function getAdminDashboardSnapshot(): Promise<AdminDashboardSnapshot> {
    const activeServers = await getActiveServers();
    const activeServerCount = activeServers.length;
    const adminClient = createSupabaseAdminClient();
    let settings = DEFAULT_SETTINGS;
    let totalRequests = DEFAULT_METRICS.totalRequests;
    let averageLatencyMs = DEFAULT_METRICS.averageLatencyMs;
    let uptimePercent = DEFAULT_METRICS.uptimePercent;
    let requestDistribution: AdminDashboardDistributionItem[] = [];
    let latestEvents: AdminDashboardEventItem[] = [];
    let recentActions: AdminDashboardAuditItem[] = [];
    if (adminClient) {
        const [settingsResult, metricsResult, distributionResult, eventsResult, auditResult] = await Promise.all([
            adminClient
                .from("admin_dashboard_settings")
                .select("status_update_interval_sec, request_limit_per_minute, notify_email_on_errors, notify_push_notifications, notify_webhook_integrations")
                .eq("id", 1)
                .maybeSingle<SettingsRow>(),
            adminClient
                .from("admin_dashboard_metrics")
                .select("total_requests, average_latency_ms, uptime_percent")
                .eq("id", 1)
                .maybeSingle<MetricsRow>(),
            adminClient
                .from("admin_server_request_distribution")
                .select("server_slug, server_name, request_count")
                .order("request_count", { ascending: false })
                .limit(5)
                .returns<DistributionRow[]>(),
            adminClient
                .from("admin_system_events")
                .select("id, occurred_at, level, message_en, message_secondary")
                .order("occurred_at", { ascending: false })
                .limit(25)
                .returns<EventRow[]>(),
            adminClient
                .from("admin_audit_log")
                .select("id, occurred_at, action, actor_source, actor_role, actor_user_id, target_type, target_id")
                .order("occurred_at", { ascending: false })
                .limit(50)
                .returns<AuditRow[]>(),
        ]);
        if (!settingsResult.error && settingsResult.data) {
            settings = {
                statusUpdateIntervalSec: toFiniteNonNegativeInt(settingsResult.data.status_update_interval_sec, DEFAULT_SETTINGS.statusUpdateIntervalSec),
                requestLimitPerMinute: toFiniteNonNegativeInt(settingsResult.data.request_limit_per_minute, DEFAULT_SETTINGS.requestLimitPerMinute),
                notifyEmailOnErrors: typeof settingsResult.data.notify_email_on_errors === "boolean"
                    ? settingsResult.data.notify_email_on_errors
                    : DEFAULT_SETTINGS.notifyEmailOnErrors,
                notifyPushNotifications: typeof settingsResult.data.notify_push_notifications === "boolean"
                    ? settingsResult.data.notify_push_notifications
                    : DEFAULT_SETTINGS.notifyPushNotifications,
                notifyWebhookIntegrations: typeof settingsResult.data.notify_webhook_integrations === "boolean"
                    ? settingsResult.data.notify_webhook_integrations
                    : DEFAULT_SETTINGS.notifyWebhookIntegrations,
            };
        }
        if (!metricsResult.error && metricsResult.data) {
            totalRequests = toFiniteNonNegativeInt(metricsResult.data.total_requests, DEFAULT_METRICS.totalRequests);
            averageLatencyMs = toFiniteNonNegativeInt(metricsResult.data.average_latency_ms, DEFAULT_METRICS.averageLatencyMs);
            uptimePercent = toPercent(metricsResult.data.uptime_percent, DEFAULT_METRICS.uptimePercent);
        }
        if (!distributionResult.error && distributionResult.data && distributionResult.data.length > 0) {
            const parsedDistribution = distributionResult.data
                .map((row, index) => ({
                serverSlug: row.server_slug?.trim() || `server-${index + 1}`,
                serverName: row.server_name?.trim() || row.server_slug?.trim() || `Server ${index + 1}`,
                requestCount: toFiniteNonNegativeInt(row.request_count, 0),
            }))
                .filter((row) => row.requestCount > 0);
            const totalDistributionRequests = parsedDistribution.reduce((accumulator, row) => accumulator + row.requestCount, 0);
            if (parsedDistribution.length > 0 && totalDistributionRequests > 0) {
                requestDistribution = parsedDistribution.map((row) => ({
                    ...row,
                    sharePercent: getSharePercent(row.requestCount, totalDistributionRequests),
                }));
                if (totalRequests <= 0) {
                    totalRequests = totalDistributionRequests;
                }
            }
        }
        if (!eventsResult.error && eventsResult.data && eventsResult.data.length > 0) {
            latestEvents = eventsResult.data.map((row, index) => ({
                id: row.id || `event-${index + 1}`,
                timeLabel: toTimeLabel(row.occurred_at),
                occurredAt: row.occurred_at ?? undefined,
                level: toEventLevel(row.level),
                messageEn: row.message_en?.trim() || row.message_secondary?.trim() || "Operational event",
            }));
        }
        if (!auditResult.error && auditResult.data && auditResult.data.length > 0) {
            recentActions = auditResult.data.map((row, index) => ({
                id: row.id || `audit-${index + 1}`,
                timeLabel: toTimeLabel(row.occurred_at),
                action: row.action?.trim() || "unknown_action",
                actorLabel: toAuditActorLabel(row),
                targetLabel: toAuditTargetLabel(row),
                targetId: row.target_id ?? undefined,
            }));
        }
    }
    if (requestDistribution.length === 0) {
        const fallbackTotal = DEFAULT_DISTRIBUTION_BASE.reduce((accumulator, row) => accumulator + row.requestCount, 0);
        requestDistribution = DEFAULT_DISTRIBUTION_BASE.map((row) => ({
            ...row,
            sharePercent: getSharePercent(row.requestCount, fallbackTotal),
        }));
    }
    if (latestEvents.length === 0) {
        const generatedEvents = activeServers
            .filter((mcpServer) => mcpServer.healthCheckedAt)
            .sort((left, right) => {
            const leftTime = left.healthCheckedAt ? new Date(left.healthCheckedAt).getTime() : 0;
            const rightTime = right.healthCheckedAt ? new Date(right.healthCheckedAt).getTime() : 0;
            return rightTime - leftTime;
        })
            .slice(0, 4)
            .map((mcpServer, index) => ({
            id: `health-${mcpServer.id}-${index}`,
            timeLabel: toTimeLabel(mcpServer.healthCheckedAt),
            occurredAt: mcpServer.healthCheckedAt,
            level: toHealthEventLevel(mcpServer.healthStatus),
            messageEn: `${mcpServer.slug}: status ${mcpServer.healthStatus ?? "unknown"}`,
        }));
        latestEvents = generatedEvents.length > 0 ? generatedEvents : DEFAULT_EVENTS_BASE;
    }
    return {
        overview: {
            activeServers: activeServerCount,
            totalRequests,
            averageLatencyMs,
            uptimePercent,
        },
        analytics: {
            requestDistribution,
            latestEvents,
        },
        settings,
        audit: {
            recentActions,
        },
    };
}
