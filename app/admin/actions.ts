"use server";

import { cookies } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { createBlogPostFromResearch, parseTagList } from "@/lib/blog/automation";
import {
  persistBlogRuBackfillRun,
  runBlogRuBackfill,
  type BlogRuBackfillResult,
} from "@/lib/blog/backfill";
import { runDeepResearchWorkflow } from "@/lib/blog/research";
import { BLOG_POSTS_CACHE_TAG } from "@/lib/blog/service";
import { CATALOG_SERVERS_CACHE_TAG } from "@/lib/catalog/snapshot";
import {
  ADMIN_SESSION_COOKIE,
  getAdminAccessToken,
  isAdminSessionCookieValue,
  isValidAdminToken,
} from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ServerStatus } from "@/lib/types";

const moderationStatuses: ServerStatus[] = ["active", "rejected"];

async function assertAdminSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!isAdminSessionCookieValue(sessionValue)) {
    redirect("/admin/login?error=session");
  }
}

function parseBoundedInt(value: FormDataEntryValue | null, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(String(value ?? ""), 10);

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

function createEmptyBackfillResult(): BlogRuBackfillResult {
  const emptyStats = {
    scanned: 0,
    legacy: 0,
    changed: 0,
    applied: 0,
    errors: 0,
    skipped: true,
  };

  return {
    table: emptyStats,
    storage: emptyStats,
    changed: 0,
    applied: 0,
    errors: 0,
  };
}

export async function loginAdminAction(formData: FormData) {
  const expectedToken = getAdminAccessToken();
  const submittedToken = String(formData.get("token") || "");
  const redirectPath = String(formData.get("redirect") || "/admin");

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

  redirect(redirectPath.startsWith("/admin") ? redirectPath : "/admin");
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}

export async function moderateServerStatusAction(formData: FormData) {
  await assertAdminSession();

  const serverId = String(formData.get("serverId") || "");
  const nextStatus = String(formData.get("status") || "") as ServerStatus;

  if (!serverId || !moderationStatuses.includes(nextStatus)) {
    redirect("/admin?error=invalid");
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    redirect("/admin?error=supabase");
  }

  const { error } = await adminClient
    .from("servers")
    .update({ status: nextStatus })
    .eq("id", serverId)
    .limit(1);

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/categories");
  revalidatePath("/how-to-use");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin");
  updateTag(CATALOG_SERVERS_CACHE_TAG);
  redirect(`/admin?success=${nextStatus}`);
}

export async function saveAdminDashboardSettingsAction(formData: FormData) {
  await assertAdminSession();

  const statusUpdateIntervalSec = parseBoundedInt(
    formData.get("statusUpdateIntervalSec"),
    5,
    1,
    300,
  );
  const requestLimitPerMinute = parseBoundedInt(
    formData.get("requestLimitPerMinute"),
    1_000,
    1,
    100_000,
  );
  const notifyEmailOnErrors = toCheckedBoolean(formData.get("notifyEmailOnErrors"));
  const notifyPushNotifications = toCheckedBoolean(formData.get("notifyPushNotifications"));
  const notifyWebhookIntegrations = toCheckedBoolean(formData.get("notifyWebhookIntegrations"));

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    redirect("/admin?error=supabase");
  }

  const { error } = await adminClient.from("admin_dashboard_settings").upsert(
    {
      id: 1,
      status_update_interval_sec: statusUpdateIntervalSec,
      request_limit_per_minute: requestLimitPerMinute,
      notify_email_on_errors: notifyEmailOnErrors,
      notify_push_notifications: notifyPushNotifications,
      notify_webhook_integrations: notifyWebhookIntegrations,
    },
    { onConflict: "id" },
  );

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.message)}`);
  }

  await adminClient.from("admin_system_events").insert({
    level: "info",
    message_en: "Admin dashboard settings updated",
    message_ru: "Настройки админ-панели обновлены",
  });

  revalidatePath("/admin");
  redirect("/admin?success=settings");
}

export async function createBlogPostFromDeepResearchAction(formData: FormData) {
  await assertAdminSession();

  const topic = String(formData.get("topic") || "").trim();
  const angle = String(formData.get("angle") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const titleEn = String(formData.get("titleEn") || "").trim();
  const titleRu = String(formData.get("titleRu") || "").trim();
  const tagsInput = String(formData.get("tags") || "");
  const localeInput = String(formData.get("locale") || "en").trim().toLowerCase();

  const locale = localeInput === "ru" ? "ru" : "en";
  const recencyDays = parseBoundedInt(formData.get("recencyDays"), 30, 1, 180);
  const maxSources = parseBoundedInt(formData.get("maxSources"), 6, 3, 12);
  const tags = parseTagList(tagsInput);

  if (!topic || !slug || !titleEn || !titleRu || tags.length === 0) {
    redirect("/admin/blog?error=missing_required_fields");
  }

  let packet: Awaited<ReturnType<typeof runDeepResearchWorkflow>>;
  let result: Awaited<ReturnType<typeof createBlogPostFromResearch>>;

  try {
    packet = await runDeepResearchWorkflow({
      topic,
      angle: angle || undefined,
      tags,
      recencyDays,
      maxSources,
      locale,
    });

    result = await createBlogPostFromResearch({
      packet,
      slug,
      titleEn,
      titleRu,
      tags,
    });
  } catch (error) {
    const message = getErrorMessage(error);
    redirect(`/admin/blog?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${result.slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/blog");
  updateTag(BLOG_POSTS_CACHE_TAG);

  redirect(
    `/admin/blog?success=created&slug=${encodeURIComponent(result.slug)}&research=${encodeURIComponent(packet.id)}&sources=${result.sourceCount}`,
  );
}

export async function runRuBlogBackfillAction(formData: FormData) {
  await assertAdminSession();

  const limit = parseBoundedInt(formData.get("backfillLimit"), 500, 1, 5000);
  let result: BlogRuBackfillResult;
  let runId: string | undefined;

  try {
    result = await runBlogRuBackfill({
      apply: true,
      limit,
    });

    const persistResult = await persistBlogRuBackfillRun({
      apply: true,
      limit,
      result,
    });
    runId = persistResult.runId;
  } catch (error) {
    const message = getErrorMessage(error);

    try {
      await persistBlogRuBackfillRun({
        apply: true,
        limit,
        result: createEmptyBackfillResult(),
        status: "failed",
        errorMessage: message,
      });
    } catch {
      // Ignore audit persistence failures to avoid blocking admin remediation actions.
    }

    redirect(`/admin/blog?error=${encodeURIComponent(`backfill_failed: ${message}`)}`);
  }

  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/blog");
  updateTag(BLOG_POSTS_CACHE_TAG);

  const params = new URLSearchParams({
    success: "backfill",
    backfillChanged: String(result.changed),
    backfillApplied: String(result.applied),
    backfillErrors: String(result.errors),
    backfillTableChanged: String(result.table.changed),
    backfillStorageChanged: String(result.storage.changed),
    backfillLimit: String(limit),
  });

  if (runId) {
    params.set("backfillRunId", runId);
  }

  redirect(`/admin/blog?${params.toString()}`);
}
