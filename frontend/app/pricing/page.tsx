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
      <main className="bg-background text-foreground">
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_24%),radial-gradient(circle_at_78%_20%,hsl(var(--accent)/0.16),transparent_20%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_62%)]" />
          <div className="section-shell flex min-h-[68vh] flex-col justify-center py-16 sm:py-20 lg:py-24">
            <p className="text-xs font-semibold tracking-[0.22em] text-primary uppercase">{tr(locale, "Pricing", "Pricing")}</p>
            <p className="mt-5 font-serif text-[clamp(3.2rem,10vw,7rem)] leading-none tracking-[-0.06em] text-foreground">DemumuMind</p>
            <h1 id="pricing-page-heading" className="mt-4 max-w-4xl text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
              {tr(locale, "Two plans. One catalog. No pricing maze.", "Two plans. One catalog. No pricing maze.")}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {tr(locale, "Start free for discovery and submissions, or move to Pro when your team needs faster support and premium tooling.", "Start free for discovery and submissions, or move to Pro when your team needs faster support and premium tooling.")}
            </p>
          </div>
        </section>

        <section className="border-b border-border/60" aria-label={tr(locale, "Plans", "Plans")}>
          <div className="section-shell py-16 sm:py-20">
            <div className="grid gap-0 border border-border/60 lg:grid-cols-2">
              {plans.map((plan) => (
                <article key={plan.id} className={plan.highlighted ? "bg-[linear-gradient(180deg,hsl(var(--primary)/0.08),transparent_36%)] px-6 py-8 sm:px-8" : "bg-background px-6 py-8 sm:px-8"}>
                  <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">{`$ plan --tier ${plan.id}`}</p>
                  <h2 className="mt-5 font-serif text-4xl font-semibold tracking-tight text-foreground">{tr(locale, plan.name.en, plan.name.en)}</h2>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-primary">{tr(locale, plan.price.en, plan.price.en)}</p>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">{tr(locale, plan.description.en, plan.description.en)}</p>

                  <div className="mt-8 border-t border-border/60 pt-5">
                    <ul className="space-y-3" aria-label={`${tr(locale, plan.name.en, plan.name.en)} features`}>
                      {plan.features.map((feature) => (
                        <li key={feature.en} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                          <span>{tr(locale, feature.en, feature.en)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8">
                    <Button asChild className="gap-1 rounded-none px-6" size="lg" variant={plan.highlighted ? "default" : "outline"}>
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

        <section>
          <div className="section-shell py-8">
            <p className="text-xs text-muted-foreground">{tr(locale, "All prices are in USD.", "All prices are in USD.")}</p>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
