import { createElement } from "react";
import { tr, type Locale } from "@/lib/i18n";
import { getPasswordRuleChecks, PASSWORD_MIN_LENGTH, type PasswordStrengthScore } from "@/lib/password-strength";

type PasswordChecklistItem = {
  key: string;
  passed: boolean;
  label: string;
};

export function getPasswordStrengthLabel(locale: Locale, score: PasswordStrengthScore): string {
  if (score <= 1) {
    return tr(locale, "Weak password", "Weak password");
  }
  if (score === 2) {
    return tr(locale, "Medium password", "Medium password");
  }
  if (score === 3) {
    return tr(locale, "Good password", "Good password");
  }
  return tr(locale, "Strong password", "Strong password");
}

export function getPasswordStrengthColorClass(score: PasswordStrengthScore): string {
  if (score <= 1) {
    return "bg-rose-400/90";
  }
  if (score === 2) {
    return "bg-amber-400/90";
  }
  if (score === 3) {
    return "bg-sky-400/90";
  }
  return "bg-emerald-400/90";
}

export function getPasswordStrengthTextClass(score: PasswordStrengthScore): string {
  if (score <= 1) {
    return "text-rose-300";
  }
  if (score === 2) {
    return "text-amber-300";
  }
  if (score === 3) {
    return "text-primary";
  }
  return "text-primary";
}

export function getPasswordStrengthSegmentClass(score: PasswordStrengthScore, index: number): string {
  return `h-1.5 rounded-full ${index < score ? getPasswordStrengthColorClass(score) : "bg-card"}`;
}

export function getPasswordChecklistItems(locale: Locale, password: string) {
  const checks = getPasswordRuleChecks(password);
  return [
    {
      key: "length",
      passed: checks.minLength,
      label: tr(locale, `At least ${PASSWORD_MIN_LENGTH} characters`, `At least ${PASSWORD_MIN_LENGTH} characters`),
    },
    {
      key: "lowercase",
      passed: checks.hasLowercase,
      label: tr(locale, "At least one lowercase letter", "At least one lowercase letter"),
    },
    {
      key: "uppercase",
      passed: checks.hasUppercase,
      label: tr(locale, "At least one uppercase letter", "At least one uppercase letter"),
    },
    {
      key: "number",
      passed: checks.hasNumber,
      label: tr(locale, "At least one number", "At least one number"),
    },
    {
      key: "symbol",
      passed: checks.hasSymbol,
      label: tr(locale, "At least one symbol", "At least one symbol"),
    },
  ] as const;
}

function getPasswordChecklistIconClass(passed: boolean): string {
  return `inline-flex size-4 items-center justify-center rounded-full border text-[10px] ${passed
    ? "border-emerald-400/60 bg-emerald-400/20"
    : "border-blacksmith/80 bg-card"}`;
}

function getPasswordChecklistItemClass(passed: boolean): string {
  return `flex items-center gap-2 ${passed ? "text-primary" : "text-muted-foreground"}`;
}

type PasswordStrengthChecklistProps = {
  score: PasswordStrengthScore;
  strengthLabel: string;
  checklistItems: readonly PasswordChecklistItem[];
};

export function PasswordStrengthChecklist({ score, strengthLabel, checklistItems }: PasswordStrengthChecklistProps) {
  return createElement(
    "div",
    { className: "space-y-1.5" },
    createElement(
      "div",
      { className: "grid grid-cols-4 gap-1" },
      ...[0, 1, 2, 3].map((index) => createElement("span", { key: index, className: getPasswordStrengthSegmentClass(score, index) })),
    ),
    createElement("p", { className: `text-xs ${getPasswordStrengthTextClass(score)}` }, strengthLabel),
    createElement(
      "ul",
      { className: "space-y-1 text-xs" },
      ...checklistItems.map((item) =>
        createElement(
          "li",
          { key: item.key, className: getPasswordChecklistItemClass(item.passed) },
          createElement("span", { className: getPasswordChecklistIconClass(item.passed) }, item.passed ? "✓" : "•"),
          createElement("span", null, item.label),
        ),
      ),
    ),
  );
}
