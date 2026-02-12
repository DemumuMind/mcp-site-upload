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
const footerLinkClass = "inline-flex min-h-11 min-w-11 items-center rounded-sm py-1 text-violet-200 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950 sm:min-h-0 sm:py-0";
export function SiteFooter({ locale }: SiteFooterProps) {
    const year = new Date().getFullYear();
    return (<footer className="border-t border-cosmic bg-[linear-gradient(180deg,rgba(9,12,34,0.92)_0%,rgba(6,8,24,0.96)_100%)]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="space-y-5">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-md text-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950">
            <BrandLockup className="gap-2.5" markClassName="size-8" textClassName="text-3xl tracking-[0.05em] sm:text-4xl" subtitle="MCP Directory"/>
          </Link>
          <p className="max-w-sm text-sm text-violet-300">
            {tr(locale, "Community-curated MCP directory for discovering trusted servers, reviewing auth and verification signals, and submitting integrations.", "Community-curated MCP directory for discovering trusted servers, reviewing auth and verification signals, and submitting integrations.")}
          </p>
          <div className="flex items-center gap-2">
            {socialLinks.map((item) => (<a key={item.label} href={item.href} target="_blank" rel="noreferrer" aria-label={item.label} className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-cosmic bg-indigo-900/70 text-violet-200 transition hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950 sm:h-9 sm:w-9">
                <item.icon className="size-4"/>
              </a>))}
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-xs tracking-[0.16em] text-violet-300 uppercase">
            {tr(locale, "Explore", "Explore")}
          </p>
          <p>
            <Link href="/catalog" className={footerLinkClass}>
              {tr(locale, "Catalog", "Catalog")}
            </Link>
          </p>
          <p>
            <Link href="/categories" className={footerLinkClass}>
              {tr(locale, "Categories", "Categories")}
            </Link>
          </p>
          <p>
            <Link href="/mcp" className={footerLinkClass}>
              {tr(locale, "MCP Overview", "MCP Overview")}
            </Link>
          </p>
          <p>
            <Link href="/tools" className={footerLinkClass}>
              {tr(locale, "Tools", "Tools")}
            </Link>
          </p>
          <p>
            <Link href="/blog" className={footerLinkClass}>
              {tr(locale, "Blog", "Blog")}
            </Link>
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-xs tracking-[0.16em] text-violet-300 uppercase">
            {tr(locale, "Company", "Company")}
          </p>
          <p>
            <Link href="/about" className={footerLinkClass}>
              {tr(locale, "About Us", "About Us")}
            </Link>
          </p>
          <p>
            <Link href="/pricing" className={footerLinkClass}>
              {tr(locale, "Pricing", "Pricing")}
            </Link>
          </p>
          <p>
            <Link href="/contact" className={footerLinkClass}>
              {tr(locale, "Contact", "Contact")}
            </Link>
          </p>
          <p>
            <Link href="/privacy" className={footerLinkClass}>
              {tr(locale, "Privacy Policy", "Privacy Policy")}
            </Link>
          </p>
          <p>
            <CookieSettingsButton label={tr(locale, "Cookie Settings", "Cookie Settings")}/>
          </p>
          <p>
            <Link href="/terms" className={footerLinkClass}>
              {tr(locale, "Terms of Service", "Terms of Service")}
            </Link>
          </p>
          <p>
            <Link href="/sitemap" className={footerLinkClass}>
              {tr(locale, "Sitemap", "Sitemap")}
            </Link>
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-xs tracking-[0.16em] text-violet-300 uppercase">
            {tr(locale, "Community", "Community")}
          </p>
          <p>
            <Link href="/discord" className={footerLinkClass}>
              {tr(locale, "Discord", "Discord")}
            </Link>
          </p>
          <p>
            <Link href="/submit-server" className={footerLinkClass}>
              {tr(locale, "Submit Server", "Submit Server")}
            </Link>
          </p>
          <p>
            <Link href="/how-to-use" className={footerLinkClass}>
              {tr(locale, "Setup Guide", "Setup Guide")}
            </Link>
          </p>
          <p>
            <Link href="/auth" className={footerLinkClass}>
              {tr(locale, "Sign In", "Sign In")}
            </Link>
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-cosmic px-4 py-4 text-xs text-violet-400 sm:px-6 lg:px-8">
        <p>
          {tr(locale, `© ${year} DemumuMind. All rights reserved.`, `© ${year} DemumuMind. All rights reserved.`)}
        </p>
        <p>{tr(locale, "Built for modern AI agent workflows.", "Built for modern AI agent workflows.")}</p>
      </div>
    </footer>);
}
