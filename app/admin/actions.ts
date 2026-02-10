"use server";

import { cookies } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { createBlogPostFromResearch, parseTagList } from "@/lib/blog/automation";
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error";
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

  try {
    const packet = await runDeepResearchWorkflow({
      topic,
      angle: angle || undefined,
      tags,
      recencyDays,
      maxSources,
      locale,
    });

    const result = await createBlogPostFromResearch({
      packet,
      slug,
      titleEn,
      titleRu,
      tags,
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${result.slug}`);
    revalidatePath("/sitemap.xml");
    revalidatePath("/admin/blog");
    updateTag(BLOG_POSTS_CACHE_TAG);

    redirect(
      `/admin/blog?success=created&slug=${encodeURIComponent(result.slug)}&research=${encodeURIComponent(packet.id)}&sources=${result.sourceCount}`,
    );
  } catch (error) {
    const message = getErrorMessage(error);
    redirect(`/admin/blog?error=${encodeURIComponent(message)}`);
  }
}
