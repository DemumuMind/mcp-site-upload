import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Cookie } from "lucide-react";
import { CookieSettingsPage } from "@/components/cookie-settings-page";
import { Badge } from "@/components/ui/badge";
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
    description: "Stores interface preferences like locale and consent choices.",
  },
  {
    title: "Analytics (optional)",
    description: "Used to understand usage patterns only when you allow all cookies.",
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
    <div className="relative overflow-hidden border-t border-white/10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#030711_0%,#060d1f_48%,#07091b_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px] bg-[radial-gradient(circle_at_15%_8%,rgba(56,189,248,0.2),transparent_40%),radial-gradient(circle_at_83%_8%,rgba(129,140,248,0.16),transparent_42%)]" />

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-14">
        <section className="space-y-4">
          <div className="rounded-3xl border border-cyan-400/20 bg-indigo-950/72 p-6 sm:p-8">
            <Badge className="mb-4 border-cyan-400/35 bg-cyan-500/10 text-cyan-200">
              <Cookie className="size-3" />
              {tr(locale, "Privacy controls", "Privacy controls")}
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-violet-50 sm:text-5xl">
              {tr(locale, "Cookie Settings", "Cookie Settings")}
            </h1>
            <p className="mt-4 text-sm leading-8 text-violet-200 sm:text-base">
              {tr(
                locale,
                "Choose how DemumuMind uses cookies on this browser. You can update your preference any time.",
                "Choose how DemumuMind uses cookies on this browser. You can update your preference any time.",
              )}
            </p>
          </div>

          <CookieSettingsPage />
        </section>

        <section className="space-y-4">
          <Card className="border-white/10 bg-indigo-950/76">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-violet-50">
                {tr(locale, "How cookies are used", "How cookies are used")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-7 text-violet-200">
              {cookieTypes.map((item) => (
                <div key={item.title} className="rounded-xl border border-white/10 bg-indigo-900/65 px-4 py-3">
                  <p className="font-medium text-violet-100">{item.title}</p>
                  <p className="mt-1 text-violet-300">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-indigo-950/76">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-violet-50">{tr(locale, "Related policy", "Related policy")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-violet-200">
              <Link
                href="/privacy"
                className="inline-flex items-center gap-1 text-cyan-200 underline underline-offset-2 transition hover:text-cyan-100"
              >
                {tr(locale, "Read Privacy Policy", "Read Privacy Policy")}
                <ArrowUpRight className="size-3" />
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
