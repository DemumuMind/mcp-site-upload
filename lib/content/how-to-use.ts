import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

import type { Locale } from "@/lib/i18n";

const localizedTextSchema = z.object({
  en: z.string().trim().min(1),
  ru: z.string().trim().min(1),
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
      en: "Open Catalog",
      ru: "Открыть каталог",
    },
    secondaryLabel: {
      en: "Jump to setup paths",
      ru: "Перейти к сценариям",
    },
  },
  scenarioSection: {
    title: {
      en: "Pick your setup path",
      ru: "Выберите сценарий настройки",
    },
    description: {
      en: "Use the quick path for first launch or the production path for hardened setup.",
      ru: "Используйте быстрый сценарий для первого запуска или production-сценарий для усиленной настройки.",
    },
  },
  scenarios: [
    {
      id: "quick_start",
      badge: {
        en: "Quick path",
        ru: "Быстрый путь",
      },
      title: {
        en: "Launch in 10 minutes",
        ru: "Запуск за 10 минут",
      },
      description: {
        en: "A minimal flow to connect one MCP server and verify your first tool call.",
        ru: "Минимальный сценарий, чтобы подключить один MCP-сервер и проверить первый вызов инструмента.",
      },
      stepsTitle: {
        en: "What to do now",
        ru: "Что сделать сейчас",
      },
      steps: [
        {
          title: {
            en: "Choose one server in the catalog",
            ru: "Выберите один сервер в каталоге",
          },
          description: {
            en: "Pick the server that matches your immediate workflow.",
            ru: "Выберите сервер под ваш ближайший рабочий сценарий.",
          },
        },
        {
          title: {
            en: "Add server config to your client",
            ru: "Добавьте конфиг сервера в клиент",
          },
          description: {
            en: "Paste the generated snippet into local MCP settings.",
            ru: "Вставьте сгенерированный фрагмент в локальные настройки MCP.",
          },
        },
        {
          title: {
            en: "Run one read-only call",
            ru: "Выполните один read-only вызов",
          },
          description: {
            en: "Confirm response shape and response time before scaling usage.",
            ru: "Проверьте формат ответа и время отклика перед масштабированием использования.",
          },
        },
      ],
      checklistTitle: {
        en: "Quick validation checklist",
        ru: "Чеклист быстрой проверки",
      },
      checklistItems: [
        {
          en: "Client restarted after config update",
          ru: "Клиент перезапущен после обновления конфига",
        },
        {
          en: "At least one successful tool response",
          ru: "Есть хотя бы один успешный ответ инструмента",
        },
      ],
      primaryCta: {
        id: "scenario_catalog",
        label: {
          en: "Choose a server in catalog",
          ru: "Выбрать сервер в каталоге",
        },
        href: "/catalog",
      },
    },
    {
      id: "production_ready",
      badge: {
        en: "Production path",
        ru: "Production-путь",
      },
      title: {
        en: "Hardened setup for teams",
        ru: "Усиленная настройка для команд",
      },
      description: {
        en: "A stricter flow for security, trust validation, and stable rollout.",
        ru: "Более строгий сценарий для безопасности, проверки доверия и стабильного запуска.",
      },
      stepsTitle: {
        en: "Production sequence",
        ru: "Production-последовательность",
      },
      steps: [
        {
          title: {
            en: "Validate trust and maintainer signals",
            ru: "Проверьте trust- и maintainer-сигналы",
          },
          description: {
            en: "Confirm verification level, ownership, and auth model before adding access.",
            ru: "Подтвердите уровень верификации, ownership и auth-модель до выдачи доступа.",
          },
        },
        {
          title: {
            en: "Configure secrets and environment boundaries",
            ru: "Настройте секреты и границы окружений",
          },
          description: {
            en: "Keep credentials outside git and separate local/staging/prod configs.",
            ru: "Храните credentials вне git и разделяйте local/staging/prod конфиги.",
          },
        },
        {
          title: {
            en: "Run deterministic smoke tests",
            ru: "Запустите детерминированные smoke-тесты",
          },
          description: {
            en: "Repeat health/list/read calls and verify stable outputs and latency.",
            ru: "Повторите health/list/read вызовы и проверьте стабильность ответов и задержки.",
          },
        },
      ],
      checklistTitle: {
        en: "Production readiness checklist",
        ru: "Чеклист production-ready",
      },
      checklistItems: [
        {
          en: "Auth scope and token rotation policy confirmed",
          ru: "Подтверждены scope auth и политика ротации токенов",
        },
        {
          en: "Rollback path documented in internal runbook",
          ru: "Путь отката задокументирован во внутреннем runbook",
        },
      ],
      primaryCta: {
        id: "scenario_catalog",
        label: {
          en: "Review trusted servers",
          ru: "Проверить доверенные серверы",
        },
        href: "/catalog",
      },
    },
  ],
  clientReference: {
    title: {
      en: "Client setup reference",
      ru: "Справочник по настройке клиентов",
    },
    description: {
      en: "Open a client tab, copy endpoint/auth data, and finish with smoke test.",
      ru: "Откройте вкладку нужного клиента, внесите endpoint/auth и завершите smoke-тестом.",
    },
    whereLabel: {
      en: "Where to configure",
      ru: "Где настраивать",
    },
    smokeLabel: {
      en: "Smoke test",
      ru: "Smoke-тест",
    },
    items: [
      {
        client: "OpenAI Codex",
        badge: {
          en: "Codex",
          ru: "Codex",
        },
        where: {
          en: "Open MCP/Tools settings, register endpoint and credentials, then reload workspace.",
          ru: "Откройте настройки MCP/Tools, добавьте endpoint и credentials, затем перезагрузите workspace.",
        },
        smoke: {
          en: "Run one read-only call and verify stable response schema.",
          ru: "Запустите один read-only вызов и проверьте стабильную схему ответа.",
        },
      },
    ],
  },
  trustChecks: {
    title: {
      en: "Trust and production checks",
      ru: "Проверки доверия и production",
    },
    description: {
      en: "Confirm these checks before rolling MCP into critical workflows.",
      ru: "Подтвердите эти проверки перед включением MCP в критичные процессы.",
    },
    items: [
      {
        title: {
          en: "Auth and permission boundaries",
          ru: "Границы auth и прав доступа",
        },
        description: {
          en: "Use minimum required scopes and rotate secrets on schedule.",
          ru: "Используйте минимально нужные scope и ротируйте секреты по регламенту.",
        },
      },
      {
        title: {
          en: "Operational readiness",
          ru: "Операционная готовность",
        },
        description: {
          en: "Document failure modes, retries, and rollback instructions.",
          ru: "Задокументируйте сценарии отказов, повторы и инструкции по откату.",
        },
      },
    ],
  },
  troubleshooting: {
    title: {
      en: "Troubleshooting",
      ru: "Диагностика проблем",
    },
    description: {
      en: "Use this checklist before replacing tools or rewriting architecture.",
      ru: "Используйте этот чеклист до замены инструментов или переписывания архитектуры.",
    },
    items: [
      {
        problem: {
          en: "Server does not appear in client",
          ru: "Сервер не появляется в клиенте",
        },
        fix: {
          en: "Check config syntax and fully restart client session.",
          ru: "Проверьте синтаксис конфига и полностью перезапустите сессию клиента.",
        },
      },
      {
        problem: {
          en: "Tool calls time out",
          ru: "Таймауты вызовов инструментов",
        },
        fix: {
          en: "Validate endpoint availability and proxy/firewall rules.",
          ru: "Проверьте доступность endpoint и правила proxy/firewall.",
        },
      },
    ],
  },
  ctaRail: {
    title: {
      en: "Next step",
      ru: "Следующий шаг",
    },
    description: {
      en: "Continue with trusted servers or publish your own MCP integration.",
      ru: "Продолжите с доверенными серверами или опубликуйте собственную MCP-интеграцию.",
    },
    actions: [
      {
        id: "final_catalog",
        label: {
          en: "Browse MCP servers",
          ru: "Смотреть MCP-серверы",
        },
        href: "/catalog",
        variant: "primary",
      },
      {
        id: "final_submit",
        label: {
          en: "Submit your server",
          ru: "Отправить свой сервер",
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
  } catch (error) {
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
  return locale === "ru" ? localizedText.ru : localizedText.en;
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
