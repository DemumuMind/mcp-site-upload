import Link from "next/link";
import { Github, MessageCircle, Send, Youtube } from "lucide-react";

import { BrandLockup } from "@/components/brand-lockup";
import { CookieSettingsButton } from "@/components/cookie-settings-button";
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

const footerLinkClass =
  "inline-flex min-h-11 min-w-11 items-center rounded-sm py-1 text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:min-h-0 sm:py-0";

export function SiteFooter({ locale }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[linear-gradient(180deg,#030812_0%,#02060d_100%)]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="space-y-5">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-md text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <BrandLockup
              className="gap-2.5"
              markClassName="size-8"
              textClassName="text-3xl tracking-[0.05em] sm:text-4xl"
              subtitle="MCP Directory"
            />
          </Link>
          <p className="max-w-sm text-sm text-slate-400">
            {tr(
              locale,
              "Community-curated MCP directory for discovering trusted servers, reviewing auth and verification signals, and submitting integrations.",
              "Каталог MCP-серверов от сообщества: поиск надежных серверов, проверка auth/verification-сигналов и отправка интеграций на модерацию.",
            )}
          </p>
          <div className="flex items-center gap-2">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/10 bg-slate-900/70 text-slate-300 transition hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:h-9 sm:w-9"
              >
                <item.icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-xs tracking-[0.16em] text-slate-400 uppercase">
            {tr(locale, "Explore", "Разделы")}
          </p>
          <p>
            <Link href="/catalog" className={footerLinkClass}>
              {tr(locale, "Catalog", "Каталог")}
            </Link>
          </p>
          <p>
            <Link href="/categories" className={footerLinkClass}>
              {tr(locale, "Categories", "Категории")}
            </Link>
          </p>
          <p>
            <Link href="/mcp" className={footerLinkClass}>
              {tr(locale, "MCP Overview", "Обзор MCP")}
            </Link>
          </p>
          <p>
            <Link href="/tools" className={footerLinkClass}>
              {tr(locale, "Tools", "Инструменты")}
            </Link>
          </p>
          <p>
            <Link href="/blog" className={footerLinkClass}>
              {tr(locale, "Blog", "Блог")}
            </Link>
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-xs tracking-[0.16em] text-slate-400 uppercase">
            {tr(locale, "Company", "О проекте")}
          </p>
          <p>
            <Link href="/about" className={footerLinkClass}>
              {tr(locale, "About Us", "О нас")}
            </Link>
          </p>
          <p>
            <Link href="/pricing" className={footerLinkClass}>
              {tr(locale, "Pricing", "Цены")}
            </Link>
          </p>
          <p>
            <Link href="/contact" className={footerLinkClass}>
              {tr(locale, "Contact", "Контакты")}
            </Link>
          </p>
          <p>
            <Link href="/privacy" className={footerLinkClass}>
              {tr(locale, "Privacy Policy", "Политика конфиденциальности")}
            </Link>
          </p>
          <p>
            <CookieSettingsButton label={tr(locale, "Cookie Settings", "Настройки cookie")} />
          </p>
          <p>
            <Link href="/terms" className={footerLinkClass}>
              {tr(locale, "Terms of Service", "Пользовательское соглашение")}
            </Link>
          </p>
          <p>
            <Link href="/sitemap" className={footerLinkClass}>
              {tr(locale, "Sitemap", "Карта сайта")}
            </Link>
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-xs tracking-[0.16em] text-slate-400 uppercase">
            {tr(locale, "Community", "Сообщество")}
          </p>
          <p>
            <Link href="/discord" className={footerLinkClass}>
              {tr(locale, "Discord", "Discord")}
            </Link>
          </p>
          <p>
            <Link href="/submit-server" className={footerLinkClass}>
              {tr(locale, "Submit Server", "Отправить сервер")}
            </Link>
          </p>
          <p>
            <Link href="/how-to-use" className={footerLinkClass}>
              {tr(locale, "Setup Guide", "Гайд по настройке")}
            </Link>
          </p>
          <p>
            <Link href="/auth" className={footerLinkClass}>
              {tr(locale, "Sign In", "Вход")}
            </Link>
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-4 text-xs text-slate-500 sm:px-6 lg:px-8">
        <p>
          {tr(
            locale,
            `© ${year} DemumuMind. All rights reserved.`,
            `© ${year} DemumuMind. Все права защищены.`,
          )}
        </p>
        <p>{tr(locale, "Built for modern AI agent workflows.", "Создано для современных AI-агентных workflow.")}</p>
      </div>
    </footer>
  );
}
