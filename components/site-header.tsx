"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type LucideIcon, BookOpen, Cpu, House, LayoutGrid, Menu, Newspaper, Wallet, Wrench, X } from "lucide-react";
import { AuthNavActions } from "@/components/auth-nav-actions";
import { BrandLockup } from "@/components/brand-lockup";
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 14);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      className={`sticky top-0 z-40 border-b border-blacksmith bg-[rgba(9,9,9,0.88)] backdrop-blur-xl transition-all duration-200 ${
        isScrolled ? "shadow-[0_6px_24px_rgba(0,0,0,0.35)]" : ""
      }`}
    >
      <div data-anime="home-nav" className={`section-shell flex flex-wrap items-center justify-between gap-2 py-2 transition-all duration-200 ${isScrolled ? "min-h-12 sm:min-h-14" : "min-h-14 sm:min-h-16"}`}>
        <Link
          className="inline-flex min-h-11 items-center rounded-md text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          href="/"
        >
          <BrandLockup className="gap-2" markClassName="size-7" textClassName="text-sm tracking-[0.09em] sm:text-base" />
        </Link>

        <div className="hidden items-center gap-4 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-anime="home-nav-item"
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs tracking-wide text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <link.icon aria-hidden className="size-3.5 opacity-85" />
              {link.label}
            </Link>
          ))}
          <AuthNavActions locale={locale} />
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <button
            type="button"
            className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-blacksmith bg-card px-3 text-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-site-nav"
            aria-label={isMobileMenuOpen ? "Close menu" : "Menu"}
          >
            {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
          <AuthNavActions locale={locale} />
        </div>
      </div>

      {isMobileMenuOpen ? (
        <nav id="mobile-site-nav" className="border-t border-blacksmith bg-background px-4 py-3 sm:px-6 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid w-full max-w-7xl gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-foreground transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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

