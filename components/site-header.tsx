import Link from "next/link";

import { AuthNavActions } from "@/components/auth-nav-actions";
import { BrandLockup } from "@/components/brand-lockup";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Locale } from "@/lib/i18n";

const navLinkMap = [
  { href: "/", label: { en: "Overview", ru: "Обзор" } },
  { href: "/catalog", label: { en: "Catalog", ru: "Каталог" } },
  { href: "/how-to-use", label: { en: "Setup", ru: "Настройка" } },
  { href: "/tools", label: { en: "Tools", ru: "Инструменты" } },
  { href: "/mcp", label: { en: "MCP", ru: "MCP" } },
  { href: "/pricing", label: { en: "Pricing", ru: "Цены" } },
] as const;

type SiteHeaderProps = {
  locale: Locale;
};

export function SiteHeader({ locale }: SiteHeaderProps) {
  const navLinks = navLinkMap.map((item) => ({
    href: item.href,
    label: item.label[locale],
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/60 backdrop-blur-2xl">
      <div className="mx-auto flex min-h-14 w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:min-h-16 sm:px-6 lg:px-8">
        <Link className="inline-flex items-center text-slate-100" href="/">
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
              className="text-xs tracking-wide text-slate-300 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <AuthNavActions locale={locale} />
        </div>
      </div>
    </header>
  );
}
