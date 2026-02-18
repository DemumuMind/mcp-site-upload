import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageActionZone, PageFrame, PageHero, PageSection, PageShell } from "@/components/page-templates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <PageShell className="max-w-7xl gap-8 px-4 sm:px-6 lg:grid lg:grid-cols-[280px_1fr] lg:px-8">
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <PageHero surface="rail"
            animated={false}
            badgeTone="violet"
            eyebrow={tr(locale, "Legal", "Legal")}
            title={tr(locale, "Terms of Service", "Terms of Service")}
            description={`${tr(locale, "Last updated", "Last updated")}: ${updatedLabel}`}
          />
          <PageSection surface="rail">
            <h2 className="text-sm tracking-[0.13em] text-muted-foreground uppercase">{tr(locale, "Contents", "Contents")}</h2>
            <div className="mt-2 space-y-2 text-sm">
              {termsV2Sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-md px-2 py-1.5 text-muted-foreground transition hover:bg-card hover:text-foreground"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </PageSection>
        </div>

        <section className="space-y-6">
          <PageSection surface="rail">
            <p className="text-sm leading-7 text-muted-foreground">
              {tr(
                locale,
                "Please read these Terms carefully. They describe your rights, responsibilities, and key limits when using DemumuMind MCP.",
                "Please read these Terms carefully. They describe your rights, responsibilities, and key limits when using DemumuMind MCP.",
              )}
            </p>
          </PageSection>

          {termsV2Sections.map((section) => (
            <Card key={section.id} id={section.id} className="scroll-mt-24 border-blacksmith bg-card">
              <CardHeader className="space-y-2 pb-2">
                <CardTitle className="text-xl text-foreground">{section.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{section.summary}</p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground sm:text-base">
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
              </CardContent>
            </Card>
          ))}

          <PageActionZone className="space-y-3 border-amber-300/30 bg-amber-500/10">
            <h3 className="text-lg text-amber-100">{tr(locale, "Important legal notice", "Important legal notice")}</h3>
            <p className="text-sm leading-7 text-amber-50/95">
              {tr(
                locale,
                "This document is a platform baseline and does not constitute legal advice. You should consult qualified counsel before relying on these Terms for production legal use.",
                "This document is a platform baseline and does not constitute legal advice. You should consult qualified counsel before relying on these Terms for production legal use.",
              )}
            </p>
            <p className="text-sm text-amber-50/95">
              {tr(locale, "Contact", "Contact")}: {" "}
              <Link href={`mailto:${legalEmail}`} className="inline-flex items-center gap-1 text-amber-100 underline underline-offset-2 transition hover:text-foreground">
                {legalEmail}
                <ArrowUpRight className="size-3" />
              </Link>
            </p>
          </PageActionZone>
        </section>
      </PageShell>
    </PageFrame>
  );
}

