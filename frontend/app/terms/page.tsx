import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageFrame } from "@/components/page-templates";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { legalEmail } from "@/lib/legal-content";
import { termsV2LastUpdatedIso, termsV2Sections } from "@/lib/legal/terms-v2";

function getTermsLastUpdatedLabel() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(termsV2LastUpdatedIso));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: tr(locale, "Terms of Service", "Terms of Service"),
    description: tr(
      locale,
      "Legal terms for using DemumuMind MCP, including service scope, acceptable use, and governing law.",
      "Legal terms for using DemumuMind MCP, including service scope, acceptable use, and governing law.",
    ),
  };
}

export default async function TermsPage() {
  const locale = await getLocale();
  const updatedLabel = getTermsLastUpdatedLabel();

  return (
    <PageFrame variant="content">
      <main className="bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_24%),radial-gradient(circle_at_82%_18%,hsl(var(--accent)/0.12),transparent_20%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_60%)]" />
          <div className="section-shell flex min-h-[60vh] flex-col justify-center py-16 sm:py-20">
            <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">{tr(locale, "Legal", "Legal")}</p>
            <h1 className="mt-4 max-w-4xl font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {tr(locale, "Terms of Service", "Terms of Service")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {`${tr(locale, "Last updated", "Last updated")}: ${updatedLabel}`}
            </p>
          </div>
        </section>

        <section>
          <div className="section-shell grid gap-10 py-12 sm:py-16 lg:grid-cols-[280px_1fr] lg:items-start">
            <aside className="border border-border/60 p-6 lg:sticky lg:top-24">
              <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">{tr(locale, "Contents", "Contents")}</p>
              <div className="mt-4 space-y-2 text-sm">
                {termsV2Sections.map((section) => (
                  <a key={section.id} href={`#${section.id}`} className="block py-1.5 text-muted-foreground transition hover:text-foreground">
                    {section.title}
                  </a>
                ))}
              </div>
            </aside>

            <div className="space-y-8">
              <section className="border-t border-border/60 pt-8">
                <p className="text-sm leading-7 text-muted-foreground">
                  {tr(locale, "Please read these Terms carefully. They describe your rights, responsibilities, and key limits when using DemumuMind MCP.", "Please read these Terms carefully. They describe your rights, responsibilities, and key limits when using DemumuMind MCP.")}
                </p>
              </section>

              {termsV2Sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-24 border-t border-border/60 pt-8">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{section.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.summary}</p>
                  <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground sm:text-base">
                    {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    {section.bullets ? (
                      <ul className="space-y-2 pl-5">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="list-disc marker:text-primary">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </section>
              ))}

              <section className="border-t border-border/60 pt-8">
                <h3 className="text-lg font-semibold text-foreground">{tr(locale, "Important legal notice", "Important legal notice")}</h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {tr(locale, "This document is a platform baseline and does not constitute legal advice. You should consult qualified counsel before relying on these Terms for production legal use.", "This document is a platform baseline and does not constitute legal advice. You should consult qualified counsel before relying on these Terms for production legal use.")}
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  {tr(locale, "Contact", "Contact")}: {" "}
                  <Link href={`mailto:${legalEmail}`} className="inline-flex items-center gap-1 text-primary underline underline-offset-2 transition hover:text-foreground">
                    {legalEmail}
                    <ArrowUpRight className="size-3" />
                  </Link>
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
