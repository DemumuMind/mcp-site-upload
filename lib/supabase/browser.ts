"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
let browserClient: SupabaseClient | null | undefined;
export function isSupabaseAuthConfigured(): boolean {
    return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
export function createSupabaseBrowserClient(): SupabaseClient | null {
    if (browserClient !== undefined) {
        return browserClient;
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
        browserClient = null;
        return browserClient;
    }
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
    return browserClient;
}
