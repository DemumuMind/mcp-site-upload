"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
let browserClient: SupabaseClient | null | undefined;
function readPublicEnvFromClientBundle(): {
    supabaseUrl: string;
    supabasePublishableKey: string;
} | null {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim();
    if (!supabaseUrl || !supabasePublishableKey) {
        return null;
    }
    return {
        supabaseUrl,
        supabasePublishableKey,
    };
}
export function isSupabaseAuthConfigured(): boolean {
    return Boolean(readPublicEnvFromClientBundle());
}
export function createSupabaseBrowserClient(): SupabaseClient | null {
    if (browserClient !== undefined) {
        return browserClient;
    }
    const env = readPublicEnvFromClientBundle();
    if (!env) {
        browserClient = null;
        return browserClient;
    }
    browserClient = createBrowserClient(env.supabaseUrl, env.supabasePublishableKey);
    return browserClient;
}
