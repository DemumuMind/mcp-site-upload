import type { Metadata } from "next";
import Link from "next/link";
import { CatalogSection } from "@/components/catalog-section";
import { PageFrame, PageHero, PageMetric } from "@/components/page-templates";
import { Button } from "@/components/ui/button";
import { getCatalogSnapshot } from "@/lib/catalog/snapshot";
import { getSectionIndex, getSectionLocaleCopy } from "@/lib/content/section-index";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const sectionCopy = getSectionLocaleCopy(getSectionIndex("catalog"), locale);
    return {
        title: sectionCopy?.title ?? tr(locale, "AI Tools Directory", "AI Tools Directory"),
        description: sectionCopy?.description ??
            tr(locale, "Discover and filter MCP tools, models, and services in one directory.", "Discover and filter MCP tools, models, and services in one directory."),
    };
}
export default async function CatalogPage() {
    const locale = await getLocale();
    const sectionCopy = getSectionLocaleCopy(getSectionIndex("catalog"), locale);
    const catalogSnapshot = await getCatalogSnapshot();
    return (<PageFrame variant="directory">
      <div className="section-shell flex flex-col gap-5 py-8 sm:py-12">
        <PageHero className="space-y-4 p-5 sm:p-7" badgeTone="cyan" eyebrow={sectionCopy?.eyebrow ?? tr(locale, "Directory Control Center", "Directory Control Center")} title={sectionCopy?.heroTitle ?? tr(locale, "Find Trusted MCP Servers Faster", "Find Trusted MCP Servers Faster")} description={sectionCopy?.heroDescription ??
            tr(locale, "Search by category, auth model, and capability tags. Compare candidates side-by-side and move to integration with less rework.", "Search by category, auth model, and capability tags. Compare candidates side-by-side and move to integration with less rework.")} actions={<>
            <Button asChild className="h-10 rounded-lg px-5">
                <Link href="/submit-server">{tr(locale, "Submit server", "Submit server")}</Link>
              </Button>
            <Button asChild variant="outline" className="h-10 rounded-lg">
                <Link href="/how-to-use">{tr(locale, "Open setup guide", "Open setup guide")}</Link>
              </Button>
            </>} metrics={<>
              <PageMetric label={tr(locale, "Active servers", "Active servers")} value={catalogSnapshot.totalServers}/>
              <PageMetric label={tr(locale, "Published tools", "Published tools")} value={catalogSnapshot.totalTools}/>
              <PageMetric label={tr(locale, "Categories", "Categories")} value={catalogSnapshot.totalCategories}/>
              <PageMetric label={tr(locale, "Featured", "Featured")} value={catalogSnapshot.featuredServers.length} valueClassName="text-primary"/>
            </>}/>
        <CatalogSection initialServers={catalogSnapshot.servers}/>
      </div>
    </PageFrame>);
}
