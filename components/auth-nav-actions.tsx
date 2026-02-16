"use client";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSupabaseUser } from "@/hooks/use-supabase-user";
import { tr, type Locale } from "@/lib/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
type AuthNavActionsProps = {
    locale: Locale;
};
const submitHref = "/submit-server";
const accountHref = "/account";
const authRedirectHref = "/auth?next=%2Fsubmit-server%23submit";
export function AuthNavActions({ locale }: AuthNavActionsProps) {
    const { isConfigured, user } = useSupabaseUser();
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
        window.location.assign(authRedirectHref);
    }
    if (!isConfigured) {
        return (<Button asChild className="h-11 rounded-full bg-blue-500 px-3 text-xs font-semibold hover:bg-blue-400 sm:h-10 sm:px-4 sm:text-sm">
        <Link href={authRedirectHref}>
          <span className="sm:hidden">{tr(locale, "Login", "Login")}</span>
          <span className="hidden sm:inline">{tr(locale, "Login", "Login")}</span>
        </Link>
      </Button>);
    }
    if (!user) {
        return (<Button asChild className="h-11 rounded-full bg-blue-500 px-3 text-xs font-semibold hover:bg-blue-400 sm:h-10 sm:px-4 sm:text-sm">
        <Link href={authRedirectHref}>
          <span className="sm:hidden">{tr(locale, "Login", "Login")}</span>
          <span className="hidden sm:inline">{tr(locale, "Login", "Login")}</span>
        </Link>
      </Button>);
    }
    return (<div className="flex items-center gap-2">
      <Button asChild variant="outline" className="h-11 rounded-full border-blacksmith bg-card px-3 text-xs font-semibold hover:bg-accent sm:h-10 sm:px-4 sm:text-sm">
        <Link href={accountHref}>
          <span className="sm:hidden">{tr(locale, "Account", "Account")}</span>
          <span className="hidden sm:inline">{tr(locale, "My account", "My account")}</span>
        </Link>
      </Button>
      <Button asChild className="h-11 rounded-full bg-blue-500 px-3 text-xs font-semibold hover:bg-blue-400 sm:h-10 sm:px-4 sm:text-sm">
        <Link href={submitHref}>
          <span className="sm:hidden">{tr(locale, "Submit", "Submit")}</span>
          <span className="hidden sm:inline">{tr(locale, "Submit Server", "Submit Server")}</span>
        </Link>
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => {
            void signOut();
        }} className="h-11 border-blacksmith bg-card px-2.5 text-xs hover:bg-accent sm:h-10 sm:px-3 sm:text-sm" aria-label={tr(locale, "Sign out", "Sign out")}>
        <LogOut className="size-4"/>
        <span className="hidden sm:inline">{tr(locale, "Sign out", "Sign out")}</span>
      </Button>
    </div>);
}

