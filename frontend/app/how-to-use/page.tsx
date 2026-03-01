import type { Metadata } from "next";
import { HowToUsePageContent } from "@/components/how-to-use/how-to-use-page-content";
import { PageFrame } from "@/components/page-templates";
import { getCatalogSnapshot } from "@/lib/catalog/snapshot";
import { getHowToUseLocaleContent } from "@/lib/content/how-to-use";
import { getSectionIndex, getSectionLocaleCopy } from "@/lib/content/section-index";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const sectionCopy = getSectionLocaleCopy(getSectionIndex("how-to-use"), locale);
    return {
        title: sectionCopy?.title ?? tr(locale, "Setup Guide", "Setup Guide"),
        description: sectionCopy?.description ??
            tr(locale, "Step-by-step setup guide for connecting MCP servers and validating tool calls.", "Step-by-step setup guide for connecting MCP servers and validating tool calls."),
    };
}
export default async function HowToUsePage() {
    const locale = await getLocale();
    const sectionCopy = getSectionLocaleCopy(getSectionIndex("how-to-use"), locale);
    const howToUseContent = getHowToUseLocaleContent(locale);
    const catalogSnapshot = await getCatalogSnapshot({ featuredLimit: 1 });
    const sampleServer = catalogSnapshot.sampleServer;
    return (<PageFrame variant="content">
      <HowToUsePageContent locale={locale} sectionCopy={sectionCopy} content={howToUseContent} sampleServerName={sampleServer?.name || "MCP Server"} sampleServerUrl={sampleServer?.serverUrl || "https://example-mcp-server.dev/sse"}/>
    </PageFrame>);
}
