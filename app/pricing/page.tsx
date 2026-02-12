import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "Pricing", "Pricing"),
    description: tr(locale, "Choose between the free plan and Pro plan for $3/month.", "Choose between the free plan and Pro plan for $3/month."),
  };
}

type LocalizedText = {
  en: string;
};

type PlanCard = {
  id: string;
  name: LocalizedText;
  price: LocalizedText;
  description: LocalizedText;
  features: LocalizedText[];
  ctaLabel: LocalizedText;
  ctaHref: string;
  highlighted?: boolean;
};

export default async function PricingPage() {
  const locale = await getLocale();

  const plans: PlanCard[] = [
    {
      id: "free",
      name: { en: "Free" },
      price: { en: "$0/month" },
      description: { en: "Everything you need to browse and submit MCP servers." },
      features: [
        { en: "Full access to MCP catalog and filters" },
        { en: "Submit servers after authorization" },
        { en: "Core features stay free" },
      ],
      ctaLabel: { en: "Open catalog" },
      ctaHref: "/catalog",
    },
    {
      id: "pro",
      name: { en: "Pro" },
      price: { en: "$3/month" },
      description: { en: "For users who need more speed and extended capabilities." },
      features: [
        { en: "Priority support" },
        { en: "Advanced workflow options" },
        { en: "Early access to new premium tools" },
      ],
      ctaLabel: { en: "Upgrade to Pro" },
      ctaHref: "/auth",
      highlighted: true,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
      <section className="space-y-3 rounded-2xl border border-white/10 bg-indigo-900/65 p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.14em] text-cyan-300 uppercase">{tr(locale, "Pricing", "Pricing")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-violet-50 sm:text-4xl">{tr(locale, "Two simple plans", "Two simple plans")}</h1>
        <p className="max-w-3xl text-sm text-violet-200 sm:text-base">
          {tr(locale, "Start for free or choose Pro for $3/month.", "Start for free or choose Pro for $3/month.")}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2" aria-label={tr(locale, "Plans", "Plans")}>
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.highlighted ? "border-cyan-400/40 bg-indigo-900/75" : "border-white/10 bg-indigo-900/65"}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-violet-50">{tr(locale, plan.name.en, plan.name.en)}</CardTitle>
              <p className="text-xl font-semibold text-cyan-300">{tr(locale, plan.price.en, plan.price.en)}</p>
              <p className="text-sm text-violet-200">{tr(locale, plan.description.en, plan.description.en)}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-violet-200">
                {plan.features.map((feature) => (
                  <div key={feature.en} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-cyan-300" />
                    <p>{tr(locale, feature.en, feature.en)}</p>
                  </div>
                ))}
              </div>

              <Button asChild className="w-full gap-1">
                <Link href={plan.ctaHref}>
                  {tr(locale, plan.ctaLabel.en, plan.ctaLabel.en)}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <p className="text-center text-xs text-violet-300/80">{tr(locale, "All prices are in USD.", "All prices are in USD.")}</p>
    </div>
  );
}