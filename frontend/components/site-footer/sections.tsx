"use client";

import Link from "next/link";
import {
  BookOpen,
  Cpu,
  House,
  Info,
  LayoutGrid,
  LogIn,
  Mail,
  MessageCircle,
  Newspaper,
  PlusCircle,
  Tags,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { tr, type Locale } from "@/lib/i18n";

export type FooterNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  external?: boolean;
  accent?: boolean;
};

export type FooterNavSection = {
  title: string;
  items: FooterNavItem[];
};

export const footerNavSections: FooterNavSection[] = [
  {
    title: "Explore",
    items: [
      { href: "/", label: "Overview", icon: House },
      { href: "/catalog", label: "Catalog", icon: LayoutGrid },
      { href: "/categories", label: "Categories", icon: Tags },
      { href: "/tools", label: "Tools", icon: Wrench },
    ],
  },
  {
    title: "Resources",
    items: [
      { href: "/how-to-use", label: "Documentation", icon: BookOpen },
      { href: "/mcp", label: "MCP Overview", icon: Cpu },
      { href: "/blog", label: "Blog", icon: Newspaper },
      { href: "/pricing", label: "Pricing", icon: Wallet },
    ],
  },
  {
    title: "Community",
    items: [
      { href: "/about", label: "About Us", icon: Info },
      { href: "/contact", label: "Contact", icon: Mail },
      { href: "https://discord.com", label: "Discord", icon: MessageCircle, external: true },
      { href: "/submit-server", label: "Submit Your Server", icon: PlusCircle, accent: true },
      { href: "/auth", label: "Sign In", icon: LogIn },
    ],
  },
];

export const FooterLinkUnderline = () => (
  <span className="absolute inset-x-3 bottom-[5px] h-px scale-x-0 bg-primary/60 transition-transform duration-200 group-hover:scale-x-100" />
);

function FooterNavItemLink({
  locale,
  item,
  pathname,
  getLinkClass,
}: {
  locale: Locale;
  item: FooterNavItem;
  pathname: string;
  getLinkClass: (href: string) => string;
}) {
  if (item.accent) {
    return (
      <Link
        href={item.href}
        className={cn(
          "group relative flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.8rem] font-medium tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-primary",
        )}
      >
        <item.icon className="size-3.5" />
        {tr(locale, item.label, item.label)}
        <FooterLinkUnderline />
      </Link>
    );
  }

  const content = (
    <>
      <item.icon className="size-3.5 opacity-80" />
      {tr(locale, item.label, item.label)}
      <FooterLinkUnderline />
    </>
  );

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer" className={getLinkClass(item.href)}>
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} className={getLinkClass(item.href)}>
      {content}
    </Link>
  );
}

export function FooterNavColumn({
  locale,
  title,
  items,
  pathname,
  getLinkClass,
}: {
  locale: Locale;
  title: string;
  items: FooterNavItem[];
  pathname: string;
  getLinkClass: (href: string) => string;
}) {
  return (
    <div className="space-y-4 text-sm">
      <p className="px-3 text-xs tracking-[0.16em] text-muted-foreground uppercase">{tr(locale, title, title)}</p>
      <nav className="flex flex-col items-start gap-1">
        {items.map(item => (
          <FooterNavItemLink
            key={`${title}-${item.href}-${item.label}`}
            locale={locale}
            item={item}
            pathname={pathname}
            getLinkClass={getLinkClass}
          />
        ))}
      </nav>
    </div>
  );
}
