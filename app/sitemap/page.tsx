import type { Metadata } from "next";
import Link from "next/link";

import { BridgePageShell } from "@/components/bridge-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SectionLink = {
  href: string;
  title: string;
  description: string;
};

type SiteMapSection = {
  title: string;
  links: SectionLink[];
};

const sections: readonly SiteMapSection[] = [
  {
    title: "Core Pages",
    links: [
      {
        href: "/",
        title: "Home",
        description: "Discover vibe coding and join the agentic coding revolution.",
      },
      {
        href: "/about",
        title: "About BridgeMind",
        description: "Mission, vision, and approach to vibe coding and agentic coding.",
      },
      {
        href: "/pricing",
        title: "Pricing",
        description: "Membership plans and platform access.",
      },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        href: "/blog",
        title: "Blog",
        description: "Articles on vibe coding, agentic coding, and AI development best practices.",
      },
      {
        href: "/research/leaderboards",
        title: "Research Leaderboards",
        description: "AI model performance comparisons and rankings.",
      },
    ],
  },
  {
    title: "Community",
    links: [
      {
        href: "/discord",
        title: "Discord Community",
        description: "Join the BridgeMind developer community.",
      },
    ],
  },
  {
    title: "Company",
    links: [
      {
        href: "/contact",
        title: "Contact",
        description: "Get in touch with the BridgeMind team.",
      },
    ],
  },
  {
    title: "Legal & FAQ",
    links: [
      {
        href: "/terms-of-service",
        title: "Terms of Service",
        description: "Legal terms and conditions.",
      },
      {
        href: "/privacy-policy",
        title: "Privacy Policy",
        description: "Data privacy and protection information.",
      },
    ],
  },
];

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Full BridgeMind site navigation.",
};

export default function SitemapPage() {
  return (
    <div className="space-y-6 pb-12">
      <BridgePageShell
        eyebrow="Navigation"
        title="BridgeMind Sitemap"
        description="A complete index of core pages, resources, community hubs, and policy pages."
        links={[
          {
            href: "/sitemap.xml",
            label: "Machine-readable sitemap.xml",
            description: "XML sitemap for search engines and crawlers.",
          },
          {
            href: "/llms.txt",
            label: "Machine-readable llms.txt",
            description: "Structured overview for AI assistants and LLM crawlers.",
          },
        ]}
      />

      <div className="mx-auto grid w-full max-w-5xl gap-5 px-4 sm:px-6">
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
              {section.title}
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {section.links.map((item) => (
                <Card key={item.href} className="border-white/10 bg-slate-900/65">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-slate-100">
                      <Link href={item.href} className="transition hover:text-white">
                        {item.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-300">{item.description}</CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
