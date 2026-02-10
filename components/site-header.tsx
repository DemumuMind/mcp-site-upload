"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type LucideIcon,
  BookOpen,
  Cpu,
  House,
  LayoutGrid,
  Menu,
  Newspaper,
  Wallet,
  Wrench,
  X,
} from "lucide-react";

import { AuthNavActions } from "@/components/auth-nav-actions";
import { BrandLockup } from "@/components/brand-lockup";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteNotificationCenter } from "@/components/site-notification-center";
import { ThemeToggle } from "@/components/theme-toggle";
import { tr, type Locale } from "@/lib/i18n";
import type { SiteNotificationItem } from "@/lib/notifications/types";
import { cn } from "@/lib/utils";

type NavLinkItem = {
  href: string;
  label: {
    en: string;
    ru: string;
  };
  icon: LucideIcon;
};

const navLinkMap: readonly NavLinkItem[] = [
  { href: "/", label: { en: "Overview", ru: "Обзор" }, icon: House },
  { href: "/catalog", label: { en: "Catalog", ru: "Каталог" }, icon: LayoutGrid },
  { href: "/how-to-use", label: { en: "Setup", ru: "Настройка" }, icon: BookOpen },
  { href: "/tools", label: { en: "Tools", ru: "Инструменты" }, icon: Wrench },
  { href: "/mcp", label: { en: "MCP", ru: "MCP" }, icon: Cpu },
  { href: "/blog", label: { en: "Blog", ru: "Блог" }, icon: Newspaper },
  { href: "/pricing", label: { en: "Pricing", ru: "Цены" }, icon: Wallet },
];

type SiteHeaderProps = {
  locale: Locale;
  notifications: SiteNotificationItem[];
};

export function SiteHeader({ locale, notifications }: SiteHeaderProps) {
  const pathname = usePathname();
  const navLinks = navLinkMap.map((item) => ({
    href: item.href,
    label: item.label[locale],
    icon: item.icon,
  }));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuLabel = locale === "en" ? "Menu" : "Меню";
  const closeLabel = locale === "en" ? "Close menu" : "Закрыть меню";
  const catalogCtaLabel = tr(locale, "Catalog", "Каталог");
  const submitCtaLabel = tr(locale, "Submit", "Отправить");

  function isNavLinkActive(href: string): boolean {
    if (!pathname) {
      return false;
    }

    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    function handleEscapeKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscapeKeydown);
    return () => {
      window.removeEventListener("keydown", handleEscapeKeydown);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/60 backdrop-blur-2xl">
      <div className="mx-auto flex min-h-14 w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:min-h-16 sm:px-6 lg:px-8">
        <Link
          className="inline-flex min-h-11 items-center rounded-md text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          href="/"
        >
          <BrandLockup
            className="gap-2"
            markClassName="size-7"
            textClassName="text-sm tracking-[0.09em] sm:text-base"
          />
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                isNavLinkActive(link.href)
                  ? "bg-cyan-500/12 text-cyan-200"
                  : "text-slate-300 hover:text-white",
              )}
            >
              <link.icon aria-hidden className="size-3.5 opacity-85" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 xl:flex">
            <Link
              href="/catalog"
              className="inline-flex h-9 items-center rounded-md border border-white/15 bg-slate-900/70 px-3 text-xs font-medium text-slate-100 transition hover:bg-slate-900"
            >
              {catalogCtaLabel}
            </Link>
            <Link
              href="/submit-server"
              className="inline-flex h-9 items-center rounded-md bg-blue-500 px-3 text-xs font-semibold text-white transition hover:bg-blue-400"
            >
              {submitCtaLabel}
            </Link>
          </div>
          <button
            type="button"
            className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-white/15 bg-slate-900/70 px-3 text-slate-300 transition hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 lg:hidden"
            onClick={() => {
              setIsMobileMenuOpen((current) => !current);
            }}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-site-nav"
            aria-label={isMobileMenuOpen ? closeLabel : menuLabel}
          >
            {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            <span className="sr-only">{isMobileMenuOpen ? closeLabel : menuLabel}</span>
          </button>
          <SiteNotificationCenter locale={locale} notifications={notifications} />
          <LanguageSwitcher />
          <ThemeToggle />
          <AuthNavActions locale={locale} />
        </div>
      </div>

      {isMobileMenuOpen ? (
        <nav
          id="mobile-site-nav"
          className="border-t border-white/10 bg-slate-950/95 px-4 py-3 sm:px-6 lg:hidden"
          aria-label={locale === "en" ? "Mobile navigation" : "Мобильная навигация"}
        >
          <div className="mx-auto grid w-full max-w-7xl gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <link.icon aria-hidden className="size-4 opacity-90" />
                {link.label}
              </Link>
            ))}
            <div className="mt-2 grid gap-2 border-t border-white/10 pt-3">
              <Link
                href="/catalog"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 bg-slate-900/70 px-3 text-sm font-medium text-slate-100 transition hover:bg-slate-900"
              >
                {catalogCtaLabel}
              </Link>
              <Link
                href="/submit-server"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-500 px-3 text-sm font-semibold text-white transition hover:bg-blue-400"
              >
                {submitCtaLabel}
              </Link>
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

