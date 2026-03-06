import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Compass } from "lucide-react";
import { PageFrame } from "@/components/page-templates";
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
    <PageFrame>
      <main className="bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--accent)/0.14),transparent_24%),radial-gradient(circle_at_78%_18%,hsl(var(--primary)/0.14),transparent_20%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_60%)]" />
          <div className="section-shell flex min-h-[68vh] flex-col justify-center py-16 sm:py-20 lg:py-24">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-primary uppercase">
              <Compass className="size-3" />
              {tr(locale, "Navigation", "Navigation")}
            </p>
            <p className="mt-5 font-serif text-[clamp(3rem,9vw,6.5rem)] leading-none tracking-[-0.06em] text-foreground">DemumuMind</p>
            <h1 className="mt-4 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
              {tr(locale, "A readable map of the platform.", "A readable map of the platform.")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {tr(locale, "Use this index to jump directly into product surfaces, company pages, account flows, and legal routes.", "Use this index to jump directly into product surfaces, company pages, account flows, and legal routes.")}
            </p>
          </div>
        </section>

        <section>
          <div className="section-shell grid gap-10 py-16 lg:grid-cols-2">
            {sitemapGroups.map((group) => (
              <section key={group.title} className="border border-border/60 p-6 sm:p-8">
                <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">{group.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{group.description}</p>
                <div className="mt-6 border-t border-border/60">
                  {group.links.map((item) => (
                    <Link key={item.href} href={item.href} className="flex items-start justify-between gap-3 border-b border-border/60 py-4 transition-colors hover:text-primary">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="mt-1 text-xs leading-6 text-muted-foreground">{item.hint}</p>
                      </div>
                      <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-primary" />
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
