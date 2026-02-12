import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
function getSupabaseAuthEnv() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
        return null;
    }
    return { supabaseUrl, supabaseAnonKey };
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
