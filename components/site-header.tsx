"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type LucideIcon, BookOpen, Cpu, House, LayoutGrid, Menu, Newspaper, Wallet, Wrench, X } from "lucide-react";
import { AuthNavActions } from "@/components/auth-nav-actions";
import { BrandLockup } from "@/components/brand-lockup";
import { BorderBeam } from "@/components/ui/border-beam";
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
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled
          ? "border-b border-primary/20 bg-background/60 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          : "border-b border-transparent bg-transparent"
      )}
    >
      {isScrolled && <BorderBeam size={200} duration={8} borderWidth={2} className="opacity-80" />}

      {/* Persistent Atmospheric Glows (subtle on header) */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 size-64 rounded-full bg-accent/15 blur-[60px] transition-opacity duration-500",
          isScrolled ? "opacity-100" : "opacity-0"
        )} />
        <div className={cn(
          "absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 size-64 rounded-full bg-primary/15 blur-[60px] transition-opacity duration-500",
          isScrolled ? "opacity-100" : "opacity-0"
        )} />
      </div>

      <div
        data-anime="home-nav"
        className={cn(
          "section-shell flex flex-wrap items-center justify-between gap-2 transition-all duration-300",
          isScrolled ? "py-2.5" : "py-5"
        )}
      >
        <BlurFade delay={0.1} yOffset={0}>
          <Link
            className="inline-flex min-h-11 items-center rounded-md text-foreground transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            href="/"
          >
            <BrandLockup className="gap-2" markClassName="size-7 text-accent" textClassName="text-sm tracking-[0.09em] sm:text-base" />
          </Link>
        </BlurFade>

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link, idx) => (
            <BlurFade key={link.href} delay={0.1 + idx * 0.05} yOffset={0}>
              <Link
                href={link.href}
                className="group relative flex items-center gap-2 rounded-full px-4 py-2 text-[0.8rem] font-medium tracking-wide text-muted-foreground transition-all hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <link.icon aria-hidden className="size-3.5 transition-transform group-hover:scale-110" />
                {link.label}
                <span className="absolute inset-x-4 bottom-1 h-px scale-x-0 bg-primary/50 transition-transform group-hover:scale-x-100" />
              </Link>
            </BlurFade>
          ))}
          <div className="ml-4 h-6 w-px bg-blacksmith/50" />
          <BlurFade delay={0.5} yOffset={0}>
            <div className="ml-2">
              <AuthNavActions locale={locale} />
            </div>
          </BlurFade>
        </div>

        <div className="flex shrink-0 items-center gap-3 lg:hidden">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-blacksmith bg-card/50 text-foreground backdrop-blur-sm transition-all hover:border-primary/50 hover:text-primary focus-visible:outline-none"
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

      {isScrolled && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
      )}

      {isMobileMenuOpen ? (
        <nav id="mobile-site-nav" className="border-t bg-background px-4 py-3 sm:px-6 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid w-full max-w-7xl gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
