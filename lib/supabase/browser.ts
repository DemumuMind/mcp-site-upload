"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
let browserClient: SupabaseClient | null | undefined;
export function isSupabaseAuthConfigured(): boolean {
    return Boolean(getSupabasePublicEnv());
}
export function createSupabaseBrowserClient(): SupabaseClient | null {
    if (browserClient !== undefined) {
        return browserClient;
    }
    const env = getSupabasePublicEnv();
    if (!env) {
        browserClient = null;
        return browserClient;
    }
    browserClient = createBrowserClient(env.supabaseUrl, env.supabasePublishableKey);
    return browserClient;
}
