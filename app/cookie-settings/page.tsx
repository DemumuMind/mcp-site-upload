import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageFrame, PageHero, PageSection, PageShell } from "@/components/page-templates";
import { CookieSettingsPage } from "@/components/cookie-settings-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

const cookieTypes = [
  {
    title: "Strictly necessary",
    description: "Required for core navigation, login state, and basic platform functionality.",
  },
  {
    title: "Preference and UX",
    description: "Stores optional interface preferences and user experience personalization.",
  },
  {
    title: "Analytics (optional)",
    description: "Used only if analytics is enabled in your cookie preferences.",
  },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: tr(locale, "Cookie Settings", "Cookie Settings"),
    description: tr(
      locale,
      "Review and update cookie consent preferences for DemumuMind.",
      "Review and update cookie consent preferences for DemumuMind.",
    ),
  };
}

export default async function CookieSettingsRoute() {
  const locale = await getLocale();

  return (
    <PageFrame variant="content">
      <PageShell className="max-w-7xl gap-6 px-4 sm:px-6 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <section className="space-y-4">
          <PageHero surface="editorial"
            animated={false}
            badgeTone="violet"
            eyebrow={tr(locale, "Privacy controls", "Privacy controls")}
            title={tr(locale, "Cookie Settings", "Cookie Settings")}
            description={tr(
              locale,
              "Choose how DemumuMind uses cookies on this browser. You can update your preference any time.",
              "Choose how DemumuMind uses cookies on this browser. You can update your preference any time.",
            )}
          />

          <PageSection surface="editorial">
            <CookieSettingsPage />
          </PageSection>
        </section>

        <section className="space-y-4">
          <Card className="border-blacksmith bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-foreground">{tr(locale, "How cookies are used", "How cookies are used")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
              {cookieTypes.map((item) => (
                <div key={item.title} className="rounded-xl border border-blacksmith bg-card px-4 py-3">
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-blacksmith bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-foreground">{tr(locale, "Related policy", "Related policy")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-muted-foreground">
              <Link href="/privacy" className="inline-flex items-center gap-1 text-primary underline underline-offset-2 transition hover:text-primary">
                {tr(locale, "Read Privacy Policy", "Read Privacy Policy")}
                <ArrowUpRight className="size-3" />
              </Link>
            </CardContent>
          </Card>
        </section>
      </PageShell>
    </PageFrame>
  );
}
