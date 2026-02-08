"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function loginAdminAction(formData: FormData) {
  const submittedToken = String(formData.get("token") || "");
  const redirectPath = String(formData.get("redirect") || "/admin");

  if (!isValidAdminToken(submittedToken)) {
    redirect("/admin/login?error=invalid");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, getAdminAccessToken(), {
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
  revalidatePath("/admin");
  redirect(`/admin?success=${nextStatus}`);
}
