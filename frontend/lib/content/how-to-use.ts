import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { Locale } from "@/lib/i18n";
const localizedTextSchema = z.object({
    en: z.string().trim().min(1),
});
const personaSchema = z.enum(["quick_start", "production_ready"]);
const ctaIdSchema = z.enum([
    "hero_catalog",
    "scenario_catalog",
    "final_catalog",
    "final_submit",
]);
const ctaVariantSchema = z.enum(["primary", "secondary"]);
const scenarioStepSchema = z.object({
    title: localizedTextSchema,
    description: localizedTextSchema,
});
const scenarioSchema = z.object({
    id: personaSchema,
    badge: localizedTextSchema,
    title: localizedTextSchema,
    description: localizedTextSchema,
    stepsTitle: localizedTextSchema,
    steps: z.array(scenarioStepSchema).min(3),
    checklistTitle: localizedTextSchema,
    checklistItems: z.array(localizedTextSchema).min(2),
    primaryCta: z.object({
        id: ctaIdSchema,
        label: localizedTextSchema,
        href: z.string().trim().min(1),
    }),
});
const clientReferenceItemSchema = z.object({
    client: z.string().trim().min(1),
    badge: localizedTextSchema,
    where: localizedTextSchema,
    smoke: localizedTextSchema,
});
const safetyCheckSchema = z.object({
    title: localizedTextSchema,
    description: localizedTextSchema,
});
const troubleshootingItemSchema = z.object({
    problem: localizedTextSchema,
    fix: localizedTextSchema,
});
const actionSchema = z.object({
    id: ctaIdSchema,
    label: localizedTextSchema,
    href: z.string().trim().min(1),
    variant: ctaVariantSchema,
});
const howToUsePathsSchema = z.object({
    heroActions: z.object({
        primaryLabel: localizedTextSchema,
        secondaryLabel: localizedTextSchema,
    }),
    scenarioSection: z.object({
        title: localizedTextSchema,
        description: localizedTextSchema,
    }),
    scenarios: z.array(scenarioSchema).length(2),
    clientReference: z.object({
        title: localizedTextSchema,
        description: localizedTextSchema,
        whereLabel: localizedTextSchema,
        smokeLabel: localizedTextSchema,
        items: z.array(clientReferenceItemSchema).min(1),
    }),
    trustChecks: z.object({
        title: localizedTextSchema,
        description: localizedTextSchema,
        items: z.array(safetyCheckSchema).min(2),
    }),
    troubleshooting: z.object({
        title: localizedTextSchema,
        description: localizedTextSchema,
        items: z.array(troubleshootingItemSchema).min(2),
    }),
    ctaRail: z.object({
        title: localizedTextSchema,
        description: localizedTextSchema,
        actions: z.array(actionSchema).min(2),
    }),
});
type HowToUsePaths = z.infer<typeof howToUsePathsSchema>;
type LocalizedText = z.infer<typeof localizedTextSchema>;
export type HowToUsePersona = z.infer<typeof personaSchema>;
export type HowToUseCtaId = z.infer<typeof ctaIdSchema>;
export type HowToUseCtaVariant = z.infer<typeof ctaVariantSchema>;
export type HowToUseLocaleAction = {
    id: HowToUseCtaId;
    label: string;
    href: string;
    variant: HowToUseCtaVariant;
};
export type HowToUseLocaleScenario = {
    id: HowToUsePersona;
    badge: string;
    title: string;
    description: string;
    stepsTitle: string;
    steps: Array<{
        title: string;
        description: string;
    }>;
    checklistTitle: string;
    checklistItems: string[];
    primaryCta: HowToUseLocaleAction;
};
export type HowToUseLocaleContent = {
    heroActions: {
        primaryLabel: string;
        secondaryLabel: string;
    };
    scenarioSection: {
        title: string;
        description: string;
    };
    scenarios: HowToUseLocaleScenario[];
    clientReference: {
        title: string;
        description: string;
        whereLabel: string;
        smokeLabel: string;
        items: Array<{
            client: string;
            badge: string;
            where: string;
            smoke: string;
        }>;
    };
    trustChecks: {
        title: string;
        description: string;
        items: Array<{
            title: string;
            description: string;
        }>;
    };
    troubleshooting: {
        title: string;
        description: string;
        items: Array<{
            problem: string;
            fix: string;
        }>;
    };
    ctaRail: {
        title: string;
        description: string;
        actions: HowToUseLocaleAction[];
    };
};
const howToUsePathsFilePath = path.join(process.cwd(), "content", "how-to-use", "paths.json");
let cachedHowToUsePaths: HowToUsePaths | null = null;
let hasLoadedHowToUsePaths = false;
const fallbackHowToUsePaths: HowToUsePaths = {
    heroActions: {
        primaryLabel: {
            en: "Open the Catalog",
        },
        secondaryLabel: {
            en: "Jump to setup paths",
        },
    },
    scenarioSection: {
        title: {
            en: "Pick your setup path",
        },
        description: {
            en: "Use the quick path for first launch or the production path for hardened setup.",
        },
    },
    scenarios: [
        {
            id: "quick_start",
            badge: {
                en: "Quick path",
            },
            title: {
                en: "Launch in 10 minutes",
            },
            description: {
                en: "A minimal flow to connect one MCP server and verify your first tool call.",
            },
            stepsTitle: {
                en: "What to do now",
            },
            steps: [
                {
                    title: {
                        en: "Choose one server in the catalog",
                    },
                    description: {
                        en: "Pick the server that matches your immediate workflow.",
                    },
                },
                {
                    title: {
                        en: "Add server config to your client",
                    },
                    description: {
                        en: "Paste the generated snippet into local MCP settings.",
                    },
                },
                {
                    title: {
                        en: "Run one read-only call",
                    },
                    description: {
                        en: "Confirm response shape and response time before scaling usage.",
                    },
                },
            ],
            checklistTitle: {
                en: "Quick validation checklist",
            },
            checklistItems: [
                {
                    en: "Client restarted after config update",
                },
                {
                    en: "At least one successful tool response",
                },
            ],
            primaryCta: {
                id: "scenario_catalog",
                label: {
                    en: "Choose a server in catalog",
                },
                href: "/catalog",
            },
        },
        {
            id: "production_ready",
            badge: {
                en: "Production path",
            },
            title: {
                en: "Hardened setup for teams",
            },
            description: {
                en: "A stricter flow for security, trust validation, and stable rollout.",
            },
            stepsTitle: {
                en: "Production sequence",
            },
            steps: [
                {
                    title: {
                        en: "Validate trust and maintainer signals",
                    },
                    description: {
                        en: "Confirm verification level, ownership, and auth model before adding access.",
                    },
                },
                {
                    title: {
                        en: "Configure secrets and environment boundaries",
                    },
                    description: {
                        en: "Keep credentials outside git and separate local/staging/prod configs.",
                    },
                },
                {
                    title: {
                        en: "Run deterministic smoke tests",
                    },
                    description: {
                        en: "Repeat health/list/read calls and verify stable outputs and latency.",
                    },
                },
            ],
            checklistTitle: {
                en: "Production readiness checklist",
            },
            checklistItems: [
                {
                    en: "Auth scope and token rotation policy confirmed",
                },
                {
                    en: "Rollback path documented in internal runbook",
                },
            ],
            primaryCta: {
                id: "scenario_catalog",
                label: {
                    en: "Review trusted servers",
                },
                href: "/catalog",
            },
        },
    ],
    clientReference: {
        title: {
            en: "Client setup reference",
        },
        description: {
            en: "Open a client tab, copy endpoint/auth data, and finish with smoke test.",
        },
        whereLabel: {
            en: "Where to configure",
        },
        smokeLabel: {
            en: "Smoke test",
        },
        items: [
            {
                client: "OpenAI Codex",
                badge: {
                    en: "Codex",
                },
                where: {
                    en: "Open MCP/Tools settings, register endpoint and credentials, then reload workspace.",
                },
                smoke: {
                    en: "Run one read-only call and verify stable response schema.",
                },
            },
        ],
    },
    trustChecks: {
        title: {
            en: "Trust and production checks",
        },
        description: {
            en: "Confirm these checks before rolling MCP into critical workflows.",
        },
        items: [
            {
                title: {
                    en: "Auth and permission boundaries",
                },
                description: {
                    en: "Use minimum required scopes and rotate secrets on schedule.",
                },
            },
            {
                title: {
                    en: "Operational readiness",
                },
                description: {
                    en: "Document failure modes, retries, and rollback instructions.",
                },
            },
        ],
    },
    troubleshooting: {
        title: {
            en: "Troubleshooting",
        },
        description: {
            en: "Use this checklist before replacing tools or rewriting architecture.",
        },
        items: [
            {
                problem: {
                    en: "Server does not appear in client",
                },
                fix: {
                    en: "Check config syntax and fully restart client session.",
                },
            },
            {
                problem: {
                    en: "Tool calls time out",
                },
                fix: {
                    en: "Validate endpoint availability and proxy/firewall rules.",
                },
            },
        ],
    },
    ctaRail: {
        title: {
            en: "Next step",
        },
        description: {
            en: "Continue with trusted servers or publish your own MCP integration.",
        },
        actions: [
            {
                id: "final_catalog",
                label: {
                    en: "Browse MCP servers",
                },
                href: "/catalog",
                variant: "primary",
            },
            {
                id: "final_submit",
                label: {
                    en: "Submit your server",
                },
                href: "/submit-server#submit",
                variant: "secondary",
            },
        ],
    },
};
function readHowToUsePaths(): HowToUsePaths {
    if (hasLoadedHowToUsePaths) {
        return cachedHowToUsePaths ?? fallbackHowToUsePaths;
    }
    hasLoadedHowToUsePaths = true;
    if (!fs.existsSync(howToUsePathsFilePath)) {
        cachedHowToUsePaths = fallbackHowToUsePaths;
        return cachedHowToUsePaths;
    }
    const raw = fs.readFileSync(howToUsePathsFilePath, "utf8");
    let parsedJson: unknown;
    try {
        parsedJson = JSON.parse(raw);
    }
    catch (error) {
        throw new Error(`Invalid JSON in "${howToUsePathsFilePath}": ${(error as Error).message}`);
    }
    const parsed = howToUsePathsSchema.safeParse(parsedJson);
    if (!parsed.success) {
        throw new Error(`Invalid how-to-use content schema in "${howToUsePathsFilePath}": ${parsed.error.message}`);
    }
    cachedHowToUsePaths = parsed.data;
    return cachedHowToUsePaths;
}
function localizeText(locale: Locale, localizedText: LocalizedText): string {
    void locale;
    return localizedText.en;
}
function localizeAction(locale: Locale, action: z.infer<typeof actionSchema>): HowToUseLocaleAction {
    return {
        id: action.id,
        label: localizeText(locale, action.label),
        href: action.href,
        variant: action.variant,
    };
}
export function getHowToUseLocaleContent(locale: Locale): HowToUseLocaleContent {
    const content = readHowToUsePaths();
    return {
        heroActions: {
            primaryLabel: localizeText(locale, content.heroActions.primaryLabel),
            secondaryLabel: localizeText(locale, content.heroActions.secondaryLabel),
        },
        scenarioSection: {
            title: localizeText(locale, content.scenarioSection.title),
            description: localizeText(locale, content.scenarioSection.description),
        },
        scenarios: content.scenarios.map((scenario) => ({
            id: scenario.id,
            badge: localizeText(locale, scenario.badge),
            title: localizeText(locale, scenario.title),
            description: localizeText(locale, scenario.description),
            stepsTitle: localizeText(locale, scenario.stepsTitle),
            steps: scenario.steps.map((step) => ({
                title: localizeText(locale, step.title),
                description: localizeText(locale, step.description),
            })),
            checklistTitle: localizeText(locale, scenario.checklistTitle),
            checklistItems: scenario.checklistItems.map((item) => localizeText(locale, item)),
            primaryCta: {
                id: scenario.primaryCta.id,
                label: localizeText(locale, scenario.primaryCta.label),
                href: scenario.primaryCta.href,
                variant: "primary",
            },
        })),
        clientReference: {
            title: localizeText(locale, content.clientReference.title),
            description: localizeText(locale, content.clientReference.description),
            whereLabel: localizeText(locale, content.clientReference.whereLabel),
            smokeLabel: localizeText(locale, content.clientReference.smokeLabel),
            items: content.clientReference.items.map((item) => ({
                client: item.client,
                badge: localizeText(locale, item.badge),
                where: localizeText(locale, item.where),
                smoke: localizeText(locale, item.smoke),
            })),
        },
        trustChecks: {
            title: localizeText(locale, content.trustChecks.title),
            description: localizeText(locale, content.trustChecks.description),
            items: content.trustChecks.items.map((item) => ({
                title: localizeText(locale, item.title),
                description: localizeText(locale, item.description),
            })),
        },
        troubleshooting: {
            title: localizeText(locale, content.troubleshooting.title),
            description: localizeText(locale, content.troubleshooting.description),
            items: content.troubleshooting.items.map((item) => ({
                problem: localizeText(locale, item.problem),
                fix: localizeText(locale, item.fix),
            })),
        },
        ctaRail: {
            title: localizeText(locale, content.ctaRail.title),
            description: localizeText(locale, content.ctaRail.description),
            actions: content.ctaRail.actions.map((action) => localizeAction(locale, action)),
        },
    };
}

