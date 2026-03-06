"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { HowToConnectSection } from "@/components/how-to-connect-section";
import { ClientReference } from "@/components/how-to-use/client-reference";
import { CtaRail } from "@/components/how-to-use/cta-rail";
import { HowToUseBackground } from "@/components/how-to-use/how-to-use-background";
import { HowToUseHero } from "@/components/how-to-use/how-to-use-hero";
import { HowToUseTroubleshootingSection } from "@/components/how-to-use/how-to-use-troubleshooting-section";
import { HowToUseTrustChecksSection } from "@/components/how-to-use/how-to-use-trust-checks-section";
import { PersonaSelector } from "@/components/how-to-use/persona-selector";
import { ScenarioSteps } from "@/components/how-to-use/scenario-steps";
import { BlurFade } from "@/components/ui/blur-fade";
import { trackConsented } from "@/lib/analytics/track-consented";
import type {
  HowToUseLocaleAction,
  HowToUseLocaleContent,
  HowToUsePersona,
} from "@/lib/content/how-to-use";
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

export function HowToUsePageContent({
  locale,
  sectionCopy,
  content,
  sampleServerName,
  sampleServerUrl,
}: HowToUsePageContentProps) {
  const defaultPersona = useMemo<HowToUsePersona>(
    () =>
      content.scenarios.find((scenario) => scenario.id === "quick_start")?.id ??
      content.scenarios[0]?.id ??
      "quick_start",
    [content.scenarios],
  );
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

  const selectedScenario =
    content.scenarios.find((scenario) => scenario.id === selectedPersona) ?? content.scenarios[0];

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

  return (
    <div className="relative overflow-hidden bg-background">
      <HowToUseBackground />
      <HowToUseHero
        locale={locale}
        sectionCopy={sectionCopy}
        secondaryLabel={content.heroActions.secondaryLabel}
        heroCatalogAction={heroCatalogAction}
        onHeroCatalogClick={() => trackCtaClick(heroCatalogAction, "hero")}
      />

      <div className="relative z-10">
        <BlurFade delay={0.2}>
          <section className="section-shell py-6 sm:py-8">
            <PersonaSelector
              title={content.scenarioSection.title}
              description={content.scenarioSection.description}
              scenarios={content.scenarios}
              selectedPersona={selectedPersona}
              chooseLabel={tr(locale, "Use this path", "Use this path")}
              selectedLabel={tr(locale, "Selected", "Selected")}
              onSelect={(persona) => {
                setSelectedPersona(persona);
                trackConsented("how_to_use_persona_selected", {
                  locale,
                  persona,
                });
              }}
            />
            {selectedScenario ? (
              <div className="pt-6 sm:pt-8">
                <ScenarioSteps
                  scenario={selectedScenario}
                  onPrimaryCtaClick={(action, persona) => trackCtaClick(action, "scenario", persona)}
                />
              </div>
            ) : null}
          </section>
        </BlurFade>

        <BlurFade delay={0.3}>
          <section className="section-shell border-t border-border/60 py-8 sm:py-10">
            <ClientReference
              title={content.clientReference.title}
              description={content.clientReference.description}
              whereLabel={content.clientReference.whereLabel}
              smokeLabel={content.clientReference.smokeLabel}
              items={content.clientReference.items}
              onClientChange={(client) => {
                trackConsented("how_to_use_client_reference_opened", {
                  locale,
                  client,
                });
              }}
            />
          </section>
        </BlurFade>

        <BlurFade delay={0.4}>
          <section className="section-shell border-t border-border/60 py-8 sm:py-10">
            <HowToConnectSection
              serverName={sampleServerName}
              serverUrl={sampleServerUrl}
              onConfigCopied={() => {
                trackConsented("how_to_use_config_copied", {
                  locale,
                  server_name: sampleServerName,
                });
              }}
            />
          </section>
        </BlurFade>

        <BlurFade delay={0.5}>
          <section className="border-t border-border/60 py-8 sm:py-10">
            <div className="section-shell">
              <HowToUseTrustChecksSection trustChecks={content.trustChecks} />
            </div>
          </section>
        </BlurFade>

        <BlurFade delay={0.6}>
          <section className="border-t border-border/60 py-8 sm:py-10">
            <div className="section-shell">
              <HowToUseTroubleshootingSection troubleshooting={content.troubleshooting} />
            </div>
          </section>
        </BlurFade>

        <BlurFade delay={0.7}>
          <section className="section-shell border-t border-border/60 pb-16 pt-8 sm:pb-20 sm:pt-10">
            <CtaRail
              title={content.ctaRail.title}
              description={content.ctaRail.description}
              actions={content.ctaRail.actions}
              onActionClick={(action) => trackCtaClick(action, "final")}
            />
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="size-4 text-primary" />
              <span>
                {tr(
                  locale,
                  "Track clicks and completion milestones in analytics to compare conversion before and after redesign.",
                  "Track clicks and completion milestones in analytics to compare conversion before and after redesign.",
                )}
              </span>
            </div>
          </section>
        </BlurFade>
      </div>
    </div>
  );
}
