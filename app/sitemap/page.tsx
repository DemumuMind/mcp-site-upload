import type { Metadata } from "next";
import Link from "next/link";
import { BridgePageShell } from "@/components/bridge-page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
type LocalizedCopy = {
    en: string;
};
type SectionLink = {
    href: string;
    title: LocalizedCopy;
    description: LocalizedCopy;
};
type SiteMapSection = {
    title: LocalizedCopy;
    links: SectionLink[];
};
const sections: readonly SiteMapSection[] = [
    {
        title: {
            en: "Core Pages",
        },
        links: [
            {
                href: "/",
                title: {
                    en: "Home",
                },
                description: {
                    en: "Discover MCP workflows and start shipping integrations.",
                },
            },
            {
                href: "/about",
                title: {
                    en: "About BridgeMind",
                },
                description: {
                    en: "Mission, vision, and operating model for MCP delivery.",
                },
            },
            {
                href: "/pricing",
                title: {
                    en: "Pricing",
                },
                description: {
                    en: "Free access today with a transparent roadmap for future Pro capabilities.",
                },
            },
        ],
    },
    {
        title: {
            en: "Resources",
        },
        links: [
            {
                href: "/blog",
                title: {
                    en: "Blog",
                },
                description: {
                    en: "Articles about MCP adoption, operations, and best practices.",
                },
            },
            {
                href: "/how-to-use",
                title: {
                    en: "Setup Guide",
                },
                description: {
                    en: "Step-by-step instructions for connection and rollout.",
                },
            },
        ],
    },
    {
        title: {
            en: "Community",
        },
        links: [
            {
                href: "/discord",
                title: {
                    en: "Discord Community",
                },
                description: {
                    en: "Join the BridgeMind developer community.",
                },
            },
            {
                href: "/contact",
                title: {
                    en: "Contact",
                },
                description: {
                    en: "Get in touch with the BridgeMind team.",
                },
            },
        ],
    },
    {
        title: {
            en: "Legal",
        },
        links: [
            {
                href: "/terms",
                title: {
                    en: "Terms of Service",
                },
                description: {
                    en: "Legal terms and acceptable use policy.",
                },
            },
            {
                href: "/privacy",
                title: {
                    en: "Privacy Policy",
                },
                description: {
                    en: "Data privacy and protection information.",
                },
            },
        ],
    },
];
export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    return {
        title: tr(locale, "Sitemap", "Sitemap"),
        description: tr(locale, "Full BridgeMind site navigation.", "Full BridgeMind site navigation."),
    };
}
export default async function SitemapPage() {
    const locale = await getLocale();
    return (<div className="space-y-6 pb-12">
      <BridgePageShell eyebrow={tr(locale, "Navigation", "Navigation")} title={tr(locale, "BridgeMind Sitemap", "BridgeMind Sitemap")} description={tr(locale, "A complete index of core pages, resources, community hubs, and policy pages.", "A complete index of core pages, resources, community hubs, and policy pages.")} links={[
            {
                href: "/sitemap.xml",
                label: tr(locale, "Machine-readable sitemap.xml", "Machine-readable sitemap.xml"),
                description: tr(locale, "XML sitemap for search engines and crawlers.", "XML sitemap for search engines and crawlers."),
            },
            {
                href: "/llms.txt",
                label: tr(locale, "Machine-readable llms.txt", "Machine-readable llms.txt"),
                description: tr(locale, "Structured overview for AI assistants and LLM crawlers.", "Structured overview for AI assistants and LLM crawlers."),
            },
        ]}/>

      <div className="mx-auto grid w-full max-w-5xl gap-5 px-4 sm:px-6">
        {sections.map((section) => (<section key={section.title.en} className="space-y-3">
            <h2 className="text-xs font-semibold tracking-[0.18em] text-violet-300 uppercase">
              {tr(locale, section.title.en, section.title.en)}
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {section.links.map((item) => (<Card key={item.href} className="border-white/10 bg-indigo-900/65">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-violet-50">
                      <Link href={item.href} className="transition hover:text-white">
                        {tr(locale, item.title.en, item.title.en)}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-violet-200">
                    {tr(locale, item.description.en, item.description.en)}
                  </CardContent>
                </Card>))}
            </div>
          </section>))}
      </div>
    </div>);
}
