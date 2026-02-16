import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    <div className="relative overflow-hidden border-t border-blacksmith">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#030711_0%,#050b1c_48%,#07091a_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_22%_8%,rgba(56,189,248,0.2),transparent_42%),radial-gradient(circle_at_78%_4%,rgba(99,102,241,0.17),transparent_38%)]" />

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8 lg:py-14">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-primary/30 bg-card p-4">
            <Badge className="mb-3 border-primary/35 bg-primary/10 text-primary">
              <Scale className="size-3" />
              {tr(locale, "Legal", "Legal")}
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {tr(locale, "Terms of Service", "Terms of Service")}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {tr(locale, "Last updated", "Last updated")}: {updatedLabel}
            </p>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {tr(
                locale,
                "Global baseline terms with U.S. (Delaware) governing law and venue.",
                "Global baseline terms with U.S. (Delaware) governing law and venue.",
              )}
            </p>
          </div>

          <Card className="border-blacksmith bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm tracking-[0.13em] text-muted-foreground uppercase">
                {tr(locale, "Contents", "Contents")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {termsV2Sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-md px-2 py-1.5 text-muted-foreground transition hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                >
                  {section.title}
                </a>
              ))}
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-6">
          <div className="rounded-2xl border border-blacksmith bg-card p-5">
            <p className="text-sm leading-7 text-muted-foreground">
              {tr(
                locale,
                "Please read these Terms carefully. They describe your rights, responsibilities, and key limits when using DemumuMind MCP.",
                "Please read these Terms carefully. They describe your rights, responsibilities, and key limits when using DemumuMind MCP.",
              )}
            </p>
          </div>

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

          <Card className="border-amber-300/30 bg-amber-500/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-amber-100">
                {tr(locale, "Important legal notice", "Important legal notice")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-amber-50/95">
              <p>
                {tr(
                  locale,
                  "This document is a platform baseline and does not constitute legal advice. You should consult qualified counsel before relying on these Terms for production legal use.",
                  "This document is a platform baseline and does not constitute legal advice. You should consult qualified counsel before relying on these Terms for production legal use.",
                )}
              </p>
              <p>
                {tr(locale, "Contact", "Contact")}:{" "}
                <Link
                  href={`mailto:${legalEmail}`}
                  className="inline-flex items-center gap-1 text-amber-100 underline underline-offset-2 transition hover:text-foreground"
                >
                  {legalEmail}
                  <ArrowUpRight className="size-3" />
                </Link>
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}


