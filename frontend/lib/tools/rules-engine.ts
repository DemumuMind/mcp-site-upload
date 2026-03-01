import {
  DEFAULT_SKILL_IDS,
  getSkillProfilesByIds,
  listSkillProfiles,
  type SkillProfile,
} from "@/lib/tools/skill-profiles";

export type RulesOutputFormat = "agents" | "cursor" | "copilot";
export type RulesTone = "strict" | "balanced" | "lean";
export type RulesSourceMode = "fresh" | "merge";

export type RulesProjectInput = {
  projectName: string;
  description: string;
  stack: string[];
  constraints: string[];
  tone: RulesTone;
  sourceMode: RulesSourceMode;
  existingRulesText?: string;
  skills: string[];
};

export type SkillSuggestion = {
  id: string;
  title: string;
  score: number;
  reason: string;
};

export type GeneratedArtifact = {
  format: RulesOutputFormat;
  title: string;
  fileName: string;
  content: string;
};

export type RulesGenerationResult = {
  artifacts: GeneratedArtifact[];
  warnings: string[];
  suggestions: SkillSuggestion[];
  usedSkills: SkillProfile[];
};

export type RulesPreset = {
  id: string;
  name: string;
  createdAt: string;
  input: RulesProjectInput;
};

export type RulesHistoryItem = {
  id: string;
  createdAt: string;
  input: RulesProjectInput;
  artifacts: GeneratedArtifact[];
};

const OUTPUT_FORMAT_ORDER: RulesOutputFormat[] = ["agents", "cursor", "copilot"];

const TONE_GUIDANCE: Record<RulesTone, Record<RulesOutputFormat, string[]>> = {
  strict: {
    agents: [
      "Use a mandatory delivery cycle: Plan v1 -> Check v1 -> Plan v2 -> Final verification.",
      "Treat any lint/build/test failure as a hard blocker.",
      "Require explicit risk and rollback notes for non-trivial changes.",
    ],
    cursor: [
      "Never edit before decision-complete planning on non-trivial tasks.",
      "Refuse completion claims without command evidence.",
      "Escalate to full verification whenever scope expands.",
    ],
    copilot: [
      "Generate conservative, audit-friendly changes with explicit constraints.",
      "Always include verification and rollback instructions when suggesting edits.",
    ],
  },
  balanced: {
    agents: [
      "Use Plan v1 -> Check v1 -> Plan v2 for non-trivial work.",
      "Keep diffs small and reversible by default.",
      "Run quality checks aligned to touched scope before completion.",
    ],
    cursor: [
      "Prefer repository conventions and stable interfaces.",
      "Summarize command outcomes with pass/fail labels.",
      "Escalate checks when behavior changes are user-visible.",
    ],
    copilot: [
      "Optimize for clarity and low-risk implementation.",
      "Include practical verification guidance without over-prescription.",
    ],
  },
  lean: {
    agents: [
      "Prioritize fast iteration while preserving correctness.",
      "Use minimal reversible diffs and basic verification evidence.",
      "Escalate process depth only when risk increases.",
    ],
    cursor: [
      "Keep implementation direct and focused on acceptance criteria.",
      "Report concise command outcomes for touched areas.",
      "Avoid over-engineering and unnecessary abstractions.",
    ],
    copilot: [
      "Generate concise implementation guidance with clear intent.",
      "Recommend only essential verification for the modified scope.",
    ],
  },
};

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function scoreSkillByDescription(profile: SkillProfile, normalizedDescription: string): number {
  if (!normalizedDescription) {
    return 0;
  }

  let score = 0;

  for (const keyword of profile.keywords) {
    const normalizedKeyword = keyword.toLowerCase();
    if (normalizedDescription.includes(normalizedKeyword)) {
      score += normalizedKeyword.includes(" ") ? 2 : 1;
    }
  }

  return score;
}

function formatList(items: string[]): string {
  if (items.length === 0) {
    return "none specified";
  }

  return items.join(", ");
}

function safeTrimmedLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function extractExistingHighlights(existingRulesText: string): string[] {
  const lines = safeTrimmedLines(existingRulesText).filter(
    (line) => !line.startsWith("```") && !line.startsWith("---"),
  );

  if (lines.length === 0) {
    return [];
  }

  const structuralLines = lines.filter(
    (line) => line.startsWith("#") || line.startsWith("-") || /^\d+\./.test(line),
  );

  const source = structuralLines.length > 0 ? structuralLines : lines;
  return source.slice(0, 8).map((line) => (line.length > 180 ? `${line.slice(0, 177)}...` : line));
}

function resolveUsedSkills(selectedSkillIds: string[], suggestions: SkillSuggestion[]): SkillProfile[] {
  const explicit = getSkillProfilesByIds(selectedSkillIds);
  if (explicit.length > 0) {
    return explicit;
  }

  const suggestionIds = suggestions.map((item) => item.id);
  const suggestedProfiles = getSkillProfilesByIds(suggestionIds);
  if (suggestedProfiles.length > 0) {
    return suggestedProfiles;
  }

  return getSkillProfilesByIds([...DEFAULT_SKILL_IDS]);
}

function renderProjectContextBlock(input: RulesProjectInput): string[] {
  return [
    "## Project Context",
    `- Project: ${input.projectName || "Untitled project"}`,
    `- Description: ${input.description}`,
    `- Stack: ${formatList(input.stack)}`,
    `- Constraints: ${formatList(input.constraints)}`,
    `- Source mode: ${input.sourceMode === "merge" ? "Merge with existing rules context" : "Generate from scratch"}`,
    "",
  ];
}

function renderSkillRulesByFormat(format: RulesOutputFormat, usedSkills: SkillProfile[]): string[] {
  const lines: string[] = [];
  lines.push("## Skill Overlays");

  for (const profile of usedSkills) {
    lines.push(`### ${profile.title} (\`${profile.id}\`)`);
    for (const rule of profile.rules[format]) {
      lines.push(`- ${rule}`);
    }
    lines.push("");
  }

  return lines;
}

