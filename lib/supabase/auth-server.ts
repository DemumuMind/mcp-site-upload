import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
function getSupabaseAuthEnv() {
    const env = getSupabasePublicEnv();
    if (!env) {
        return null;
    }
    return {
        supabaseUrl: env.supabaseUrl,
        supabaseAnonKey: env.supabasePublishableKey,
    };
}
export async function createSupabaseServerAuthClient(): Promise<SupabaseClient | null> {
    const env = getSupabaseAuthEnv();
    if (!env) {
        return null;
    }
    const cookieStore = await cookies();
    return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    cookieStore.set(name, value, options as CookieOptions);
                });
            },
        },
    });
}
export async function getSupabaseServerUser(): Promise<{
    supabaseClient: SupabaseClient | null;
    user: User | null;
}> {
    const supabaseClient = await createSupabaseServerAuthClient();
    if (!supabaseClient) {
        return { supabaseClient: null, user: null };
    }
    const { data, error } = await supabaseClient.auth.getUser();
    if (error || !data.user) {
        return { supabaseClient, user: null };
    }
    return { supabaseClient, user: data.user };
}
