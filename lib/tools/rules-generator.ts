import { tr, type Locale } from "@/lib/i18n";
import {
  DEFAULT_SKILL_IDS,
  getSkillProfilesByIds,
  localizeRules,
  localizeText,
  SKILL_PROFILES,
  type SkillProfile,
} from "@/lib/tools/skill-profiles";

export type RulesFormat = "agents" | "cursor" | "copilot";

export type SourcePolicy = "fresh" | "merge";

export type SkillSuggestion = {
  id: string;
  label: string;
  score: number;
  reason: string;
};

export type RulesGenerationInput = {
  description: string;
  locale: Locale;
  sourcePolicy: SourcePolicy;
  selectedSkills?: string[];
  existingAgentsText?: string;
};

export type GeneratedRulesPack = {
  formats: Record<RulesFormat, string>;
  suggestedSkills: SkillSuggestion[];
  usedSkills: SkillSuggestion[];
  warnings: string[];
};

const DEFAULT_SKILL_LIMIT = 6;

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function scoreSkill(profile: SkillProfile, normalizedDescription: string): number {
  let score = 0;

  for (const keyword of profile.keywords) {
    if (normalizedDescription.includes(keyword.toLowerCase())) {
      score += keyword.includes(" ") ? 2 : 1;
    }
  }

  return score;
}

function fallbackSkillSuggestions(locale: Locale, limit: number): SkillSuggestion[] {
  return getSkillProfilesByIds([...DEFAULT_SKILL_IDS])
    .slice(0, limit)
    .map((profile) => ({
      id: profile.id,
      label: localizeText(locale, profile.title),
      score: 0,
      reason: tr(
        locale,
        "Fallback baseline profile",
        "Профиль по умолчанию",
      ),
    }));
}

export function extractSkillsFromDescription(
  description: string,
  locale: Locale,
  limit: number = DEFAULT_SKILL_LIMIT,
): SkillSuggestion[] {
  const normalized = normalizeText(description);

  if (!normalized) {
    return fallbackSkillSuggestions(locale, limit);
  }

  const scored = SKILL_PROFILES.map((profile) => {
    const score = scoreSkill(profile, normalized);

    return {
      id: profile.id,
      label: localizeText(locale, profile.title),
      score,
      reason:
        score > 0
          ? tr(
              locale,
              `Matched keyword signals: ${score}`,
              `Найдено совпадений по ключевым сигналам: ${score}`,
            )
          : tr(locale, "No direct match", "Прямых совпадений нет"),
    };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, limit);

  if (scored.length === 0) {
    return fallbackSkillSuggestions(locale, limit);
  }

  return scored;
}

function extractExistingHighlights(existingAgentsText: string): string[] {
  const lines = existingAgentsText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("```") && !line.startsWith("---"));

  if (lines.length === 0) {
    return [];
  }

  const priorityLines = lines.filter(
    (line) => line.startsWith("#") || line.startsWith("-") || /^\d+\./.test(line),
  );

  const source = priorityLines.length > 0 ? priorityLines : lines;

  return source.slice(0, 8).map((line) =>
    line.length > 160 ? `${line.slice(0, 157)}...` : line,
  );
}

function resolveProfiles(
  selectedSkillIds: string[] | undefined,
  suggestedSkills: SkillSuggestion[],
): SkillProfile[] {
  const candidates =
    selectedSkillIds && selectedSkillIds.length > 0
      ? selectedSkillIds
      : suggestedSkills.map((skill) => skill.id);

  const profiles = getSkillProfilesByIds(candidates);

  if (profiles.length > 0) {
    return profiles;
  }

  return getSkillProfilesByIds([...DEFAULT_SKILL_IDS]);
}

