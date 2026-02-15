import { timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
export const ADMIN_SESSION_COOKIE = "mcp_admin_session";
const ADMIN_AUTH_MODES = ["hybrid", "supabase", "token"] as const;
type AdminRoleRow = {
    role: string | null;
};
export type AdminAuthMode = (typeof ADMIN_AUTH_MODES)[number];
export type AdminRole = "admin" | "super_admin";
export type AdminActorSource = "supabase_auth" | "fallback_token" | "system";
export type AdminActorContext = {
    source: AdminActorSource;
    userId?: string;
    role?: AdminRole;
    label?: string;
};
function parseBooleanEnv(value: string | undefined, fallbackValue: boolean): boolean {
    if (value === undefined) {
        return fallbackValue;
    }
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
        return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
        return false;
    }
    return fallbackValue;
}
export function getAdminAuthMode(): AdminAuthMode {
    const configuredMode = process.env.ADMIN_AUTH_MODE?.trim().toLowerCase();
    if (configuredMode && ADMIN_AUTH_MODES.includes(configuredMode as AdminAuthMode)) {
        return configuredMode as AdminAuthMode;
    }
    return "hybrid";
}
export function isSupabaseAdminAuthEnabled(): boolean {
    const authMode = getAdminAuthMode();
    return authMode === "hybrid" || authMode === "supabase";
}
export function isTokenAdminAuthEnabled(): boolean {
    const authMode = getAdminAuthMode();
    if (authMode === "supabase") {
        return false;
    }
    if (authMode === "token") {
        return true;
    }
    return parseBooleanEnv(process.env.ADMIN_FALLBACK_TOKEN_ENABLED, true);
}
export function getAdminTokenActorLabel(): string {
    const value = process.env.ADMIN_TOKEN_ACTOR_LABEL?.trim();
    return value || "admin-token";
}
export function getAdminAccessToken(): string {
    const envToken = process.env.ADMIN_ACCESS_TOKEN?.trim();
    if (envToken) {
        return envToken;
    }
    if (process.env.NODE_ENV !== "production") {
        return "local-admin-token";
    }
    return "";
}
function timingSafeStringEqual(providedValue: string, expectedValue: string): boolean {
    const provided = Buffer.from(providedValue);
    const expected = Buffer.from(expectedValue);
    if (provided.length !== expected.length) {
        return false;
    }
    return timingSafeEqual(provided, expected);
}
export function isValidAdminToken(token: string): boolean {
    const expectedToken = getAdminAccessToken();
    if (!expectedToken) {
        return false;
    }
    return timingSafeStringEqual(token, expectedToken);
}
export function isAdminSessionCookieValue(value: string | undefined): boolean {
    if (!value) {
        return false;
    }
    return isValidAdminToken(value);
}
export function toAdminRole(value: string | null | undefined): AdminRole | null {
    if (value === "admin" || value === "super_admin") {
        return value;
    }
    return null;
}
export async function getAdminRoleForUser(supabaseClient: SupabaseClient, userId: string): Promise<AdminRole | null> {
    if (!userId) {
        return null;
    }
    try {
        const { data, error } = await supabaseClient
            .from("admin_roles")
            .select("role")
            .eq("user_id", userId)
            .limit(1)
            .maybeSingle<AdminRoleRow>();
        if (error) {
            console.error("[admin-auth] failed to resolve admin role", {
                userId,
                code: error.code,
                message: error.message,
            });
            return null;
        }
        if (!data) {
            return null;
        }
        const normalizedRole = toAdminRole(data.role);
        if (!normalizedRole && data.role) {
            console.warn("[admin-auth] unexpected admin role value", {
                userId,
                role: data.role,
            });
        }
        return normalizedRole;
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[admin-auth] unexpected role lookup failure", {
            userId,
            message,
        });
        return null;
    }
}
