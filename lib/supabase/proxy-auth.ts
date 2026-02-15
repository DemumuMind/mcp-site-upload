import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
export function createSupabaseProxyAuthClient(request: NextRequest): {
    supabaseClient: SupabaseClient;
    getResponse: () => NextResponse;
} | null {
    const env = getSupabasePublicEnv();
    if (!env) {
        return null;
    }
    const state = {
        response: NextResponse.next({
            request: {
                headers: request.headers,
            },
        }),
    };
    const supabaseClient = createServerClient(env.supabaseUrl, env.supabasePublishableKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => {
                    request.cookies.set(name, value);
                });
                state.response = NextResponse.next({
                    request: {
                        headers: request.headers,
                    },
                });
                cookiesToSet.forEach(({ name, value, options }) => {
                    state.response.cookies.set(name, value, options as CookieOptions);
                });
            },
        },
    });
    return {
        supabaseClient,
        getResponse: () => state.response,
    };
}
