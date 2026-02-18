import type { Metadata } from "next";

import { PageFrame, PageShell } from "@/components/page-templates";
import { ToolsWorkbench } from "@/components/tools/tools-workbench";
import { getSectionIndex, getSectionLocaleCopy } from "@/lib/content/section-index";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const sectionCopy = getSectionLocaleCopy(getSectionIndex("tools"), await getLocale());

  return {
    title: sectionCopy?.title ?? "Tools",
    description: sectionCopy?.description ?? "Token calculator and rules generator for MCP projects.",
  };
}

export default async function ToolsPage() {
  const locale = await getLocale();
  const sectionCopy = getSectionLocaleCopy(getSectionIndex("tools"), locale);

  return (
    <PageFrame variant="content">
      <PageShell className="max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="space-y-3 rounded-3xl border border-blacksmith bg-card p-6 sm:p-8">
          {sectionCopy?.eyebrow ? (
            <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">{sectionCopy.eyebrow}</p>
          ) : null}
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {sectionCopy?.heroTitle ?? "Utility Toolkit for MCP Teams"}
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            {sectionCopy?.heroDescription ??
              "Estimate prompt tokens and generate robust project rules with advanced, reusable workflows."}
          </p>
        </section>

        <ToolsWorkbench />
      </PageShell>
    </PageFrame>
  );
}
