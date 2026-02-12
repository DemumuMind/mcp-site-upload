import type { Metadata } from "next";

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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <div className="space-y-3">
        {sectionCopy?.eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.14em] text-blue-200 uppercase">
            {sectionCopy.eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          {sectionCopy?.heroTitle ?? "Utility Toolkit for MCP Teams"}
        </h1>
        <p className="max-w-3xl text-sm text-slate-200 sm:text-base">
          {sectionCopy?.heroDescription ??
            "Estimate prompt tokens and generate robust project rules with advanced, reusable workflows."}
        </p>
      </div>

      <ToolsWorkbench />
    </div>
  );
}
