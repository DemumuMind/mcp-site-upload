import type { Metadata } from "next";
import { PageFrame } from "@/components/page-templates";
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
      <main className="bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_24%),radial-gradient(circle_at_82%_18%,hsl(var(--accent)/0.12),transparent_20%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_60%)]" />
          <div className="section-shell flex min-h-[62vh] flex-col justify-center py-16 sm:py-20">
            {sectionCopy?.eyebrow ? (
              <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">{sectionCopy.eyebrow}</p>
            ) : null}
            <h1 className="mt-4 max-w-4xl font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {sectionCopy?.heroTitle ?? "Utility toolkit for MCP teams"}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {sectionCopy?.heroDescription ??
                "Estimate prompt tokens and generate robust project rules with advanced, reusable workflows."}
            </p>
          </div>
        </section>

        <section>
          <div className="section-shell py-12 sm:py-16">
            <div className="border border-border/60 p-4 sm:p-6">
              <ToolsWorkbench />
            </div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
