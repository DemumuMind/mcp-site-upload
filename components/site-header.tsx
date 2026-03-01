"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type LucideIcon, BookOpen, Cpu, House, LayoutGrid, Menu, Newspaper, Wallet, Wrench, X } from "lucide-react";
import { AuthNavActions } from "@/components/auth-nav-actions";
import { BrandLockup } from "@/components/brand-lockup";
import { BlurFade } from "@/components/ui/blur-fade";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

type NavLinkItem = {
  href: string;
  label: { en: string };
  icon: LucideIcon;
};

const navLinkMap: readonly NavLinkItem[] = [
  { href: "/", label: { en: "Overview" }, icon: House },
  { href: "/catalog", label: { en: "Catalog" }, icon: LayoutGrid },
  { href: "/how-to-use", label: { en: "Setup" }, icon: BookOpen },
  { href: "/tools", label: { en: "Tools" }, icon: Wrench },
  { href: "/mcp", label: { en: "MCP" }, icon: Cpu },
  { href: "/blog", label: { en: "Blog" }, icon: Newspaper },
  { href: "/pricing", label: { en: "Pricing" }, icon: Wallet },
];

type SiteHeaderProps = {
  locale: Locale;
};

export function SiteHeader({ locale }: SiteHeaderProps) {
  const navLinks = navLinkMap.map((item) => ({ href: item.href, label: item.label[locale], icon: item.icon }));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isScrolled = useScroll(14);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    function handleEscapeKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscapeKeydown);
    return () => window.removeEventListener("keydown", handleEscapeKeydown);
  }, [isMobileMenuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-200",
        isScrolled
          ? "border-blacksmith/70 bg-background/92 supports-[backdrop-filter]:bg-background/78 supports-[backdrop-filter]:backdrop-blur-lg"
          : "border-transparent bg-transparent"
      )}
    >
      <div
        data-anime="home-nav"
        className={cn(
          "section-shell flex flex-wrap items-center justify-between gap-2 transition-[padding] duration-200",
          isScrolled ? "py-3" : "py-5"
        )}
      >
        <BlurFade delay={0.1} yOffset={0}>
          <Link
            className="inline-flex min-h-11 items-center rounded-md border border-transparent px-1 text-foreground transition-colors hover:border-blacksmith/70 hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            href="/"
          >
            <BrandLockup className="gap-2" markClassName="size-7 text-accent" textClassName="text-sm tracking-[0.08em] sm:text-base" />
          </Link>
        </BlurFade>

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link, idx) => (
            <BlurFade key={link.href} delay={0.1 + idx * 0.05} yOffset={0}>
              <Link
                href={link.href}
                className="group relative flex items-center gap-2 rounded-md border border-transparent px-3 py-2 text-[0.78rem] font-medium uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:border-blacksmith/70 hover:bg-card/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <link.icon aria-hidden className="size-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                {link.label}
                <span className="absolute inset-x-3 bottom-[5px] h-px scale-x-0 bg-primary/60 transition-transform duration-200 group-hover:scale-x-100" />
              </Link>
            </BlurFade>
          ))}
          <div className="ml-3 h-6 w-px bg-blacksmith/60" />
          <BlurFade delay={0.5} yOffset={0}>
            <div className="ml-2">
              <AuthNavActions locale={locale} />
            </div>
          </BlurFade>
        </div>

        <div className="flex shrink-0 items-center gap-3 lg:hidden">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-blacksmith/80 bg-card/70 text-foreground transition-colors hover:border-primary/60 hover:bg-card hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
            aria-controls="mobile-site-nav"
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <AuthNavActions locale={locale} />
        </div>
      </div>

      {isMobileMenuOpen ? (
        <nav
          id="mobile-site-nav"
          className="border-t border-blacksmith/70 bg-background/98 px-4 py-3 supports-[backdrop-filter]:bg-background/94 sm:px-6 lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto grid w-full max-w-7xl gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-transparent px-3 text-sm font-medium text-foreground transition-colors hover:border-blacksmith/70 hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <link.icon aria-hidden className="size-4 opacity-90" />
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
