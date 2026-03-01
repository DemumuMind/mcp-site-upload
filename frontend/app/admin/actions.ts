"use server";
import { cookies } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAccess, resolveAdminAccess } from "@/lib/admin-access";
import { ADMIN_SESSION_COOKIE, getAdminAccessToken, getAdminTokenActorLabel, isTokenAdminAuthEnabled, isValidAdminToken, type AdminActorContext, } from "@/lib/admin-auth";
import { writeAdminAuditLog } from "@/lib/admin-audit";
import { createAdminBlogRun, updateAdminBlogRun, type AdminBlogRunStatus, } from "@/lib/admin-blog-runs";
import { parseTagList } from "@/lib/blog/automation";
import { createBlogV2Draft, publishBlogV2Draft } from "@/lib/blog-v2/pipeline/draft";
import { BLOG_POSTS_CACHE_TAG } from "@/lib/blog/service";
import { normalizeInternalPath } from "@/lib/auth-redirects";
import { CATALOG_SERVERS_CACHE_TAG } from "@/lib/catalog/snapshot";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth-server";
import type { ServerStatus } from "@/lib/types";
const moderationStatuses: ServerStatus[] = ["active", "rejected"];
const eventLevels = ["info", "success", "warning", "error"] as const;
type AdminEventLevel = (typeof eventLevels)[number];
function parseBoundedInt(value: FormDataEntryValue | null, fallback: number, min: number, max: number) {
    const parsed = Number.parseInt(String(value ?? ""), 10);
    if (!Number.isFinite(parsed)) {
        return fallback;
    }
    return Math.max(min, Math.min(max, parsed));
}
function parseBoundedFloat(value: FormDataEntryValue | null, fallback: number, min: number, max: number): number {
    const parsed = Number.parseFloat(String(value ?? ""));
    if (!Number.isFinite(parsed)) {
        return fallback;
    }
    return Math.max(min, Math.min(max, parsed));
}
function toCheckedBoolean(value: FormDataEntryValue | null): boolean {
    return value === "on";
}
function getErrorMessage(error: unknown) {
    if (error instanceof Error) {
        return error.message;
    }
    return "Unexpected error";
}
function isEventLevel(value: string): value is AdminEventLevel {
    return eventLevels.includes(value as AdminEventLevel);
}
async function writeAuditBestEffort(actor: AdminActorContext, input: {
    action: string;
    targetType: string;
    targetId?: string;
    details?: Record<string, unknown>;
}) {
    const adminClient = createSupabaseAdminClient();
    if (!adminClient) {
        return;
    }
    try {
        await writeAdminAuditLog(adminClient, {
            actor,
            action: input.action,
            targetType: input.targetType,
            targetId: input.targetId,
            details: input.details,
        });
    }
    catch (error) {
        console.error("[admin-audit] failed to persist audit record:", getErrorMessage(error));
    }
}
function redirectWithAdminError(pathname: string, errorCode: string): never {
    const safePath = normalizeInternalPath(pathname);
    redirect(`${safePath}?error=${encodeURIComponent(errorCode)}`);
}
function getAdminReturnPath(formData: FormData, fallbackPath: string): string {
    const returnToRaw = String(formData.get("returnTo") || "").trim();
    if (!returnToRaw) {
        return fallbackPath;
    }
    return normalizeInternalPath(returnToRaw);
}
function withQueryParam(pathname: string, key: string, value: string): string {
    const [pathOnly, hashPart = ""] = pathname.split("#");
    const [basePath, queryPart = ""] = pathOnly.split("?");
    const searchParams = new URLSearchParams(queryPart);
    searchParams.set(key, value);
    const queryString = searchParams.toString();
    const nextPath = `${basePath}${queryString ? `?${queryString}` : ""}`;
    return hashPart ? `${nextPath}#${hashPart}` : nextPath;
}
function requireAdminClientOrRedirect(pathname: string) {
    const adminClient = createSupabaseAdminClient();
    if (!adminClient) {
        redirectWithAdminError(pathname, "supabase");
    }
    return adminClient;
}
export async function loginAdminAction(formData: FormData) {
    const redirectPath = normalizeInternalPath(String(formData.get("redirect") || "/admin"));
    if (!isTokenAdminAuthEnabled()) {
        redirect("/admin/login?error=disabled");
    }
    const expectedToken = getAdminAccessToken();
    const submittedToken = String(formData.get("token") || "");
    if (!expectedToken) {
        redirect("/admin/login?error=config");
    }
    if (!isValidAdminToken(submittedToken)) {
        redirect("/admin/login?error=invalid");
    }
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, expectedToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 12,
    });
    await writeAuditBestEffort({
        source: "fallback_token",
        role: "super_admin",
        label: getAdminTokenActorLabel(),
    }, {
        action: "admin_login",
        targetType: "session",
        details: {
            mode: "fallback_token",
        },
    });
    redirect(redirectPath.startsWith("/admin") ? redirectPath : "/admin");
}
export async function logoutAdminAction() {
    const actor = (await resolveAdminAccess()).actor ?? {
        source: "system",
    };
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_SESSION_COOKIE);
    const supabaseClient = await createSupabaseServerAuthClient();
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
    }
    await writeAuditBestEffort(actor, {
        action: "admin_logout",
        targetType: "session",
    });
    redirect("/admin/login");
}
export async function moderateServerStatusAction(formData: FormData) {
    const actor = await requireAdminAccess("/admin");
    const serverId = String(formData.get("serverId") || "");
    const nextStatus = String(formData.get("status") || "") as ServerStatus;
    const returnPath = getAdminReturnPath(formData, "/admin");
    if (!serverId || !moderationStatuses.includes(nextStatus)) {
        redirectWithAdminError("/admin", "invalid");
    }
    const adminClient = requireAdminClientOrRedirect("/admin");
    const { error } = await adminClient
        .from("servers")
        .update({ status: nextStatus })
        .eq("id", serverId)
        .limit(1);
    if (error) {
        redirectWithAdminError("/admin", error.message);
    }
    await writeAuditBestEffort(actor, {
        action: "moderate_server",
        targetType: "server",
        targetId: serverId,
        details: {
            nextStatus,
        },
    });
    revalidatePath("/");
    revalidatePath("/catalog");
    revalidatePath("/categories");
    revalidatePath("/how-to-use");
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin");
    updateTag(CATALOG_SERVERS_CACHE_TAG);
    redirect(withQueryParam(returnPath, "success", nextStatus));
}
export async function saveAdminDashboardSettingsAction(formData: FormData) {
    const actor = await requireAdminAccess("/admin");
    const returnPath = getAdminReturnPath(formData, "/admin");
    const statusUpdateIntervalSec = parseBoundedInt(formData.get("statusUpdateIntervalSec"), 5, 1, 300);
    const requestLimitPerMinute = parseBoundedInt(formData.get("requestLimitPerMinute"), 1000, 1, 100000);
    const notifyEmailOnErrors = toCheckedBoolean(formData.get("notifyEmailOnErrors"));
    const notifyPushNotifications = toCheckedBoolean(formData.get("notifyPushNotifications"));
    const notifyWebhookIntegrations = toCheckedBoolean(formData.get("notifyWebhookIntegrations"));
    const adminClient = requireAdminClientOrRedirect("/admin");
    const { error } = await adminClient.from("admin_dashboard_settings").upsert({
        id: 1,
        status_update_interval_sec: statusUpdateIntervalSec,
        request_limit_per_minute: requestLimitPerMinute,
        notify_email_on_errors: notifyEmailOnErrors,
        notify_push_notifications: notifyPushNotifications,
        notify_webhook_integrations: notifyWebhookIntegrations,
    }, { onConflict: "id" });
    if (error) {
        redirectWithAdminError("/admin", error.message);
    }
    await adminClient.from("admin_system_events").insert({
        level: "info",
        message_en: "Admin dashboard settings updated",
        message_secondary: "Admin dashboard settings updated",
    });
    await writeAuditBestEffort(actor, {
        action: "save_dashboard_settings",
        targetType: "dashboard_settings",
        targetId: "1",
        details: {
            statusUpdateIntervalSec,
            requestLimitPerMinute,
            notifyEmailOnErrors,
            notifyPushNotifications,
            notifyWebhookIntegrations,
        },
    });
    revalidatePath("/admin");
    redirect(withQueryParam(returnPath, "success", "settings"));
}
export async function saveAdminDashboardMetricsAction(formData: FormData) {
    const actor = await requireAdminAccess("/admin");
    const returnPath = getAdminReturnPath(formData, "/admin");
    const totalRequests = parseBoundedInt(formData.get("totalRequests"), 0, 0, 10000000000);
    const averageLatencyMs = parseBoundedInt(formData.get("averageLatencyMs"), 0, 0, 600000);
    const uptimePercent = parseBoundedFloat(formData.get("uptimePercent"), 99.9, 0, 100);
    const adminClient = requireAdminClientOrRedirect("/admin");
    const { error } = await adminClient.from("admin_dashboard_metrics").upsert({
        id: 1,
        total_requests: totalRequests,
        average_latency_ms: averageLatencyMs,
        uptime_percent: uptimePercent,
    }, { onConflict: "id" });
    if (error) {
        redirectWithAdminError("/admin", error.message);
    }
    await adminClient.from("admin_system_events").insert({
        level: "info",
        message_en: "Admin dashboard metrics updated",
        message_secondary: "Admin dashboard metrics updated",
    });
    await writeAuditBestEffort(actor, {
        action: "save_dashboard_metrics",
        targetType: "dashboard_metrics",
        targetId: "1",
        details: {
            totalRequests,
            averageLatencyMs,
            uptimePercent,
        },
    });
    revalidatePath("/admin");
    redirect(withQueryParam(returnPath, "success", "metrics"));
}
export async function createAdminSystemEventAction(formData: FormData) {
    const actor = await requireAdminAccess("/admin");
    const returnPath = getAdminReturnPath(formData, "/admin");
    const levelInput = String(formData.get("level") || "").trim().toLowerCase();
    const messageEn = String(formData.get("messageEn") || "").trim();
    const occurredAtRaw = String(formData.get("occurredAt") || "").trim();
    if (!isEventLevel(levelInput) || !messageEn) {
        redirectWithAdminError("/admin", "invalid_event");
    }
    const occurredAtDate = occurredAtRaw ? new Date(occurredAtRaw) : new Date();
    const occurredAt = Number.isNaN(occurredAtDate.getTime())
        ? new Date().toISOString()
        : occurredAtDate.toISOString();
    const adminClient = requireAdminClientOrRedirect("/admin");
    const { data, error } = await adminClient
        .from("admin_system_events")
        .insert({
        level: levelInput,
        occurred_at: occurredAt,
        message_en: messageEn,
        message_secondary: messageEn,
    })
        .select("id")
        .limit(1)
        .single<{
        id: string;
    }>();
    if (error) {
        redirectWithAdminError("/admin", error.message);
    }
    await writeAuditBestEffort(actor, {
        action: "create_dashboard_event",
        targetType: "dashboard_event",
        targetId: data?.id,
        details: {
            level: levelInput,
            occurredAt,
        },
    });
    revalidatePath("/admin");
    redirect(withQueryParam(returnPath, "success", "event_created"));
}
export async function deleteAdminSystemEventAction(formData: FormData) {
    const actor = await requireAdminAccess("/admin");
    const returnPath = getAdminReturnPath(formData, "/admin");
    const eventId = String(formData.get("eventId") || "").trim();
    if (!eventId) {
        redirectWithAdminError("/admin", "invalid_event");
    }
    const adminClient = requireAdminClientOrRedirect("/admin");
    const { error } = await adminClient.from("admin_system_events").delete().eq("id", eventId).limit(1);
    if (error) {
        redirectWithAdminError("/admin", error.message);
    }
    await writeAuditBestEffort(actor, {
        action: "delete_dashboard_event",
        targetType: "dashboard_event",
        targetId: eventId,
    });
    revalidatePath("/admin");
    redirect(withQueryParam(returnPath, "success", "event_deleted"));
}
async function finalizeBlogRunStatus(params: {
    runId: string | null;
    status: AdminBlogRunStatus;
    slug?: string;
    researchPacketId?: string;
    sourceCount?: number;
    errorMessage?: string;
}) {
    const adminClient = createSupabaseAdminClient();
    if (!adminClient || !params.runId) {
        return;
    }
    try {
        await updateAdminBlogRun(adminClient, params.runId, {
            status: params.status,
            slug: params.slug,
            researchPacketId: params.researchPacketId,
            sourceCount: params.sourceCount,
            errorMessage: params.errorMessage,
        });
    }
    catch (error) {
        console.error("[admin-blog-runs] failed to update run status:", getErrorMessage(error));
    }
}
export async function createBlogPostFromDeepResearchAction(formData: FormData) {
    const actor = await requireAdminAccess("/admin/blog");
    const topic = String(formData.get("topic") || "").trim();
    const angle = String(formData.get("angle") || "").trim();
    const slug = String(formData.get("slug") || "").trim();
    const titleEn = String(formData.get("titleEn") || "").trim();
    const tagsInput = String(formData.get("tags") || "");
    const recencyDays = parseBoundedInt(formData.get("recencyDays"), 30, 1, 180);
    const maxSources = parseBoundedInt(formData.get("maxSources"), 6, 3, 12);
    const tags = parseTagList(tagsInput);
    if (!topic || !slug || !titleEn || tags.length === 0) {
        redirect("/admin/blog?error=missing_required_fields");
    }
    const adminClient = createSupabaseAdminClient();
    let runId: string | null = null;
    if (adminClient) {
        try {
            runId = await createAdminBlogRun(adminClient, {
                actorUserId: actor.userId,
                actorRole: actor.role,
                actorSource: actor.source,
                topic,
                slug,
            });
        }
        catch (error) {
            console.error("[admin-blog-runs] failed to create run row:", getErrorMessage(error));
        }
    }
    await writeAuditBestEffort(actor, {
        action: "blog_run_start",
        targetType: "blog_run",
        targetId: runId ?? undefined,
        details: {
            topic,
            slug,
            recencyDays,
            maxSources,
            tagCount: tags.length,
        },
    });
    try {
        const draft = await createBlogV2Draft({
            topic,
            angle: angle || undefined,
            slug,
            title: titleEn,
            tags,
            recencyDays,
            maxSources,
        });
        const result = await publishBlogV2Draft({
            draft,
        });
        await finalizeBlogRunStatus({
            runId,
            status: "success",
            slug: result.slug,
            researchPacketId: draft.researchPacketId,
            sourceCount: result.sourceCount,
        });
        await writeAuditBestEffort(actor, {
            action: "blog_run_success",
            targetType: "blog_run",
            targetId: runId ?? undefined,
            details: {
                topic,
                slug: result.slug,
                researchPacketId: draft.researchPacketId,
                sourceCount: result.sourceCount,
            },
        });
        revalidatePath("/blog");
        revalidatePath(`/blog/${result.slug}`);
        revalidatePath("/sitemap.xml");
        revalidatePath("/admin/blog");
        updateTag(BLOG_POSTS_CACHE_TAG);
        redirect(`/admin/blog?success=created&slug=${encodeURIComponent(result.slug)}&research=${encodeURIComponent(draft.researchPacketId)}&sources=${result.sourceCount}`);
    }
    catch (error) {
        const message = getErrorMessage(error);
        await finalizeBlogRunStatus({
            runId,
            status: "failed",
            errorMessage: message,
            slug,
        });
        await writeAuditBestEffort(actor, {
            action: "blog_run_failed",
            targetType: "blog_run",
            targetId: runId ?? undefined,
            details: {
                topic,
                slug,
                error: message,
            },
        });
        redirect(`/admin/blog?error=${encodeURIComponent(message)}`);
    }
}
