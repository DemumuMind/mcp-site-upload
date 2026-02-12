import type { Locale } from "@/lib/i18n";

export type RulesByFormat = {
  agents: string[];
  cursor: string[];
  copilot: string[];
};

export type SkillProfile = {
  id: string;
  title: string;
  summary: string;
  keywords: string[];
  rules: RulesByFormat;
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
    title: "Next.js App Router",
    summary: "Use App Router conventions and keep server/client boundaries explicit.",
    keywords: ["next.js", "nextjs", "app router", "server component", "route handler", "rsc"],
    rules: {
      agents: [
        "Prefer Server Components by default and isolate client-only logic.",
        "Keep route changes scoped to the affected segment in app/.",
      ],
      cursor: [
        "Follow page.tsx/layout.tsx/route.ts conventions consistently.",
        "Avoid moving data fetching to client components without explicit need.",
      ],
      copilot: [
        "Generate backend actions as route handlers under app/api when applicable.",
        "Preserve cache and rendering assumptions when editing routes.",
      ],
    },
  },
  {
    id: "typescript-pro",
    title: "TypeScript Pro",
    summary: "Prioritize explicit types, stable contracts, and safe refactors.",
    keywords: ["typescript", "type", "interface", "generic", "strict", "typing", "ts"],
    rules: {
      agents: [
        "Keep public module boundaries strongly typed and avoid loose any.",
        "Model nullable and optional states explicitly in interfaces.",
      ],
      cursor: [
        "Prefer composable utility types over oversized unions.",
        "Keep function signatures backward-compatible unless explicitly changed.",
      ],
      copilot: [
        "Infer and validate return types for helpers.",
        "Use descriptive names for domain types and DTOs.",
      ],
    },
  },
  {
    id: "lint-and-validate",
    title: "Lint and Validate",
    summary: "Run repository quality gates before claiming completion.",
    keywords: ["lint", "validation", "quality", "check", "ci", "build", "format"],
    rules: {
      agents: [
        "Run project quality gates before completion claims.",
        "Treat lint/build errors as blockers, not optional warnings.",
      ],
      cursor: [
        "Use repository scripts rather than ad-hoc shell commands where possible.",
        "Report executed commands and concise outcomes.",
      ],
      copilot: [
        "Keep generated code lint-compatible and convention-aligned.",
        "Avoid introducing dependencies for tiny fixes.",
      ],
    },
  },
  {
    id: "verification-before-completion",
    title: "Verification Before Completion",
    summary: "Evidence-first delivery with explicit pass/fail command output.",
    keywords: ["verification", "done", "acceptance", "release", "ship", "final check"],
    rules: {
      agents: [
        "Never claim done without evidence from executed checks.",
        "Map acceptance criteria to concrete verification output.",
      ],
      cursor: [
        "Summarize pass/fail status for each command before handoff.",
        "Call out residual risks explicitly.",
      ],
      copilot: [
        "Include command evidence in delivery notes.",
        "Do not claim completion when checks are missing.",
      ],
    },
  },
  {
    id: "playwright-skill",
    title: "Playwright Skill",
    summary: "Validate UI behavior through deterministic browser flows.",
    keywords: ["playwright", "e2e", "browser", "ui test", "regression", "visual"],
    rules: {
      agents: [
        "Add Playwright coverage for user-visible behavior changes.",
        "Validate critical flows on both desktop and mobile breakpoints.",
      ],
      cursor: [
        "Prefer semantic locators (role/label/text) over brittle selectors.",
        "Use deterministic assertions with explicit expected states.",
      ],
      copilot: [
        "Generate E2E checks for primary user paths after UI changes.",
        "Prepare predictable test data/state before assertions.",
      ],
    },
  },
  {
    id: "security-review",
    title: "Security Review",
    summary: "Enforce secure defaults and avoid sensitive data exposure.",
    keywords: ["security", "auth", "token", "secret", "permission", "compliance"],
    rules: {
      agents: [
        "Never expose secrets, credentials, or private tokens in logs/output.",
        "Validate access boundaries for auth-protected flows.",
      ],
      cursor: [
        "Default to least privilege when introducing new capabilities.",
        "Flag any change touching auth, billing, or personal data.",
      ],
      copilot: [
        "Generate explicit input validation and safe defaults.",
        "Avoid suggesting insecure shortcuts in auth-sensitive code paths.",
      ],
    },
  },
  {
    id: "supabase-postgres-best-practices",
    title: "Supabase Postgres Best Practices",
    summary: "Treat schema and query behavior as high-risk and reversible.",
    keywords: ["supabase", "postgres", "sql", "migration", "schema", "database", "query"],
    rules: {
      agents: [
        "Keep schema-affecting changes small and rollback-friendly.",
        "Prefer indexed query patterns and avoid broad scans.",
      ],
      cursor: [
        "Document migration intent and rollback path.",
        "Validate data integrity assumptions before rollout.",
      ],
      copilot: [
        "Generate SQL with explicit constraints and indexes when relevant.",
        "Avoid destructive migration steps without rollback guidance.",
      ],
    },
  },
  {
    id: "ui-skills",
    title: "UI Skills",
    summary: "Maintain clear visual hierarchy, accessibility, and reusable UI patterns.",
    keywords: ["ui", "ux", "design", "responsive", "component", "tailwind", "accessibility"],
    rules: {
      agents: [
        "Keep visual hierarchy clear and content readability high.",
        "Use accessible labels and keyboard-friendly controls.",
      ],
      cursor: [
        "Follow existing design tokens and spacing patterns.",
        "Validate updated layouts on mobile and desktop breakpoints.",
      ],
      copilot: [
        "Generate semantic markup and explicit labels for form controls.",
        "Prefer reusable UI blocks over one-off markup.",
      ],
    },
  },
  {
    id: "accessibility-compliance-accessibility-audit",
    title: "Accessibility Audit",
    summary: "Apply WCAG-minded interaction and semantic correctness.",
    keywords: ["accessibility", "wcag", "screen reader", "aria", "keyboard", "contrast"],
    rules: {
      agents: [
        "Ensure all interactive controls have accessible names.",
        "Preserve keyboard reachability and visible focus states.",
      ],
      cursor: [
        "Use semantic HTML before adding ARIA attributes.",
        "Avoid color-only status indicators; include text cues.",
      ],
      copilot: [
        "Generate labels, descriptions, and helper text tied via IDs.",
        "Validate component semantics for forms, tabs, and lists.",
      ],
    },
  },
];

const SKILL_PROFILE_BY_ID = new Map(SKILL_PROFILES.map((profile) => [profile.id, profile]));

export function listSkillProfiles(): SkillProfile[] {
  return [...SKILL_PROFILES];
}

export function getSkillProfileById(id: string): SkillProfile | undefined {
  return SKILL_PROFILE_BY_ID.get(id);
}

export function getSkillProfilesByIds(ids: string[]): SkillProfile[] {
  const uniqueIds = new Set(ids);
  const orderedProfiles: SkillProfile[] = [];

  for (const profile of SKILL_PROFILES) {
    if (uniqueIds.has(profile.id)) {
      orderedProfiles.push(profile);
    }
  }

  return orderedProfiles;
}

export function localizeText(locale: Locale, text: string): string {
  void locale;
  return text;
}

export function localizeRules(locale: Locale, rules: string[]): string[] {
  void locale;
  return rules;
}