function renderAgentsFormat(params: {
  locale: Locale;
  description: string;
  profiles: SkillProfile[];
  sourcePolicy: SourcePolicy;
  existingHighlights: string[];
}): string {
  const { locale, description, profiles, sourcePolicy, existingHighlights } = params;

  const lines: string[] = [];

  lines.push("# AGENTS.md", "");
  lines.push(tr(locale, "## Project Context", "## Контекст проекта"));
  lines.push(`- ${description}`);
  lines.push(
    `- ${tr(locale, "Generated profile mode:", "Режим генерации:")} ${
      sourcePolicy === "merge"
        ? tr(locale, "merge with existing AGENTS", "merge с существующим AGENTS")
        : tr(locale, "fresh from project description", "с нуля по описанию проекта")
    }`,
  );
  lines.push("");

  lines.push(tr(locale, "## Active Skills", "## Активные skills"));
  for (const profile of profiles) {
    lines.push(`- ${localizeText(locale, profile.title)} (\`${profile.id}\`)`);
  }
  lines.push("");

  lines.push(
    tr(locale, "## Delivery Workflow", "## Delivery workflow"),
    tr(
      locale,
      "- For non-trivial tasks follow: Plan v1 -> Check v1 -> Plan v2 -> Final verification.",
      "- Для нетривиальных задач следуйте циклу: Plan v1 -> Check v1 -> Plan v2 -> Final verification.",
    ),
    tr(locale, "- Keep diffs minimal and reversible.", "- Сохраняйте диффы минимальными и обратимыми."),
    tr(locale, "- Do not change unrelated files.", "- Не изменяйте несвязанные файлы."),
    tr(
      locale,
      "- Report executed commands and outcomes in completion notes.",
      "- Фиксируйте выполненные команды и результаты в completion notes.",
    ),
  );
  lines.push("");

  lines.push(tr(locale, "## Skill-Specific Rules", "## Правила по skills"));
  for (const profile of profiles) {
    lines.push(`### ${localizeText(locale, profile.title)} (\`${profile.id}\`)`);
    for (const rule of localizeRules(locale, profile.agentsRules)) {
      lines.push(`- ${rule}`);
    }
    lines.push("");
  }

  lines.push(tr(locale, "## Verification Commands", "## Команды верификации"));
  lines.push("1. `npm run check:utf8:strict`");
  lines.push("2. `npm run lint`");
  lines.push("3. `npm run build`");
  lines.push("4. `npx playwright test` (for UI changes)");
  lines.push("");

  if (sourcePolicy === "merge" && existingHighlights.length > 0) {
    lines.push(
      tr(
        locale,
        "## Highlights imported from existing AGENTS.md",
        "## Сохраненные фрагменты из существующего AGENTS.md",
      ),
    );

    for (const highlight of existingHighlights) {
      lines.push(`- ${highlight}`);
    }

    lines.push("");
  }

  lines.push(
    tr(locale, "## Final Guardrails", "## Финальные ограничения"),
    tr(locale, "- Never expose secrets or credentials.", "- Никогда не раскрывайте секреты и credentials."),
    tr(locale, "- Never run destructive commands without explicit request.", "- Не запускайте деструктивные команды без явного запроса."),
  );

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function renderCursorFormat(params: {
  locale: Locale;
  description: string;
  profiles: SkillProfile[];
}): string {
  const { locale, description, profiles } = params;
  const lines: string[] = [];

  lines.push("# .cursorrules", "");
  lines.push(tr(locale, "Project summary:", "Описание проекта:"));
  lines.push(`- ${description}`);
  lines.push("");

  lines.push(tr(locale, "Execution contract:", "Контракт выполнения:"));
  lines.push(
    tr(
      locale,
      "- Non-trivial tasks: Plan v1 -> Check v1 -> Plan v2 before edits.",
      "- Нетривиальные задачи: Plan v1 -> Check v1 -> Plan v2 до правок.",
    ),
    tr(locale, "- Keep edits minimal and reversible.", "- Правки должны быть минимальными и обратимыми."),
    tr(locale, "- Validate with lint/build/tests before done claim.", "- Перед done-claim запускайте lint/build/tests."),
  );
  lines.push("");

  lines.push(tr(locale, "Skill overlays:", "Skill overlays:"));
  for (const profile of profiles) {
    lines.push(`- ${localizeText(locale, profile.title)} (\`${profile.id}\`)`);
    for (const rule of localizeRules(locale, profile.cursorRules)) {
      lines.push(`  - ${rule}`);
    }
  }
  lines.push("");

  lines.push(tr(locale, "Mandatory output:", "Обязательный output:"));
  lines.push(
    tr(
      locale,
      "- Include command log + pass/fail outcomes in final message.",
      "- В финальном сообщении указывайте лог команд и pass/fail по результатам.",
    ),
  );

  return lines.join("\n").trim();
}

function renderCopilotFormat(params: {
  locale: Locale;
  description: string;
  profiles: SkillProfile[];
}): string {
  const { locale, description, profiles } = params;
  const lines: string[] = [];

  lines.push("# Copilot Instructions", "");
  lines.push(
    tr(
      locale,
      "These instructions were generated for this repository.",
      "Эти инструкции сгенерированы для данного репозитория.",
    ),
  );
  lines.push("");

  lines.push(tr(locale, "## Project Summary", "## Кратко о проекте"));
  lines.push(`- ${description}`);
  lines.push("");

  lines.push(tr(locale, "## Engineering Baseline", "## Инженерная база"));
  lines.push(
    tr(locale, "- Keep changes scoped and convention-aligned.", "- Держите изменения узкими и в рамках конвенций."),
    tr(locale, "- Prefer explicit types and deterministic flows.", "- Предпочитайте явные типы и детерминированные потоки."),
    tr(locale, "- Avoid touching unrelated files.", "- Не затрагивайте несвязанные файлы."),
  );
  lines.push("");

  lines.push(tr(locale, "## Skill Guidance", "## Guidance по skills"));
  for (const profile of profiles) {
    lines.push(`### ${localizeText(locale, profile.title)} (\`${profile.id}\`)`);
    for (const rule of localizeRules(locale, profile.copilotRules)) {
      lines.push(`- ${rule}`);
    }
    lines.push("");
  }

  lines.push(tr(locale, "## Validation", "## Валидация"));
  lines.push("- `npm run check:utf8:strict`");
  lines.push("- `npm run lint`");
  lines.push("- `npm run build`");
  lines.push("- `npx playwright test` (when UI behavior is affected)");

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function getRulesFormatLabel(format: RulesFormat, locale: Locale): string {
  if (format === "agents") {
    return "AGENTS.md";
  }

  if (format === "cursor") {
    return ".cursorrules";
  }

  return tr(locale, "Copilot instructions", "Инструкции Copilot");
}

export function getRulesFormatFileName(format: RulesFormat): string {
  if (format === "agents") {
    return "AGENTS.generated.md";
  }

  if (format === "cursor") {
    return ".cursorrules";
  }

  return "copilot-instructions.generated.md";
}

export function generateRulesPack(input: RulesGenerationInput): GeneratedRulesPack {
  const { description, locale, sourcePolicy, selectedSkills, existingAgentsText } = input;
  const trimmedDescription = description.trim();
  const suggestedSkills = extractSkillsFromDescription(trimmedDescription, locale);
  const profiles = resolveProfiles(selectedSkills, suggestedSkills);
  const usedSkills = profiles.map((profile) => ({
    id: profile.id,
    label: localizeText(locale, profile.title),
    score: suggestedSkills.find((item) => item.id === profile.id)?.score ?? 0,
    reason:
      suggestedSkills.find((item) => item.id === profile.id)?.reason ??
      tr(locale, "Manually selected", "Выбрано вручную"),
  }));

  const warnings: string[] = [];
  const existingHighlights = extractExistingHighlights(existingAgentsText ?? "");

  if (sourcePolicy === "merge" && existingHighlights.length === 0) {
    warnings.push(
      tr(
        locale,
        "Merge mode selected, but existing AGENTS.md text is empty. Generated output uses fresh mode baseline.",
        "Выбран merge-режим, но текст существующего AGENTS.md пуст. Вывод сгенерирован на fresh-базе.",
      ),
    );
  }

  const formats: Record<RulesFormat, string> = {
    agents: renderAgentsFormat({
      locale,
      description: trimmedDescription,
      profiles,
      sourcePolicy,
      existingHighlights,
    }),
    cursor: renderCursorFormat({
      locale,
      description: trimmedDescription,
      profiles,
    }),
    copilot: renderCopilotFormat({
      locale,
      description: trimmedDescription,
      profiles,
    }),
  };

  return {
    formats,
    suggestedSkills,
    usedSkills,
    warnings,
  };
}
