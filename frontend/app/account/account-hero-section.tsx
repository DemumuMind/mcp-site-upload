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
    <section className="grid gap-8 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:py-24">
      <div>
        <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
          {tr(locale, "DemumuMind Profile", "DemumuMind Profile")}
        </p>
        <p className="mt-5 font-serif text-[clamp(3rem,10vw,6.5rem)] leading-none tracking-[-0.06em] text-foreground">
          DemumuMind
        </p>
        <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
          {tr(locale, "One profile for every submission, review, and security touchpoint.", "One profile for every submission, review, and security touchpoint.")}
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {tr(locale, "Manage your identity, see submission status at a glance, and keep control of the MCP servers you publish through DemumuMind.", "Manage your identity, see submission status at a glance, and keep control of the MCP servers you publish through DemumuMind.")}
        </p>
      </div>

      <div className="border border-border/60 bg-background/70 p-6 backdrop-blur-sm sm:p-7">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={72}
              height={72}
              sizes="72px"
              className="size-[72px] border border-border object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="inline-flex size-[72px] items-center justify-center border border-border bg-muted text-2xl font-semibold text-foreground">
              {initials}
            </div>
          )}

          <div className="min-w-0">
            <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
              {tr(locale, "Account owner", "Account owner")}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{displayName}</h2>
            <p className="mt-2 break-all text-sm text-muted-foreground">
              {email ?? tr(locale, "authenticated user", "authenticated user")}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-11 rounded-none px-6">
            <Link href="/submit-server">{tr(locale, "Submit server", "Submit server")}</Link>
          </Button>
          <AccountSignOutButton locale={locale} />
        </div>
      </div>
    </section>
  );
}
