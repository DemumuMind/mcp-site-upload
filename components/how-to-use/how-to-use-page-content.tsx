"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ListChecks, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";
import { HowToConnectSection } from "@/components/how-to-connect-section";
import { ClientReference } from "@/components/how-to-use/client-reference";
import { CtaRail } from "@/components/how-to-use/cta-rail";
import { PersonaSelector } from "@/components/how-to-use/persona-selector";
import { ScenarioSteps } from "@/components/how-to-use/scenario-steps";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BorderBeam } from "@/components/ui/border-beam";
import { GridPattern } from "@/components/ui/grid-pattern";
import { BlurFade } from "@/components/ui/blur-fade";
import { Particles } from "@/components/ui/particles";
import { cn } from "@/lib/utils";
import { trackConsented } from "@/lib/analytics/track-consented";
import type { HowToUseLocaleAction, HowToUseLocaleContent, HowToUsePersona, } from "@/lib/content/how-to-use";
import type { SectionLocaleCopy } from "@/lib/content/section-index";
import { tr, type Locale } from "@/lib/i18n";
type HowToUsePageContentProps = {
    locale: Locale;
    sectionCopy: SectionLocaleCopy | null;
    content: HowToUseLocaleContent;
    sampleServerName: string;
    sampleServerUrl: string;
};
const scrollMilestones = [50, 75, 100] as const;
export function HowToUsePageContent({ locale, sectionCopy, content, sampleServerName, sampleServerUrl, }: HowToUsePageContentProps) {
    const defaultPersona = useMemo<HowToUsePersona>(() => content.scenarios.find((scenario) => scenario.id === "quick_start")?.id ?? content.scenarios[0]?.id ?? "quick_start", [content.scenarios]);
    const [selectedPersona, setSelectedPersona] = useState<HowToUsePersona>(defaultPersona);
    const sentMilestonesRef = useRef(new Set<number>());
    useEffect(() => {
        setSelectedPersona(defaultPersona);
    }, [defaultPersona]);
    useEffect(() => {
        function onScroll() {
            const documentElement = document.documentElement;
            const scrollRange = documentElement.scrollHeight - window.innerHeight;
            const scrollTop = window.scrollY || documentElement.scrollTop;
            const progress = scrollRange > 0 ? Math.round((scrollTop / scrollRange) * 100) : 100;
            for (const milestone of scrollMilestones) {
                if (progress >= milestone && !sentMilestonesRef.current.has(milestone)) {
                    sentMilestonesRef.current.add(milestone);
                    trackConsented("how_to_use_scroll_depth", {
                        locale,
                        milestone,
                        page: "how_to_use",
                    });
                }
            }
        }
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, [locale]);
    const selectedScenario = content.scenarios.find((scenario) => scenario.id === selectedPersona) ?? content.scenarios[0];
    function trackCtaClick(action: HowToUseLocaleAction, source: string, persona?: HowToUsePersona) {
        trackConsented("how_to_use_cta_clicked", {
            locale,
            cta_id: action.id,
            destination: action.href,
            source,
            persona,
        });
    }
    const heroCatalogAction: HowToUseLocaleAction = {
        id: "hero_catalog",
        href: "/catalog",
        label: content.heroActions.primaryLabel,
        variant: "primary",
    };
    return (<div className="relative overflow-hidden bg-background">
      {/* Background Depth & Atmospheric Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Particles
          className="absolute inset-0"
          quantity={100}
          staticity={20}
          color="#F6A623"
          size={0.8}
        />
        <GridPattern
          width={40}
          height={40}
          x={-1}
          y={-1}
          className={cn(
            "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
            "opacity-[0.03]"
          )}
        />
        {/* Ice Glow - Top Left */}
        <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 size-[600px] rounded-full bg-accent/10 blur-[120px]" />
        {/* Fire Glow - Right Center */}
        <div className="absolute top-1/3 right-0 translate-x-1/4 size-[500px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-6 pt-10 sm:px-6 sm:pt-14">
        <BlurFade delay={0.1}>
          <div className="relative overflow-hidden space-y-5 rounded-2xl border border-blacksmith bg-card/40 backdrop-blur-sm p-6 sm:p-10 shadow-2xl shadow-primary/5">
            <BorderBeam size={300} duration={12} delay={0} />
            <Badge className="w-fit border-primary/35 bg-primary/10 text-primary">
              <Sparkles className="size-3"/>
              {sectionCopy?.eyebrow ?? tr(locale, "Developer-First Onboarding", "Developer-First Onboarding")}
            </Badge>

            <div className="space-y-3">
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
                {sectionCopy?.heroTitle ?? tr(locale, "Setup Guide", "Setup Guide")}
              </h1>
              <p className="max-w-4xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {sectionCopy?.heroDescription ??
              tr(locale, "A practical playbook to connect MCP servers, validate trust and auth signals, and move to production safely.", "A practical playbook to connect MCP servers, validate trust and auth signals, and move to production safely.")}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11 rounded-md px-6 shadow-[0_0_25px_-5px_rgba(246,166,35,0.4)]">
                <Link href={heroCatalogAction.href} onClick={() => trackCtaClick(heroCatalogAction, "hero")}>
                  {heroCatalogAction.label}
                  <ArrowRight className="size-4"/>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 rounded-md border-blacksmith bg-background text-foreground hover:bg-muted/50">
                <Link href="#scenario-paths">
                  <ListChecks className="size-4"/>
                  {content.heroActions.secondaryLabel}
                </Link>
              </Button>
            </div>
          </div>
        </BlurFade>
      </section>

      <div className="relative z-10">
        <BlurFade delay={0.2}>
          <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
            <PersonaSelector title={content.scenarioSection.title} description={content.scenarioSection.description} scenarios={content.scenarios} selectedPersona={selectedPersona} chooseLabel={tr(locale, "Use this path", "Use this path")} selectedLabel={tr(locale, "Selected", "Selected")} onSelect={(persona) => {
                setSelectedPersona(persona);
                trackConsented("how_to_use_persona_selected", {
                    locale,
                    persona,
                });
            }}/>
            {selectedScenario ? (<ScenarioSteps scenario={selectedScenario} onPrimaryCtaClick={(action, persona) => trackCtaClick(action, "scenario", persona)}/>) : null}
          </section>
        </BlurFade>

        <BlurFade delay={0.3}>
          <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
            <ClientReference title={content.clientReference.title} description={content.clientReference.description} whereLabel={content.clientReference.whereLabel} smokeLabel={content.clientReference.smokeLabel} items={content.clientReference.items} onClientChange={(client) => {
                trackConsented("how_to_use_client_reference_opened", {
                    locale,
                    client,
                });
            }}/>
          </section>
        </BlurFade>

        <BlurFade delay={0.4}>
          <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
            <HowToConnectSection serverName={sampleServerName} serverUrl={sampleServerUrl} onConfigCopied={() => {
                trackConsented("how_to_use_config_copied", {
                    locale,
                    server_name: sampleServerName,
                });
            }}/>
          </section>
        </BlurFade>

        <BlurFade delay={0.5}>
          <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
            <div className="relative overflow-hidden space-y-4 rounded-2xl border border-blacksmith bg-card/40 backdrop-blur-sm p-6 sm:p-8">
              <BorderBeam size={150} duration={8} delay={5} className="opacity-50" />
              <div className="space-y-2">
                <h2 className="font-serif flex items-center gap-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  <ShieldCheck className="size-6 text-primary"/>
                  {content.trustChecks.title}
                </h2>
                <p className="text-sm leading-7 text-muted-foreground sm:text-base">{content.trustChecks.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {content.trustChecks.items.map((item) => (<Card key={item.title} className="group relative overflow-hidden border-blacksmith bg-background/50 hover:bg-muted/30 transition-colors">
                    <BorderBeam size={60} duration={10} className="opacity-0 group-hover:opacity-100" />
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-foreground">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm leading-7 text-muted-foreground">{item.description}</CardContent>
                  </Card>))}
              </div>
            </div>
          </section>
        </BlurFade>

        <BlurFade delay={0.6}>
          <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
            <div className="relative overflow-hidden space-y-4 rounded-2xl border border-blacksmith bg-card/40 backdrop-blur-sm p-6 sm:p-8">
              <div className="space-y-2">
                <h2 className="font-serif flex items-center gap-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  <TriangleAlert className="size-6 text-amber-500"/>
                  {content.troubleshooting.title}
                </h2>
                <p className="text-sm leading-7 text-muted-foreground sm:text-base">{content.troubleshooting.description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {content.troubleshooting.items.map((item) => (<Card key={item.problem} className="border-blacksmith bg-background/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-foreground">{item.problem}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm leading-7 text-muted-foreground">{item.fix}</CardContent>
                  </Card>))}
              </div>
            </div>
          </section>
        </BlurFade>

        <BlurFade delay={0.7}>
          <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
            <CtaRail title={content.ctaRail.title} description={content.ctaRail.description} actions={content.ctaRail.actions} onActionClick={(action) => trackCtaClick(action, "final")}/>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="size-4 text-primary"/>
              <span>
                {tr(locale, "Track clicks and completion milestones in analytics to compare conversion before and after redesign.", "Track clicks and completion milestones in analytics to compare conversion before and after redesign.")}
              </span>
            </div>
          </section>
        </BlurFade>
      </div>
    </div>);
}

