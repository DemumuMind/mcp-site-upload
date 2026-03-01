import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { logoutAdminAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { tr, type Locale } from "@/lib/i18n";

type AdminBlogHeroActionsProps = {
  backHref: string;
  locale: Locale;
};

export function AdminBlogHeroActions({ backHref, locale }: AdminBlogHeroActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="outline" className="border-border bg-card hover:bg-muted/60">
        <Link href={backHref}>
          <ArrowLeft className="size-4" />
          {tr(locale, "Back to moderation", "Back to moderation")}
        </Link>
      </Button>

      <form action={logoutAdminAction}>
        <Button type="submit" variant="outline" className="border-border bg-card hover:bg-muted/60">
          {tr(locale, "Logout", "Logout")}
        </Button>
      </form>
    </div>
  );
}

