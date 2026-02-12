import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, getAdminAccessToken, getAdminAuthMode, getAdminRoleForUser, getAdminTokenActorLabel, isAdminSessionCookieValue, isSupabaseAdminAuthEnabled, isTokenAdminAuthEnabled, type AdminActorContext, } from "@/lib/admin-auth";
import { normalizeInternalPath } from "@/lib/auth-redirects";
import { getSupabaseServerUser } from "@/lib/supabase/auth-server";
type AdminAccessFailureReason = "session" | "forbidden" | "config";
export type ResolvedAdminAccess = {
    actor: AdminActorContext | null;
    failureReason: AdminAccessFailureReason;
};
function buildAdminLoginUrl(pathname: string, reason: AdminAccessFailureReason): string {
    const safePath = normalizeInternalPath(pathname);
    return `/admin/login?error=${reason}&redirect=${encodeURIComponent(safePath)}`;
}
export async function resolveAdminAccess(): Promise<ResolvedAdminAccess> {
    const authMode = getAdminAuthMode();
    const supabaseEnabled = isSupabaseAdminAuthEnabled();
    const tokenEnabled = isTokenAdminAuthEnabled();
    let failureReason: AdminAccessFailureReason = "session";
    let tokenCandidate: AdminActorContext | null = null;
    if (supabaseEnabled) {
        const { supabaseClient, user } = await getSupabaseServerUser();
        if (!supabaseClient) {
            if (authMode === "supabase") {
                return {
                    actor: null,
                    failureReason: "config",
                };
            }
        }
        else if (user) {
            const role = await getAdminRoleForUser(supabaseClient, user.id);
            if (role) {
                return {
                    actor: {
                        source: "supabase_auth",
                        userId: user.id,
                        role,
                    },
                    failureReason,
                };
            }
            failureReason = "forbidden";
        }
    }
    if (tokenEnabled) {
        const cookieStore = await cookies();
        const tokenSession = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
        if (isAdminSessionCookieValue(tokenSession)) {
            tokenCandidate = {
                source: "fallback_token",
                role: "super_admin",
                label: getAdminTokenActorLabel(),
            };
        }
    }
    if (tokenCandidate) {
        return {
            actor: tokenCandidate,
            failureReason,
        };
    }
    if (authMode === "token" && !getAdminAccessToken()) {
        return {
            actor: null,
            failureReason: "config",
        };
    }
    return {
        actor: null,
        failureReason,
    };
}
export async function requireAdminAccess(pathname: string): Promise<AdminActorContext> {
    const result = await resolveAdminAccess();
    if (!result.actor) {
        redirect(buildAdminLoginUrl(pathname, result.failureReason));
    }
    return result.actor;
}
