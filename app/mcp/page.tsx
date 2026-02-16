import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSectionIndex, getSectionLocaleCopy } from "@/lib/content/section-index";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const sectionCopy = getSectionLocaleCopy(getSectionIndex("mcp"), locale);
    return {
        title: sectionCopy?.title ?? tr(locale, "MCP Overview", "MCP Overview"),
        description: sectionCopy?.description ??
            tr(locale, "Overview of DemumuMind MCP and how it helps teams.", "Overview of DemumuMind MCP and how it helps teams."),
    };
}
export default async function MCPPage() {
    const locale = await getLocale();
    const sectionCopy = getSectionLocaleCopy(getSectionIndex("mcp"), locale);
    const highlights = [
        {
            title: tr(locale, "Unified Catalog", "Unified Catalog"),
            description: tr(locale, "Discover MCP servers in one curated searchable directory.", "Discover MCP servers in one curated searchable directory."),
            icon: Sparkles,
        },
        {
            title: tr(locale, "Trust Signals", "Trust Signals"),
            description: tr(locale, "Track verification and auth type before connecting a server.", "Track verification and auth type before connecting a server."),
            icon: ShieldCheck,
        },
        {
            title: tr(locale, "Fast Integration", "Fast Integration"),
            description: tr(locale, "Copy-ready server config and clear maintainer metadata.", "Copy-ready server config and clear maintainer metadata."),
            icon: CheckCircle2,
        },
    ];
    return (<div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <section className="space-y-3 rounded-2xl border border-blacksmith bg-card p-6 sm:p-8">
        {sectionCopy?.eyebrow ? (<p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            {sectionCopy.eyebrow}
          </p>) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {sectionCopy?.heroTitle ?? "MCP"}
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {sectionCopy?.heroDescription ??
            tr(locale, "Discover verified and community MCP servers, inspect tool capabilities, and connect them to your AI workflows.", "Discover verified and community MCP servers, inspect tool capabilities, and connect them to your AI workflows.")}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild className="bg-blue-500 hover:bg-blue-400">
            <Link href="/catalog">
              {tr(locale, "Browse catalog", "Browse catalog")}
              <ArrowRight className="size-4"/>
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-blacksmith bg-card hover:bg-accent">
            <Link href="/how-to-use">{tr(locale, "Open setup guide", "Open setup guide")}</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="MCP highlights">
        {highlights.map((item) => (<Card key={item.title} className="border-blacksmith bg-card shadow-[0_0_0_1px_rgba(148,163,184,0.07)] backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <item.icon className="size-4 text-blue-400"/>
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{item.description}</CardContent>
          </Card>))}
      </section>
    </div>);
}


