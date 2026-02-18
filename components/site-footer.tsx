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
  "inline-flex min-h-11 min-w-11 items-center rounded-sm py-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-0 sm:py-0";

export function SiteFooter({ locale }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="section-shell grid gap-10 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-5">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-md text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <BrandLockup className="gap-2.5" markClassName="size-8" textClassName="text-3xl tracking-[0.05em] sm:text-4xl" subtitle="MCP Directory" />
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
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:text-foreground"
                aria-label={item.label}
              >
                <item.icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{tr(locale, "Explore", "Explore")}</p>
          <p><Link href="/catalog" className={footerLinkClass}>{tr(locale, "Catalog", "Catalog")}</Link></p>
          <p><Link href="/categories" className={footerLinkClass}>{tr(locale, "Categories", "Categories")}</Link></p>
          <p><Link href="/mcp" className={footerLinkClass}>{tr(locale, "MCP Overview", "MCP Overview")}</Link></p>
          <p><Link href="/tools" className={footerLinkClass}>{tr(locale, "Tools", "Tools")}</Link></p>
          <p><Link href="/blog" className={footerLinkClass}>{tr(locale, "Blog", "Blog")}</Link></p>
          <p><Link href="/how-to-use" className={footerLinkClass}>{tr(locale, "Documentation", "Documentation")}</Link></p>
          <p><Link href="/privacy" className={footerLinkClass}>{tr(locale, "Security", "Security")}</Link></p>
          <p><Link href="/sitemap" className={footerLinkClass}>{tr(locale, "Status & Trust", "Status & Trust")}</Link></p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{tr(locale, "Company", "Company")}</p>
          <p><Link href="/about" className={footerLinkClass}>{tr(locale, "About Us", "About Us")}</Link></p>
          <p><Link href="/pricing" className={footerLinkClass}>{tr(locale, "Pricing", "Pricing")}</Link></p>
          <p><Link href="/contact" className={footerLinkClass}>{tr(locale, "Contact", "Contact")}</Link></p>
          <p><Link href="/privacy" className={footerLinkClass}>{tr(locale, "Privacy Policy", "Privacy Policy")}</Link></p>
          <p><CookieSettingsButton label={tr(locale, "Cookie Settings", "Cookie Settings")} /></p>
          <p><Link href="/terms" className={footerLinkClass}>{tr(locale, "Terms of Service", "Terms of Service")}</Link></p>
          <p><Link href="/sitemap" className={footerLinkClass}>{tr(locale, "Sitemap", "Sitemap")}</Link></p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{tr(locale, "Community", "Community")}</p>
          <p><Link href="/discord" className={footerLinkClass}>{tr(locale, "Discord", "Discord")}</Link></p>
          <p><Link href="/submit-server" className={footerLinkClass}>{tr(locale, "Submit Your Server", "Submit Your Server")}</Link></p>
          <p><Link href="/how-to-use" className={footerLinkClass}>{tr(locale, "Read the Setup Guide", "Read the Setup Guide")}</Link></p>
          <p><Link href="/auth" className={footerLinkClass}>{tr(locale, "Sign In", "Sign In")}</Link></p>
        </div>
      </div>

      <div className="section-shell flex flex-wrap items-center justify-between gap-3 border-t py-4 text-xs text-muted-foreground">
        <p>{tr(locale, `(c) ${year} DemumuMind. All rights reserved.`, `(c) ${year} DemumuMind. All rights reserved.`)}</p>
        <p>{tr(locale, "Built for modern AI agent workflows.", "Built for modern AI agent workflows.")}</p>
      </div>
    </footer>
  );
}

