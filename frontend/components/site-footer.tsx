"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Github,
  MessageCircle,
  Send,
  Youtube,
} from "lucide-react";
import { BrandLockup } from "@/components/brand-lockup";
import { CookieSettingsButton } from "@/components/cookie-settings-button";
import { FooterNavColumn, footerNavSections } from "@/components/site-footer/sections";
import { GridPattern } from "@/components/ui/grid-pattern";
import { BlurFade } from "@/components/ui/blur-fade";
import { cn } from "@/lib/utils";
import { tr, type Locale } from "@/lib/i18n";

const socialLinks = [
  { href: "https://github.com", label: "GitHub", icon: Github },
  { href: "https://discord.com", label: "Discord", icon: MessageCircle },
  { href: "https://youtube.com", label: "YouTube", icon: Youtube },
  { href: "https://x.com", label: "X", icon: Send },
] as const;

type SiteFooterProps = {
  locale: Locale;
};

export function SiteFooter({ locale }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const pathname = usePathname();

  const getLinkClass = (href: string) => {
    const isActive = pathname === href;
    return cn(
      "group relative flex items-center gap-2 rounded-md border border-transparent px-3 py-1.5 text-[0.78rem] font-medium uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      isActive
        ? "border-border/70 bg-card/80 text-foreground"
        : "text-muted-foreground hover:border-border/70 hover:bg-card/70 hover:text-foreground"
    );
  };

  return (
    <footer className="relative z-10 overflow-hidden border-t border-border/80 bg-background">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <GridPattern
          width={40}
          height={40}
          x={-1}
          y={-1}
          className={cn(
            "[mask-image:radial-gradient(780px_circle_at_center,white,transparent)]",
            "opacity-[0.025]"
          )}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
        <div className="absolute -left-24 top-12 size-80 rounded-full bg-accent/8 blur-[90px]" />
        <div className="absolute -right-20 bottom-8 size-72 rounded-full bg-primary/8 blur-[90px]" />
      </div>

      <div className="section-shell relative z-10 grid gap-10 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <BlurFade delay={0.1} inView>
          <div className="space-y-5">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-md border border-transparent px-1 text-foreground transition-colors hover:border-border/70 hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <BrandLockup className="gap-2.5" markClassName="size-8 text-accent/90" textClassName="text-3xl tracking-[0.05em] sm:text-4xl" subtitle="MCP Directory" />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {tr(
                locale,
                "Community-curated MCP directory for discovering trusted servers, reviewing auth and verification signals, and submitting integrations.",
                "Community-curated MCP directory for discovering trusted servers, reviewing auth and verification signals, and submitting integrations.",
              )}
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="touch-hitbox inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-border/80 bg-card/70 text-muted-foreground transition-colors hover:border-primary/60 hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={item.label}
                >
                  <item.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </BlurFade>

        <BlurFade delay={0.2} inView>
          <FooterNavColumn
            locale={locale}
            title={footerNavSections[0].title}
            items={footerNavSections[0].items}
            pathname={pathname}
            getLinkClass={getLinkClass}
          />
        </BlurFade>

        <BlurFade delay={0.3} inView>
          <FooterNavColumn
            locale={locale}
            title={footerNavSections[1].title}
            items={footerNavSections[1].items}
            pathname={pathname}
            getLinkClass={getLinkClass}
          />
        </BlurFade>

        <BlurFade delay={0.4} inView>
          <FooterNavColumn
            locale={locale}
            title={footerNavSections[2].title}
            items={footerNavSections[2].items}
            pathname={pathname}
            getLinkClass={getLinkClass}
          />
        </BlurFade>
      </div>

      <div className="section-shell relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 py-6 text-xs text-muted-foreground">
        <p>{tr(locale, `(c) ${year} DemumuMind. All rights reserved.`, `(c) ${year} DemumuMind. All rights reserved.`)}</p>
        <div className="flex items-center gap-6">
          <CookieSettingsButton label={tr(locale, "Cookie Settings", "Cookie Settings")} />
          <Link
            href="/privacy"
            className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
