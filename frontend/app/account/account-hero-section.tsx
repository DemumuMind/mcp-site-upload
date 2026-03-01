import Image from "next/image";
import Link from "next/link";

import { AccountSignOutButton } from "@/components/account-sign-out-button";
import { Button } from "@/components/ui/button";
import { tr, type Locale } from "@/lib/i18n";

type AccountHeroSectionProps = {
  locale: Locale;
  avatarUrl: string | null;
  displayName: string;
  initials: string;
  email: string | null;
};

export function AccountHeroSection({
  locale,
  avatarUrl,
  displayName,
  initials,
  email,
}: AccountHeroSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-card/90 p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={64}
              height={64}
              sizes="64px"
              className="size-16 rounded-2xl border border-border object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="inline-flex size-16 items-center justify-center rounded-2xl border border-border bg-muted text-xl font-semibold text-foreground">
              {initials}
            </div>
          )}
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {tr(locale, "Personal cabinet", "Personal cabinet")}
            </p>
            <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{displayName}</h1>
            <p className="text-sm text-muted-foreground">
              {email ?? tr(locale, "authenticated user", "authenticated user")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/submit-server">{tr(locale, "Submit server", "Submit server")}</Link>
          </Button>
          <AccountSignOutButton locale={locale} />
        </div>
      </div>
    </section>
  );
}


