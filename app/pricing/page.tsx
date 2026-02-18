import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { PageFrame } from "@/components/page-templates";
import { Button } from "@/components/ui/button";
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
      <main className="w-full bg-background">
        <section className="border-b border-blacksmith" aria-labelledby="pricing-page-heading">
          <div className="section-shell space-y-5 py-14 sm:py-20">
            <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">{tr(locale, "Pricing", "Pricing")}</p>
            <h1 id="pricing-page-heading" className="max-w-4xl font-serif text-4xl leading-tight font-semibold tracking-tight text-foreground sm:text-6xl">
              {tr(locale, "Two simple plans", "Two simple plans")}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {tr(locale, "Start for free or choose Pro for $3/month.", "Start for free or choose Pro for $3/month.")}
            </p>
          </div>
        </section>

        <section className="border-b border-blacksmith" aria-label={tr(locale, "Plans", "Plans")}>
          <div className="section-shell py-10 sm:py-14">
            <div className="grid gap-5 lg:grid-cols-2">
              {plans.map((plan) => (
                <article
                  key={plan.id}
                  className={plan.highlighted ? "rounded-md border border-primary/40 bg-card p-6" : "rounded-md border border-blacksmith bg-card p-6"}
                >
                  <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{`$ plan --tier ${plan.id}`}</p>
                  <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-foreground">{tr(locale, plan.name.en, plan.name.en)}</h2>
                  <p className="mt-1 text-2xl font-semibold text-primary">{tr(locale, plan.price.en, plan.price.en)}</p>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{tr(locale, plan.description.en, plan.description.en)}</p>

                  <ul className="mt-5 space-y-2" aria-label={`${tr(locale, plan.name.en, plan.name.en)} features`}>
                    {plan.features.map((feature) => (
                      <li key={feature.en} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                        <span>{tr(locale, feature.en, feature.en)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <Button asChild className="w-full gap-1 sm:w-auto" variant={plan.highlighted ? "default" : "outline"}>
                      <Link href={plan.ctaHref}>
                        {tr(locale, plan.ctaLabel.en, plan.ctaLabel.en)}
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-blacksmith" aria-label="Pricing footnote">
          <div className="section-shell py-6">
            <p className="text-xs text-muted-foreground">{tr(locale, "All prices are in USD.", "All prices are in USD.")}</p>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
