import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, getAdminAccessToken, getAdminAuthMode, getAdminRoleForUser, getAdminTokenActorLabel, isAdminSessionCookieValue, isSupabaseAdminAuthEnabled, isTokenAdminAuthEnabled, type AdminActorContext, } from "@/lib/admin-auth";
import { extractBearerToken } from "@/lib/api/auth-helpers";
import { normalizeInternalPath } from "@/lib/auth-redirects";
import { getSupabaseServerUser } from "@/lib/supabase/auth-server";
type AdminAccessFailureReason = "session" | "forbidden" | "config";
export type ResolvedAdminAccess = {
    actor: AdminActorContext | null;
    failureReason: AdminAccessFailureReason;
};
function resolveTokenActorFromValue(value: string | null | undefined): AdminActorContext | null {
    if (!value || !isAdminSessionCookieValue(value)) {
        return null;
    }
    return {
        source: "fallback_token",
        role: "super_admin",
        label: getAdminTokenActorLabel(),
    };
}
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
            const roleResult = await getAdminRoleForUser(supabaseClient, user.id);
            if (roleResult.ok) {
                return {
                    actor: {
                        source: "supabase_auth",
                        userId: user.id,
                        role: roleResult.role,
                    },
                    failureReason,
                };
            }
            failureReason = roleResult.reason === "lookup_error" ? "config" : "forbidden";
        }
    }
    if (tokenEnabled) {
        const cookieStore = await cookies();
        const tokenSession = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
        tokenCandidate = resolveTokenActorFromValue(tokenSession);
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
export async function resolveAdminApiAccess(request: Request): Promise<ResolvedAdminAccess> {
    if (isTokenAdminAuthEnabled()) {
        const bearerToken = extractBearerToken(request);
        const tokenActor = resolveTokenActorFromValue(bearerToken);
        if (tokenActor) {
            return {
                actor: tokenActor,
                failureReason: "session",
            };
        }
    }
    return resolveAdminAccess();
}
export async function requireAdminAccess(pathname: string): Promise<AdminActorContext> {
    const result = await resolveAdminAccess();
    if (!result.actor) {
        redirect(buildAdminLoginUrl(pathname, result.failureReason));
    }
    return result.actor;
}
