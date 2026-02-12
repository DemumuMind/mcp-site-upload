"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ListChecks,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { HowToConnectSection } from "@/components/how-to-connect-section";
import { ClientReference } from "@/components/how-to-use/client-reference";
import { CtaRail } from "@/components/how-to-use/cta-rail";
import { PersonaSelector } from "@/components/how-to-use/persona-selector";
import { ScenarioSteps } from "@/components/how-to-use/scenario-steps";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    () => content.scenarios.find((scenario) => scenario.id === "quick_start")?.id ?? content.scenarios[0]?.id ?? "quick_start",
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
    <div className="relative overflow-hidden border-t border-white/10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#02070f_0%,#030a15_42%,#050814_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_14%_4%,rgba(56,189,248,0.28),transparent_42%),radial-gradient(circle_at_84%_6%,rgba(59,130,246,0.18),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(56,189,248,0.06)_1px,transparent_1px),linear-gradient(rgba(56,189,248,0.05)_1px,transparent_1px)] bg-[size:42px_42px] opacity-30" />

      <section className="mx-auto w-full max-w-6xl px-4 pb-6 pt-10 sm:px-6 sm:pt-14">
        <div className="space-y-5 rounded-3xl border border-cyan-400/25 bg-slate-950/72 p-6 sm:p-10">
          <Badge className="w-fit border-cyan-400/35 bg-cyan-500/10 text-cyan-200">
            <Sparkles className="size-3" />
            {sectionCopy?.eyebrow ?? tr(locale, "Developer-First Onboarding", "Developer-first онбординг")}
          </Badge>

          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-100 sm:text-6xl">
              {sectionCopy?.heroTitle ?? tr(locale, "Setup Guide", "Гайд по настройке")}
            </h1>
            <p className="max-w-4xl text-base leading-8 text-slate-300 sm:text-lg">
              {sectionCopy?.heroDescription ??
                tr(
                  locale,
                  "A practical playbook to connect MCP servers, validate trust and auth signals, and move to production safely.",
                  "Практический гайд по подключению MCP-серверов, проверке trust/auth-сигналов и безопасному выходу в production.",
                )}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-11 rounded-xl bg-blue-500 px-6 text-white hover:bg-blue-400">
              <Link href={heroCatalogAction.href} onClick={() => trackCtaClick(heroCatalogAction, "hero")}>
                {heroCatalogAction.label}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl border-white/20 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
            >
              <Link href="#scenario-paths">
                <ListChecks className="size-4" />
                {content.heroActions.secondaryLabel}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <PersonaSelector
          title={content.scenarioSection.title}
          description={content.scenarioSection.description}
          scenarios={content.scenarios}
          selectedPersona={selectedPersona}
          chooseLabel={tr(locale, "Use this path", "Выбрать сценарий")}
          selectedLabel={tr(locale, "Selected", "Выбрано")}
          onSelect={(persona) => {
            setSelectedPersona(persona);
            trackConsented("how_to_use_persona_selected", {
              locale,
              persona,
            });
          }}
        />
        {selectedScenario ? (
          <ScenarioSteps
            scenario={selectedScenario}
            onPrimaryCtaClick={(action, persona) => trackCtaClick(action, "scenario", persona)}
          />
        ) : null}
      </section>

      <section className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
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

      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
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

      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/72 p-6 sm:p-8">
          <div className="space-y-2">
            <h2 className="flex items-center gap-2 text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
              <ShieldCheck className="size-6 text-cyan-300" />
              {content.trustChecks.title}
            </h2>
            <p className="text-sm leading-7 text-slate-300 sm:text-base">{content.trustChecks.description}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {content.trustChecks.items.map((item) => (
              <Card key={item.title} className="border-white/10 bg-slate-900/70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-slate-100">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-7 text-slate-300">{item.description}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/72 p-6 sm:p-8">
          <div className="space-y-2">
            <h2 className="flex items-center gap-2 text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
              <TriangleAlert className="size-6 text-amber-300" />
              {content.troubleshooting.title}
            </h2>
            <p className="text-sm leading-7 text-slate-300 sm:text-base">{content.troubleshooting.description}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {content.troubleshooting.items.map((item) => (
              <Card key={item.problem} className="border-white/10 bg-slate-900/70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-slate-100">{item.problem}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-7 text-slate-300">{item.fix}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        <CtaRail
          title={content.ctaRail.title}
          description={content.ctaRail.description}
          actions={content.ctaRail.actions}
          onActionClick={(action) => trackCtaClick(action, "final")}
        />
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <CheckCircle2 className="size-4 text-emerald-300" />
          <span>
            {tr(
              locale,
              "Track clicks and completion milestones in analytics to compare conversion before and after redesign.",
              "Отслеживайте клики и этапы прохождения в аналитике, чтобы сравнить конверсию до и после редизайна.",
            )}
          </span>
        </div>
      </section>
    </div>
  );
}
