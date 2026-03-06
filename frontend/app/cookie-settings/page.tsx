import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageFrame } from "@/components/page-templates";
import { CookieSettingsPage } from "@/components/cookie-settings-page";
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
      <main className="bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--accent)/0.14),transparent_24%),radial-gradient(circle_at_82%_18%,hsl(var(--primary)/0.14),transparent_20%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_60%)]" />
          <div className="section-shell flex min-h-[60vh] flex-col justify-center py-16 sm:py-20">
            <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">{tr(locale, "Privacy controls", "Privacy controls")}</p>
            <h1 className="mt-4 max-w-4xl font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {tr(locale, "Cookie Settings", "Cookie Settings")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {tr(locale, "Choose how DemumuMind uses cookies on this browser. You can update your preference any time.", "Choose how DemumuMind uses cookies on this browser. You can update your preference any time.")}
            </p>
          </div>
        </section>

        <section>
          <div className="section-shell grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="border border-border/60 p-4 sm:p-6">
              <CookieSettingsPage />
            </div>

            <div className="space-y-6">
              <section className="border border-border/60 p-6 sm:p-8">
                <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">{tr(locale, "How cookies are used", "How cookies are used")}</p>
                <div className="mt-6 border-y border-border/60">
                  {cookieTypes.map((item) => (
                    <div key={item.title} className="border-b border-border/60 py-4 last:border-b-0">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="border border-border/60 p-6 sm:p-8">
                <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">{tr(locale, "Related policy", "Related policy")}</p>
                <Link href="/privacy" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-transform hover:translate-x-1">
                  {tr(locale, "Read Privacy Policy", "Read Privacy Policy")}
                  <ArrowUpRight className="size-3" />
                </Link>
              </section>
            </div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