function renderAgentsArtifact(params: {
  input: RulesProjectInput;
  usedSkills: SkillProfile[];
  highlights: string[];
}): string {
  const { input, usedSkills, highlights } = params;
  const lines: string[] = ["# AGENTS.md", ""];

  lines.push(...renderProjectContextBlock(input));
  lines.push("## Delivery Contract");
  for (const guideline of TONE_GUIDANCE[input.tone].agents) {
    lines.push(`- ${guideline}`);
  }
  lines.push("- Keep edits scoped and avoid unrelated file changes.");
  lines.push("- Include executed commands and outcomes in completion notes.");
  lines.push("");

  lines.push("## Active Skills");
  for (const profile of usedSkills) {
    lines.push(`- ${profile.title} (\`${profile.id}\`)`);
  }
  lines.push("");

  lines.push(...renderSkillRulesByFormat("agents", usedSkills));

  lines.push("## Verification Checklist");
  lines.push("1. `npm run check:utf8:strict`");
  lines.push("2. `npm run lint`");
  lines.push("3. `npm run build`");
  lines.push("4. `npx playwright test` (when UI behavior changes)");
  lines.push("");

  if (input.sourceMode === "merge" && highlights.length > 0) {
    lines.push("## Imported Highlights from Existing Rules");
    for (const highlight of highlights) {
      lines.push(`- ${highlight}`);
    }
    lines.push("");
  }

  lines.push("## Final Guardrails");
  lines.push("- Never expose secrets or credentials.");
  lines.push("- Never run destructive commands without explicit approval.");

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function renderCursorArtifact(input: RulesProjectInput, usedSkills: SkillProfile[]): string {
  const lines: string[] = ["# .cursorrules", ""];

  lines.push("## Project Snapshot");
  lines.push(`- ${input.projectName || "Untitled project"}`);
  lines.push(`- ${input.description}`);
  lines.push("");

  lines.push("## Execution Contract");
  for (const guideline of TONE_GUIDANCE[input.tone].cursor) {
    lines.push(`- ${guideline}`);
  }
  lines.push("- Keep edits reversible and aligned to repository conventions.");
  lines.push("");

  lines.push(...renderSkillRulesByFormat("cursor", usedSkills));
  lines.push("## Required Handoff");
  lines.push("- Provide pass/fail status for each executed command.");
  lines.push("- Explicitly list remaining risks and unresolved assumptions.");

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function renderCopilotArtifact(input: RulesProjectInput, usedSkills: SkillProfile[]): string {
  const lines: string[] = ["# Copilot Instructions", ""];

  lines.push("## Project Summary");
  lines.push(`- Project: ${input.projectName || "Untitled project"}`);
  lines.push(`- Description: ${input.description}`);
  lines.push(`- Stack: ${formatList(input.stack)}`);
  lines.push("");

  lines.push("## Engineering Baseline");
  for (const guideline of TONE_GUIDANCE[input.tone].copilot) {
    lines.push(`- ${guideline}`);
  }
  lines.push("- Keep generated changes small, explicit, and reversible.");
  lines.push("- Avoid touching unrelated files.");
  lines.push("");

  lines.push(...renderSkillRulesByFormat("copilot", usedSkills));
  lines.push("## Validation");
  lines.push("- `npm run check:utf8:strict`");
  lines.push("- `npm run lint`");
  lines.push("- `npm run build`");
  lines.push("- `npx playwright test` for UI behavior updates");

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function getRulesFormatTitle(format: RulesOutputFormat): string {
  if (format === "agents") {
    return "AGENTS.md";
  }

  if (format === "cursor") {
    return ".cursorrules";
  }

  return "Copilot Instructions";
}

export function getRulesFormatFileName(format: RulesOutputFormat): string {
  if (format === "agents") {
    return "AGENTS.generated.md";
  }

  if (format === "cursor") {
    return ".cursorrules";
  }

  return "copilot-instructions.generated.md";
}

export function suggestSkillProfilesFromDescription(
  description: string,
  limit: number = 6,
): SkillSuggestion[] {
  const normalizedDescription = normalizeText(description);
  const allProfiles = listSkillProfiles();

  const scored = allProfiles
    .map((profile) => {
      const score = scoreSkillByDescription(profile, normalizedDescription);
      return {
        id: profile.id,
        title: profile.title,
        score,
        reason: score > 0 ? `Matched keyword signals: ${score}` : "No direct keyword match",
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit);

  if (scored.length > 0) {
    return scored;
  }

  return getSkillProfilesByIds([...DEFAULT_SKILL_IDS]).map((profile) => ({
    id: profile.id,
    title: profile.title,
    score: 0,
    reason: "Fallback baseline profile",
  }));
}

export function buildRulesArtifacts(input: RulesProjectInput): RulesGenerationResult {
  const cleanedInput: RulesProjectInput = {
    ...input,
    projectName: input.projectName.trim(),
    description: input.description.trim(),
    stack: input.stack.map((item) => item.trim()).filter(Boolean),
    constraints: input.constraints.map((item) => item.trim()).filter(Boolean),
    existingRulesText: input.existingRulesText ?? "",
  };

  const warnings: string[] = [];
  const suggestions = suggestSkillProfilesFromDescription(cleanedInput.description);
  const usedSkills = resolveUsedSkills(cleanedInput.skills, suggestions);
  const highlights = extractExistingHighlights(cleanedInput.existingRulesText ?? "");

  if (cleanedInput.sourceMode === "merge" && highlights.length === 0) {
    warnings.push(
      "Merge mode is enabled, but no existing rules text was provided. Generated output uses fresh baseline context.",
    );
  }

  const artifacts: GeneratedArtifact[] = OUTPUT_FORMAT_ORDER.map((format) => {
    let content = "";

    if (format === "agents") {
      content = renderAgentsArtifact({
        input: cleanedInput,
        usedSkills,
        highlights,
      });
    } else if (format === "cursor") {
      content = renderCursorArtifact(cleanedInput, usedSkills);
    } else {
      content = renderCopilotArtifact(cleanedInput, usedSkills);
    }

    return {
      format,
      title: getRulesFormatTitle(format),
      fileName: getRulesFormatFileName(format),
      content,
    };
  });

  return {
    artifacts,
    warnings,
    suggestions,
    usedSkills,
  };
}
