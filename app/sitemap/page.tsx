import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

type SitemapGroup = {
  title: string;
  description: string;
  links: {
    href: string;
    label: string;
    hint: string;
  }[];
};

const sitemapGroups: readonly SitemapGroup[] = [
  {
    title: "Product",
    description: "Primary entry points for discovery, setup, and tooling.",
    links: [
      { href: "/", label: "Home", hint: "Core landing page and product narrative." },
      { href: "/catalog", label: "Catalog", hint: "Discover MCP servers and trust signals." },
      { href: "/categories", label: "Categories", hint: "Browse by workflow domain and stack." },
      { href: "/how-to-use", label: "How to Use", hint: "Setup and rollout playbook." },
      { href: "/tools", label: "Tools", hint: "Utilities and implementation helpers." },
      { href: "/mcp", label: "MCP Overview", hint: "Model Context Protocol background and context." },
    ],
  },
  {
    title: "Company",
    description: "Team, positioning, and support channels.",
    links: [
      { href: "/about", label: "About Us", hint: "Mission, principles, and delivery model." },
      { href: "/pricing", label: "Pricing", hint: "Current access model and roadmap." },
      { href: "/contact", label: "Contact", hint: "Support, partnerships, and community channels." },
      { href: "/discord", label: "Discord", hint: "Community collaboration and updates." },
    ],
  },
  {
    title: "Publishing and account",
    description: "Submission and account-related workflows.",
    links: [
      { href: "/submit-server", label: "Submit Server", hint: "3-step submission workflow for new MCP servers." },
      { href: "/auth", label: "Sign In", hint: "Authentication and session entry point." },
      { href: "/account", label: "Account", hint: "Submission history and moderation status." },
    ],
  },
  {
    title: "Legal and machine-readable",
    description: "Policies and crawler-facing index documents.",
    links: [
      { href: "/privacy", label: "Privacy Policy", hint: "How data is processed and protected." },
      { href: "/terms", label: "Terms of Service", hint: "Usage terms and legal boundaries." },
      { href: "/cookie-settings", label: "Cookie Settings", hint: "Consent controls and cookie preferences." },
      { href: "/sitemap.xml", label: "sitemap.xml", hint: "XML sitemap for search engines." },
      { href: "/llms.txt", label: "llms.txt", hint: "Machine-readable guide for LLM crawlers." },
    ],
  },
];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: tr(locale, "Sitemap", "Sitemap"),
    description: tr(
      locale,
      "Complete navigation index for DemumuMind, including product, legal, and machine-readable routes.",
      "Complete navigation index for DemumuMind, including product, legal, and machine-readable routes.",
    ),
  };
}

export default async function SitemapPage() {
  const locale = await getLocale();

  return (
    <div className="relative overflow-hidden border-t border-blacksmith">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#030711_0%,#060d1f_48%,#07091b_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(circle_at_18%_9%,rgba(56,189,248,0.2),transparent_40%),radial-gradient(circle_at_82%_8%,rgba(129,140,248,0.18),transparent_42%)]" />

      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="rounded-3xl border border-primary/30 bg-card p-6 sm:p-10">
          <Badge className="mb-4 border-primary/35 bg-primary/10 text-primary">
            <Compass className="size-3" />
            {tr(locale, "Navigation", "Navigation")}
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            {tr(locale, "DemumuMind Sitemap", "DemumuMind Sitemap")}
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-8 text-muted-foreground sm:text-lg">
            {tr(
              locale,
              "A full route index of the platform, grouped by product, company, account workflows, and legal pages.",
              "A full route index of the platform, grouped by product, company, account workflows, and legal pages.",
            )}
          </p>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {sitemapGroups.map((group) => (
            <Card key={group.title} className="border-blacksmith bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-foreground">{group.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{group.description}</p>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {group.links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-xl border border-blacksmith bg-card px-4 py-3 transition hover:border-primary/35 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                  >
                    <span className="flex items-center justify-between gap-2 text-sm font-medium text-foreground">
                      {item.label}
                      <ArrowUpRight className="size-4 text-primary" />
                    </span>
                    <span className="mt-1 block text-xs leading-6 text-muted-foreground">{item.hint}</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  );
}

