import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { PageActionZone, PageFrame, PageHero, PageSection, PageShell } from "@/components/page-templates";
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
    <PageFrame variant="marketing">
      <PageShell className="max-w-6xl">
      <PageHero animated={false} badgeTone="cyan" eyebrow={tr(locale, "Pricing", "Pricing")} title={tr(locale, "Two simple plans", "Two simple plans")} description={tr(locale, "Start for free or choose Pro for $3/month.", "Start for free or choose Pro for $3/month.")}/>

      <PageSection className="grid gap-4 md:grid-cols-2" aria-label={tr(locale, "Plans", "Plans")}>
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.highlighted ? "border-primary/40 bg-card" : "bg-card"}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-foreground">{tr(locale, plan.name.en, plan.name.en)}</CardTitle>
              <p className="text-xl font-semibold text-primary">{tr(locale, plan.price.en, plan.price.en)}</p>
              <p className="text-sm text-muted-foreground">{tr(locale, plan.description.en, plan.description.en)}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <div key={feature.en} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
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
      </PageSection>

      <PageActionZone className="text-center">
        <p className="text-xs text-muted-foreground">{tr(locale, "All prices are in USD.", "All prices are in USD.")}</p>
      </PageActionZone>
      </PageShell>
    </PageFrame>
  );
}
