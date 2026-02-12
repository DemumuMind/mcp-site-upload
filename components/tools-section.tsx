"use client";

import { Copy, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useLocale } from "@/components/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { tr } from "@/lib/i18n";
import {
  extractSkillsFromDescription,
  generateRulesPack,
  getRulesFormatFileName,
  getRulesFormatLabel,
  type GeneratedRulesPack,
  type RulesFormat,
  type SourcePolicy,
} from "@/lib/tools/rules-generator";

function estimateTokens(value: string): number {
  const trimmed = value.trim();

  if (!trimmed) {
    return 0;
  }

  return Math.ceil(trimmed.length / 4);
}

function countWords(value: string): number {
  const trimmed = value.trim();

  if (!trimmed) {
    return 0;
  }

  return trimmed.split(/\s+/).length;
}

const FORMAT_ORDER: RulesFormat[] = ["agents", "cursor", "copilot"];

function triggerDownload(content: string, fileName: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
}

export function ToolsSection() {
  const locale = useLocale();
  const [promptInput, setPromptInput] = useState("");

  const [projectDescription, setProjectDescription] = useState("");
  const [sourcePolicy, setSourcePolicy] = useState<SourcePolicy>("fresh");
  const [existingAgentsText, setExistingAgentsText] = useState("");
  const [activeFormat, setActiveFormat] = useState<RulesFormat>("agents");
  const [generatedRules, setGeneratedRules] = useState<GeneratedRulesPack | null>(null);

  const tokenCount = useMemo(() => estimateTokens(promptInput), [promptInput]);
  const wordCount = useMemo(() => countWords(promptInput), [promptInput]);
  const charCount = promptInput.length;

  const suggestedSkills = useMemo(
    () => extractSkillsFromDescription(projectDescription, locale),
    [projectDescription, locale],
  );

  const selectedSkillIds = useMemo(
    () => suggestedSkills.map((skill) => skill.id),
    [suggestedSkills],
  );

  const currentOutput = generatedRules?.formats[activeFormat] ?? "";

  async function handleCopyCurrentFormat() {
    if (!currentOutput) {
      return;
    }

    try {
      await navigator.clipboard.writeText(currentOutput);
      toast.success(tr(locale, "Rules copied to clipboard.", "Правила скопированы в буфер обмена."));
    } catch {
      toast.error(tr(locale, "Unable to copy rules.", "Не удалось скопировать правила."));
    }
  }

  function handleDownloadCurrentFormat() {
    if (!currentOutput) {
      return;
    }

    triggerDownload(currentOutput, getRulesFormatFileName(activeFormat));
    toast.success(tr(locale, "File downloaded.", "Файл скачан."));
  }

  function handleGenerateRules() {
    const trimmedDescription = projectDescription.trim();

    if (!trimmedDescription) {
      toast.error(
        tr(
          locale,
          "Project description is required.",
          "Описание проекта обязательно для генерации.",
        ),
      );
      return;
    }

    const pack = generateRulesPack({
      description: trimmedDescription,
      locale,
      sourcePolicy,
      selectedSkills: selectedSkillIds,
      existingAgentsText,
    });

    setGeneratedRules(pack);
    setActiveFormat("agents");

    toast.success(tr(locale, "Rules generated.", "Правила сгенерированы."));
  }

  return (
    <section id="tools" className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight text-violet-50">
        {tr(locale, "Tools", "Инструменты")}
      </h2>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-white/10 bg-indigo-900/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-violet-50">
              {tr(locale, "LLM Token Calculator", "Калькулятор LLM-токенов")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-violet-200">
              {tr(
                locale,
                "Estimate token usage for your prompts. Paste a prompt in the box below.",
                "Оцените количество токенов в вашем промпте. Вставьте текст ниже.",
              )}
            </p>
            <Textarea
              value={promptInput}
              onChange={(event) => setPromptInput(event.target.value)}
              rows={8}
              placeholder={tr(locale, "Paste your prompt...", "Вставьте ваш промпт...")}
              className="border-white/10 bg-indigo-950/80"
            />
            <p className="text-sm text-violet-200">
              {tr(
                locale,
                `${tokenCount} tokens, ${wordCount} words, ${charCount} characters`,
                `${tokenCount} токенов, ${wordCount} слов, ${charCount} символов`,
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-indigo-900/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-violet-50">
              {tr(locale, "Rules Generator", "Генератор правил")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-violet-200">
              {tr(
                locale,
                "Generate project rules with skill-aware templates for AGENTS.md, .cursorrules, and Copilot instructions.",
                "Сгенерируйте правила проекта с учетом skills в форматах AGENTS.md, .cursorrules и инструкций Copilot.",
              )}
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="project-description">
                {tr(locale, "Project Description", "Описание проекта")}
              </Label>
              <Textarea
                id="project-description"
                value={projectDescription}
                onChange={(event) => setProjectDescription(event.target.value)}
                rows={4}
                placeholder={tr(
                  locale,
                  "Describe your stack, architecture, and quality requirements...",
                  "Опишите стек, архитектуру и требования к качеству...",
                )}
                className="border-white/10 bg-indigo-950/80"
              />
            </div>

            <div className="space-y-2">
              <Label>{tr(locale, "Source Policy", "Режим источника")}</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button
                  type="button"
                  variant={sourcePolicy === "fresh" ? "default" : "outline"}
                  className={sourcePolicy === "fresh" ? "bg-blue-500 hover:bg-blue-400" : ""}
                  onClick={() => setSourcePolicy("fresh")}
                >
                  {tr(locale, "Generate from scratch", "Сгенерировать с нуля")}
                </Button>
                <Button
                  type="button"
                  variant={sourcePolicy === "merge" ? "default" : "outline"}
                  className={sourcePolicy === "merge" ? "bg-blue-500 hover:bg-blue-400" : ""}
                  onClick={() => setSourcePolicy("merge")}
                >
                  {tr(locale, "Merge with existing AGENTS.md", "Merge с текущим AGENTS.md")}
                </Button>
              </div>
            </div>

            {sourcePolicy === "merge" ? (
              <div className="space-y-1.5">
                <Label htmlFor="existing-agents">
                  {tr(
                    locale,
                    "Current AGENTS.md (optional)",
                    "Текущий AGENTS.md (опционально)",
                  )}
                </Label>
                <Textarea
                  id="existing-agents"
                  value={existingAgentsText}
                  onChange={(event) => setExistingAgentsText(event.target.value)}
                  rows={4}
                  placeholder={tr(
                    locale,
                    "Paste existing AGENTS.md to preserve important sections...",
                    "Вставьте текущий AGENTS.md, чтобы сохранить важные секции...",
                  )}
                  className="border-white/10 bg-indigo-950/80"
                />
              </div>
            ) : null}

            <div className="space-y-2 rounded-lg border border-white/10 bg-indigo-950/70 p-3">
              <p className="text-xs font-medium text-violet-100">
                {tr(locale, "Auto-selected skills", "Автовыбранные skills")}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedSkills.map((skill) => (
                  <Badge key={skill.id} variant="secondary" title={skill.reason}>
                    {skill.label}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              type="button"
              className="w-full bg-blue-500 hover:bg-blue-400"
              onClick={handleGenerateRules}
            >
              {tr(locale, "Generate Rules", "Сгенерировать правила")}
            </Button>

            {generatedRules ? (
              <div className="space-y-3 rounded-lg border border-white/10 bg-indigo-950/80 p-3">
                {generatedRules.warnings.length > 0 ? (
                  <div className="space-y-1 rounded-md border border-amber-400/30 bg-amber-500/10 p-2 text-xs text-amber-100">
                    {generatedRules.warnings.map((warning) => (
                      <p key={warning}>{warning}</p>
                    ))}
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-2">
                  {FORMAT_ORDER.map((format) => (
                    <Button
                      key={format}
                      type="button"
                      size="sm"
                      variant={activeFormat === format ? "default" : "outline"}
                      className={activeFormat === format ? "bg-blue-500 hover:bg-blue-400" : ""}
                      onClick={() => setActiveFormat(format)}
                    >
                      {getRulesFormatLabel(format, locale)}
                    </Button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={handleCopyCurrentFormat}>
                    <Copy className="size-4" />
                    {tr(locale, "Copy", "Копировать")}
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={handleDownloadCurrentFormat}>
                    <Download className="size-4" />
                    {tr(locale, "Download", "Скачать")}
                  </Button>
                </div>

                <pre className="max-h-[28rem] overflow-auto rounded-md border border-white/10 bg-indigo-900/90 p-3 text-xs text-violet-100">
                  <code>{currentOutput}</code>
                </pre>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

    </section>
  );
}
