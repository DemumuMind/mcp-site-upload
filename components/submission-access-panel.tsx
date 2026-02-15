"use client";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/components/locale-provider";
import { SubmissionForm } from "@/components/submission-form";
import { Button } from "@/components/ui/button";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { tr } from "@/lib/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
const authRedirectHref = "/auth?next=%2Fsubmit-server%23submit";
export function SubmissionAccessPanel() {
    const locale = useLocale();
    const { isConfigured, isLoading, user } = useSupabaseUser();
    async function signOut() {
        const supabaseClient = createSupabaseBrowserClient();
        if (!supabaseClient) {
            return;
        }
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            toast.error(error.message);
            return;
        }
        toast.success(tr(locale, "Signed out", "Signed out"));
    }
    if (!isConfigured) {
        return (<div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6">
        <h4 className="text-base font-semibold text-amber-200">
          {tr(locale, "Auth is not configured", "Auth is not configured")}
        </h4>
        <p className="mt-2 text-sm text-amber-100/90">
          {tr(locale, "Set NEXT_PUBLIC_SUPABASE_URL and a Supabase publishable key (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) to enable server submissions.", "Set NEXT_PUBLIC_SUPABASE_URL and a Supabase publishable key (NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) to enable server submissions.")}
        </p>
        <Button asChild className="mt-4 bg-blue-500 hover:bg-blue-400">
          <Link href="/auth">{tr(locale, "Open sign in page", "Open sign in page")}</Link>
        </Button>
      </div>);
    }
    if (!user) {
        return (<div className="rounded-2xl border border-dashed border-white/15 bg-indigo-950/40 p-6">
        <h4 className="text-base font-semibold text-violet-50">
          {tr(locale, "Registration required", "Registration required")}
        </h4>
        <p className="mt-2 max-w-xl text-sm text-violet-200">
          {isLoading
                ? tr(locale, "Checking your session. If you are not signed in, use Login / Sign in to continue.", "Checking your session. If you are not signed in, use Login / Sign in to continue.")
                : tr(locale, "Sign in first, then you can submit your MCP server for moderation.", "Sign in first, then you can submit your MCP server for moderation.")}
        </p>
        <Button asChild className="mt-4 bg-blue-500 hover:bg-blue-400">
          <Link href={authRedirectHref}>{tr(locale, "Login / Sign in", "Login / Sign in")}</Link>
        </Button>
      </div>);
    }
    return (<div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-indigo-950/45 px-4 py-3 text-xs text-violet-200">
        <span>
          {tr(locale, "Signed in as", "Signed in as")}{" "}
          <strong className="font-medium text-violet-50">
            {user.email || tr(locale, "authenticated user", "authenticated user")}
          </strong>
        </span>
        <Button type="button" variant="outline" size="sm" onClick={() => {
            void signOut();
        }} className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]">
          <LogOut className="size-4"/>
          {tr(locale, "Sign out", "Sign out")}
        </Button>
      </div>
      <SubmissionForm />
    </div>);
}
