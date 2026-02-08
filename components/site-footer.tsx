import Link from "next/link";
import { Github, MessageCircle, Send, Youtube } from "lucide-react";

import { BrandLockup } from "@/components/brand-lockup";
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

  return (
    <footer className="border-t border-white/10 bg-[linear-gradient(180deg,#030812_0%,#02060d_100%)]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="space-y-5">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-100">
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
              "РљР°С‚Р°Р»РѕРі MCP-СЃРµСЂРІРµСЂРѕРІ РѕС‚ СЃРѕРѕР±С‰РµСЃС‚РІР°: РїРѕРёСЃРє РЅР°РґРµР¶РЅС‹С… СЃРµСЂРІРµСЂРѕРІ, РїСЂРѕРІРµСЂРєР° auth/verification-СЃРёРіРЅР°Р»РѕРІ Рё РѕС‚РїСЂР°РІРєР° РёРЅС‚РµРіСЂР°С†РёР№ РЅР° РјРѕРґРµСЂР°С†РёСЋ.",
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
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-slate-900/70 text-slate-300 transition hover:border-white/25 hover:text-white"
              >
                <item.icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-xs tracking-[0.16em] text-slate-400 uppercase">
            {tr(locale, "Explore", "Р Р°Р·РґРµР»С‹")}
          </p>
          <p>
            <Link href="/catalog" className="text-slate-300 transition hover:text-white">
              {tr(locale, "Catalog", "РљР°С‚Р°Р»РѕРі")}
            </Link>
          </p>
          <p>
            <Link href="/categories" className="text-slate-300 transition hover:text-white">
              {tr(locale, "Categories", "РљР°С‚РµРіРѕСЂРёРё")}
            </Link>
          </p>
          <p>
            <Link href="/mcp" className="text-slate-300 transition hover:text-white">
              {tr(locale, "MCP Overview", "РћР±Р·РѕСЂ MCP")}
            </Link>
          </p>
          <p>
            <Link href="/tools" className="text-slate-300 transition hover:text-white">
              {tr(locale, "Tools", "РРЅСЃС‚СЂСѓРјРµРЅС‚С‹")}
            </Link>
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-xs tracking-[0.16em] text-slate-400 uppercase">
            {tr(locale, "Company", "Рћ РїСЂРѕРµРєС‚Рµ")}
          </p>
          <p>
            <Link href="/about" className="text-slate-300 transition hover:text-white">
              {tr(locale, "About Us", "Рћ РЅР°СЃ")}
            </Link>
          </p>
          <p>
            <Link href="/pricing" className="text-slate-300 transition hover:text-white">
              {tr(locale, "Pricing", "Р¦РµРЅС‹")}
            </Link>
          </p>
          <p>
            <Link href="/privacy" className="text-slate-300 transition hover:text-white">
              {tr(locale, "Privacy Policy", "РџРѕР»РёС‚РёРєР° РєРѕРЅС„РёРґРµРЅС†РёР°Р»СЊРЅРѕСЃС‚Рё")}
            </Link>
          </p>
          <p>
            <Link href="/terms" className="text-slate-300 transition hover:text-white">
              {tr(locale, "Terms of Service", "РџРѕР»СЊР·РѕРІР°С‚РµР»СЊСЃРєРѕРµ СЃРѕРіР»Р°С€РµРЅРёРµ")}
            </Link>
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-xs tracking-[0.16em] text-slate-400 uppercase">
            {tr(locale, "Community", "РЎРѕРѕР±С‰РµСЃС‚РІРѕ")}
          </p>
          <p>
            <Link href="/#submit" className="text-slate-300 transition hover:text-white">
              {tr(locale, "Submit Server", "РћС‚РїСЂР°РІРёС‚СЊ СЃРµСЂРІРµСЂ")}
            </Link>
          </p>
          <p>
            <Link href="/how-to-use" className="text-slate-300 transition hover:text-white">
              {tr(locale, "Setup Guide", "Р“Р°Р№Рґ РїРѕ РЅР°СЃС‚СЂРѕР№РєРµ")}
            </Link>
          </p>
          <p>
            <Link href="/auth" className="text-slate-300 transition hover:text-white">
              {tr(locale, "Sign In", "Р’С…РѕРґ")}
            </Link>
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-4 text-xs text-slate-500 sm:px-6 lg:px-8">
        <p>
          {tr(
            locale,
            `В© ${year} DemumuMind. All rights reserved.`,
            `В© ${year} DemumuMind. Р’СЃРµ РїСЂР°РІР° Р·Р°С‰РёС‰РµРЅС‹.`,
          )}
        </p>
        <p>{tr(locale, "Built for modern AI agent workflows.", "РЎРѕР·РґР°РЅРѕ РґР»СЏ СЃРѕРІСЂРµРјРµРЅРЅС‹С… AI-Р°РіРµРЅС‚РЅС‹С… workflow.")}</p>
      </div>
    </footer>
  );
}

