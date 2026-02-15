import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
export function createSupabaseServerClient(): SupabaseClient | null {
    const env = getSupabasePublicEnv();
    if (!env) {
        return null;
    }
    return createClient(env.supabaseUrl, env.supabasePublishableKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
}
