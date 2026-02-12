import type { Locale } from "@/lib/i18n";

type LocalizedText = {
  en: string;
  ru: string;
};

type LocalizedRuleSet = {
  en: string[];
  ru: string[];
};

export type SkillProfile = {
  id: string;
  title: LocalizedText;
  keywords: string[];
  agentsRules: LocalizedRuleSet;
  cursorRules: LocalizedRuleSet;
  copilotRules: LocalizedRuleSet;
};

export const DEFAULT_SKILL_IDS = [
  "nextjs-app-router",
  "typescript-pro",
  "lint-and-validate",
  "verification-before-completion",
] as const;

export const SKILL_PROFILES: SkillProfile[] = [
  {
    id: "nextjs-app-router",
    title: {
      en: "Next.js App Router",
      ru: "Next.js App Router",
    },
    keywords: [
      "next.js",
      "nextjs",
      "app router",
      "server component",
      "route handler",
      "rsc",
      "next",
      "next app",
    ],
    agentsRules: {
      en: [
        "Prefer Server Components by default and isolate client-only logic.",
        "Follow App Router conventions (page.tsx/layout.tsx/route.ts).",
      ],
      ru: [
        "Используйте Server Components по умолчанию, клиентскую логику изолируйте.",
        "Соблюдайте конвенции App Router (page.tsx/layout.tsx/route.ts).",
      ],
    },
    cursorRules: {
      en: [
        "Keep route-level changes localized to the relevant app segment.",
        "Do not move data fetching to client components without explicit need.",
      ],
      ru: [
        "Локализуйте изменения на уровне нужного сегмента app/.",
        "Не переносите data fetching в клиент без явной необходимости.",
      ],
    },
    copilotRules: {
      en: [
        "Generate code that respects server/client boundaries.",
        "Prefer route handlers in app/api for backend actions.",
      ],
      ru: [
        "Генерируйте код с учетом границ server/client.",
        "Для backend-действий предпочитайте route handlers в app/api.",
      ],
    },
  },
  {
    id: "typescript-pro",
    title: {
      en: "TypeScript Pro",
      ru: "TypeScript Pro",
    },
    keywords: [
      "typescript",
      "ts",
      "type",
      "interface",
      "generics",
      "strict",
      "typing",
    ],
    agentsRules: {
      en: [
        "Keep types explicit at module boundaries and avoid loose any.",
        "Model nullable/optional states directly in types.",
      ],
      ru: [
        "Делайте типы явными на границах модулей и избегайте any.",
        "Явно моделируйте nullable/optional состояния в типах.",
      ],
    },
    cursorRules: {
      en: [
        "Prefer small, composable utility types over large unions.",
        "Keep function signatures stable and backward compatible.",
      ],
      ru: [
        "Предпочитайте небольшие композиционные utility-типы.",
        "Сохраняйте стабильные и обратно-совместимые сигнатуры функций.",
      ],
    },
    copilotRules: {
      en: [
        "Always infer and validate return types for helpers.",
        "Use descriptive names for domain types.",
      ],
      ru: [
        "Всегда выводите и проверяйте return types helper-функций.",
        "Используйте понятные названия доменных типов.",
      ],
    },
  },
  {
    id: "playwright-skill",
    title: {
      en: "Playwright Skill",
      ru: "Playwright Skill",
    },
    keywords: [
      "playwright",
      "e2e",
      "ui test",
      "browser automation",
      "visual",
      "ux",
      "regression",
    ],
    agentsRules: {
      en: [
        "Add Playwright coverage for user-visible behavior changes.",
        "Validate desktop and mobile critical flows when touching UI.",
      ],
      ru: [
        "Добавляйте Playwright-проверки для изменений пользовательского поведения.",
        "Проверяйте критичные UI-флоу на desktop и mobile.",
      ],
    },
    cursorRules: {
      en: [
        "Prefer semantic locators (role/label/text) over brittle selectors.",
        "Include locale-aware assertions if UI is bilingual.",
      ],
      ru: [
        "Используйте семантические локаторы (role/label/text), а не хрупкие селекторы.",
        "Добавляйте locale-aware проверки для двуязычного интерфейса.",
      ],
    },
    copilotRules: {
      en: [
        "Generate deterministic E2E checks with clear expected outcomes.",
        "Set consent/locale cookies in tests when needed.",
      ],
      ru: [
        "Генерируйте детерминированные E2E-проверки с явными ожидаемыми результатами.",
        "В тестах задавайте cookies locale/consent, когда это нужно.",
      ],
    },
  },
  {
    id: "lint-and-validate",
    title: {
      en: "Lint and Validate",
      ru: "Lint and Validate",
    },
    keywords: [
      "lint",
      "validation",
      "format",
      "quality gate",
      "ci",
      "checks",
    ],
    agentsRules: {
      en: [
        "Run repository quality gates before completion claims.",
        "Treat lint/build failures as blockers, not optional warnings.",
      ],
      ru: [
        "Перед завершением запускайте quality gate репозитория.",
        "Считайте lint/build ошибки блокирующими, а не опциональными.",
      ],
    },
    cursorRules: {
      en: [
        "Use project scripts instead of ad-hoc commands when possible.",
        "Report executed commands and concise outcomes.",
      ],
      ru: [
        "Используйте проектные scripts вместо ad-hoc команд.",
        "Фиксируйте выполненные команды и краткий результат.",
      ],
    },
    copilotRules: {
      en: [
        "Keep changes lint-compatible and convention-aligned.",
        "Avoid introducing new dependencies for small fixes.",
      ],
      ru: [
        "Сохраняйте совместимость с lint и текущими конвенциями.",
        "Не добавляйте новые зависимости для мелких правок.",
      ],
    },
  },
  {
    id: "verification-before-completion",
    title: {
      en: "Verification Before Completion",
      ru: "Verification Before Completion",
    },
    keywords: [
      "verification",
      "final check",
      "acceptance",
      "done",
      "ship",
      "release",
    ],
    agentsRules: {
      en: [
        "Never claim 'done' without evidence from executed checks.",
        "Map acceptance criteria to specific verification evidence.",
      ],
      ru: [
        "Не заявляйте о завершении без доказательств из выполненных проверок.",
        "Связывайте acceptance criteria с конкретной верификацией.",
      ],
    },
    cursorRules: {
      en: [
        "Summarize pass/fail per command before handoff.",
        "Call out residual risks explicitly.",
      ],
      ru: [
        "Перед handoff указывайте pass/fail по каждой команде.",
        "Явно фиксируйте остаточные риски.",
      ],
    },
    copilotRules: {
      en: [
        "Generate delivery notes with command evidence.",
        "Avoid completion claims when tests/checks are missing.",
      ],
      ru: [
        "Генерируйте delivery notes с доказательствами по командам.",
        "Избегайте финальных claim без тестов/проверок.",
      ],
    },
  },
  {
    id: "security-review",
    title: {
      en: "Security Review",
      ru: "Security Review",
    },
    keywords: [
      "auth",
      "token",
      "security",
      "permission",
      "role",
      "secret",
      "compliance",
    ],
    agentsRules: {
      en: [
        "Do not expose secrets or sensitive identifiers in logs/output.",
        "Validate access boundaries for auth-protected actions.",
      ],
      ru: [
        "Не раскрывайте секреты и чувствительные идентификаторы в логах/выводе.",
        "Проверяйте границы доступа для auth-защищенных действий.",
      ],
    },
    cursorRules: {
      en: [
        "Prefer least-privilege defaults for new capabilities.",
        "Flag any change affecting auth, payment, or personal data.",
      ],
      ru: [
        "Для новых возможностей используйте принципы least-privilege.",
        "Отмечайте изменения в auth, payment и персональных данных.",
      ],
    },
    copilotRules: {
      en: [
        "Generate secure defaults and explicit input validation.",
        "Never suggest committing credentials or private tokens.",
      ],
      ru: [
        "Генерируйте безопасные значения по умолчанию и явную валидацию.",
        "Никогда не предлагайте коммитить credentials или приватные токены.",
      ],
    },
  },
  {
    id: "supabase-postgres-best-practices",
    title: {
      en: "Supabase Postgres Best Practices",
      ru: "Supabase Postgres Best Practices",
    },
    keywords: [
      "supabase",
      "postgres",
      "sql",
      "migration",
      "schema",
      "query",
      "database",
    ],
    agentsRules: {
      en: [
        "Treat schema changes as high-risk and document rollback paths.",
        "Prefer indexed query patterns and avoid broad table scans.",
      ],
      ru: [
        "Рассматривайте изменения схемы как high-risk и документируйте rollback.",
        "Предпочитайте индексируемые запросы и избегайте широких table scans.",
      ],
    },
    cursorRules: {
      en: [
        "Keep migrations small, ordered, and reversible.",
        "Validate data integrity assumptions before deployment.",
      ],
      ru: [
        "Делайте миграции маленькими, упорядоченными и обратимыми.",
        "Проверяйте гипотезы по целостности данных до деплоя.",
      ],
    },
    copilotRules: {
      en: [
        "Generate SQL with explicit constraints and index awareness.",
        "Avoid destructive migration commands without rollback guidance.",
      ],
      ru: [
        "Генерируйте SQL с явными constraints и учетом индексов.",
        "Избегайте разрушительных миграций без rollback-пути.",
      ],
    },
  },
  {
    id: "ui-skills",
    title: {
      en: "UI Skills",
      ru: "UI Skills",
    },
    keywords: [
      "ui",
      "ux",
      "component",
      "responsive",
      "design",
      "tailwind",
      "accessibility",
      "interface",
    ],
    agentsRules: {
      en: [
        "Keep visual hierarchy clear and preserve readability in dark mode.",
        "Use accessible labels and keyboard-friendly controls.",
      ],
      ru: [
        "Сохраняйте четкую визуальную иерархию и читабельность в dark mode.",
        "Используйте доступные labels и keyboard-friendly элементы.",
      ],
    },
    cursorRules: {
      en: [
        "Follow existing design tokens and component patterns.",
        "Validate mobile and desktop breakpoints for updated layouts.",
      ],
      ru: [
        "Следуйте существующим design tokens и паттернам компонентов.",
        "Проверяйте mobile/desktop breakpoints для обновленных layout.",
      ],
    },
    copilotRules: {
      en: [
        "Generate semantic markup with explicit labels.",
        "Favor small reusable UI blocks over one-off markup.",
      ],
      ru: [
        "Генерируйте семантическую разметку с явными labels.",
        "Предпочитайте небольшие переиспользуемые UI-блоки.",
      ],
    },
  },
];

export function localizeText(locale: Locale, text: LocalizedText): string {
  return locale === "ru" ? text.ru : text.en;
}

export function localizeRules(locale: Locale, rules: LocalizedRuleSet): string[] {
  return locale === "ru" ? rules.ru : rules.en;
}

export function getSkillProfileById(id: string): SkillProfile | undefined {
  return SKILL_PROFILES.find((profile) => profile.id === id);
}

export function getSkillProfilesByIds(ids: string[]): SkillProfile[] {
  const unique = new Set(ids);
  const ordered: SkillProfile[] = [];

  for (const profile of SKILL_PROFILES) {
    if (unique.has(profile.id)) {
      ordered.push(profile);
    }
  }

  return ordered;
}
