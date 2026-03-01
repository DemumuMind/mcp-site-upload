"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Github,
  MessageCircle,
  Send,
  Youtube,
  House,
  LayoutGrid,
  Tags,
  Cpu,
  Wrench,
  Newspaper,
  BookOpen,
  Info,
  Wallet,
  Mail,
  PlusCircle,
  LogIn
} from "lucide-react";
import { BrandLockup } from "@/components/brand-lockup";
import { CookieSettingsButton } from "@/components/cookie-settings-button";
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

const FooterLinkUnderline = () => (
  <span className="absolute inset-x-3 bottom-[5px] h-px scale-x-0 bg-primary/60 transition-transform duration-200 group-hover:scale-x-100" />
);

export function SiteFooter({ locale }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const pathname = usePathname();

  const getLinkClass = (href: string) => {
    const isActive = pathname === href;
    return cn(
      "group relative flex items-center gap-2 rounded-md border border-transparent px-3 py-1.5 text-[0.78rem] font-medium uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      isActive
        ? "border-blacksmith/70 bg-card/80 text-foreground"
        : "text-muted-foreground hover:border-blacksmith/70 hover:bg-card/70 hover:text-foreground"
    );
  };

  return (
    <footer className="relative z-10 overflow-hidden border-t border-blacksmith/80 bg-background">
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
              className="inline-flex min-h-11 items-center rounded-md border border-transparent px-1 text-foreground transition-colors hover:border-blacksmith/70 hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                  className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-blacksmith/80 bg-card/70 text-muted-foreground transition-colors hover:border-primary/60 hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={item.label}
                >
                  <item.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </BlurFade>

        <BlurFade delay={0.2} inView>
          <div className="space-y-4 text-sm">
            <p className="px-3 text-xs tracking-[0.16em] text-muted-foreground uppercase">{tr(locale, "Explore", "Explore")}</p>
            <nav className="flex flex-col items-start gap-1">
              <Link href="/" className={getLinkClass("/")}>
                <House className="size-3.5 opacity-80" />
                {tr(locale, "Overview", "Overview")}
                <FooterLinkUnderline />
              </Link>
              <Link href="/catalog" className={getLinkClass("/catalog")}>
                <LayoutGrid className="size-3.5 opacity-80" />
                {tr(locale, "Catalog", "Catalog")}
                <FooterLinkUnderline />
              </Link>
              <Link href="/categories" className={getLinkClass("/categories")}>
                <Tags className="size-3.5 opacity-80" />
                {tr(locale, "Categories", "Categories")}
                <FooterLinkUnderline />
              </Link>
              <Link href="/tools" className={getLinkClass("/tools")}>
                <Wrench className="size-3.5 opacity-80" />
                {tr(locale, "Tools", "Tools")}
                <FooterLinkUnderline />
              </Link>
            </nav>
          </div>
        </BlurFade>

        <BlurFade delay={0.3} inView>
          <div className="space-y-4 text-sm">
            <p className="px-3 text-xs tracking-[0.16em] text-muted-foreground uppercase">{tr(locale, "Resources", "Resources")}</p>
            <nav className="flex flex-col items-start gap-1">
              <Link href="/how-to-use" className={getLinkClass("/how-to-use")}>
                <BookOpen className="size-3.5 opacity-80" />
                {tr(locale, "Documentation", "Documentation")}
                <FooterLinkUnderline />
              </Link>
              <Link href="/mcp" className={getLinkClass("/mcp")}>
                <Cpu className="size-3.5 opacity-80" />
                {tr(locale, "MCP Overview", "MCP Overview")}
                <FooterLinkUnderline />
              </Link>
              <Link href="/blog" className={getLinkClass("/blog")}>
                <Newspaper className="size-3.5 opacity-80" />
                {tr(locale, "Blog", "Blog")}
                <FooterLinkUnderline />
              </Link>
              <Link href="/pricing" className={getLinkClass("/pricing")}>
                <Wallet className="size-3.5 opacity-80" />
                {tr(locale, "Pricing", "Pricing")}
                <FooterLinkUnderline />
              </Link>
            </nav>
          </div>
        </BlurFade>

        <BlurFade delay={0.4} inView>
          <div className="space-y-4 text-sm">
            <p className="px-3 text-xs tracking-[0.16em] text-muted-foreground uppercase">{tr(locale, "Community", "Community")}</p>
            <nav className="flex flex-col items-start gap-1">
              <Link href="/about" className={getLinkClass("/about")}>
                <Info className="size-3.5 opacity-80" />
                {tr(locale, "About Us", "About Us")}
                <FooterLinkUnderline />
              </Link>
              <Link href="/contact" className={getLinkClass("/contact")}>
                <Mail className="size-3.5 opacity-80" />
                {tr(locale, "Contact", "Contact")}
                <FooterLinkUnderline />
              </Link>
              <a href="https://discord.com" target="_blank" rel="noreferrer" className={getLinkClass("https://discord.com")}>
                <MessageCircle className="size-3.5 opacity-80" />
                {tr(locale, "Discord", "Discord")}
                <FooterLinkUnderline />
              </a>
              <Link
                href="/submit-server"
                className={cn(
                  "group relative flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.8rem] font-medium tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                  pathname === "/submit-server" ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                <PlusCircle className="size-3.5" />
                {tr(locale, "Submit Your Server", "Submit Your Server")}
                <FooterLinkUnderline />
              </Link>
              <Link href="/auth" className={getLinkClass("/auth")}>
                <LogIn className="size-3.5 opacity-80" />
                {tr(locale, "Sign In", "Sign In")}
                <FooterLinkUnderline />
              </Link>
            </nav>
          </div>
        </BlurFade>
      </div>

      <div className="section-shell relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-blacksmith/50 py-6 text-xs text-muted-foreground">
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
