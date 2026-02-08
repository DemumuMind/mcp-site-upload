"use client";

import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { tr, type Locale } from "@/lib/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AccountSignOutButtonProps = {
  locale: Locale;
};

export function AccountSignOutButton({ locale }: AccountSignOutButtonProps) {
  async function signOut() {
    const supabaseClient = createSupabaseBrowserClient();

    if (!supabaseClient) {
      toast.error(
        tr(
          locale,
          "Auth client is not configured.",
          "Auth client is not configured.",
        ),
      );
      return;
    }

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(tr(locale, "Signed out", "Signed out"));
    window.location.assign("/auth");
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        void signOut();
      }}
      className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
    >
      <LogOut className="size-4" />
      {tr(locale, "Sign out", "Sign out")}
    </Button>
  );
}
