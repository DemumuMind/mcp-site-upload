import { NextResponse, type NextRequest } from "next/server";
import { normalizeInternalPath } from "@/lib/auth-redirects";
import { createSupabaseServerAuthClient } from "@/lib/supabase/auth-server";
function getAuthRedirect(request: NextRequest, nextPath: string, errorCode: "missing_code" | "callback_error" | "config_error") {
    const redirectUrl = new URL("/auth", request.url);
    redirectUrl.searchParams.set("next", nextPath);
    redirectUrl.searchParams.set("error", errorCode);
    return NextResponse.redirect(redirectUrl);
}
export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get("code");
    const safeNextPath = normalizeInternalPath(request.nextUrl.searchParams.get("next"));
    if (!code) {
        return getAuthRedirect(request, safeNextPath, "missing_code");
    }
    const supabaseClient = await createSupabaseServerAuthClient();
    if (!supabaseClient) {
        return getAuthRedirect(request, safeNextPath, "config_error");
    }
    const { error } = await supabaseClient.auth.exchangeCodeForSession(code);
    if (error) {
        return getAuthRedirect(request, safeNextPath, "callback_error");
    }
    return NextResponse.redirect(new URL(safeNextPath, request.url));
}
