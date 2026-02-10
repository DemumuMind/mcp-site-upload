import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bot, Sparkles } from "lucide-react";

import {
  createBlogPostFromDeepResearchAction,
  logoutAdminAction,
} from "@/app/admin/actions";
import { PageFrame } from "@/components/page-templates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Blog automation",
  description: "Admin deep-research workflow for generating blog drafts.",
};

type AdminBlogPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
    slug?: string;
    research?: string;
    sources?: string;
  }>;
};

function formatError(error?: string) {
  if (!error) {
    return null;
  }

  if (error === "missing_required_fields") {
    return "Please fill all required fields before running automation.";
  }

  return error;
}

export default async function AdminBlogPage({ searchParams }: AdminBlogPageProps) {
  const locale = await getLocale();
  const { success, error, slug, research, sources } = await searchParams;

  const successMessage =
    success === "created"
      ? tr(
          locale,
          `Post created: ${slug}. Deep research packet: ${research}. Sources used: ${sources}.`,
          `Статья создана: ${slug}. Пакет deep research: ${research}. Использовано источников: ${sources}.`,
        )
      : null;

  const errorMessage = error ? tr(locale, formatError(error) ?? error, formatError(error) ?? error) : null;

  return (
    <PageFrame variant="ops">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            {tr(locale, "Blog automation studio", "Студия автоматизации блога")}
          </h1>
          <p className="text-sm text-slate-300">
            {tr(
              locale,
              "Every article is generated only after deep research and multi-step verification.",
              "Каждая статья создаётся только после deep research и многоэтапной проверки.",
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            asChild
            variant="outline"
            className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
          >
            <Link href="/admin">
              <ArrowLeft className="size-4" />
              {tr(locale, "Back to moderation", "Назад к модерации")}
            </Link>
          </Button>

          <form action={logoutAdminAction}>
            <Button
              type="submit"
              variant="outline"
              className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
            >
              {tr(locale, "Logout", "Выйти")}
            </Button>
          </form>
        </div>
      </div>

      {successMessage ? (
        <div className="mb-4 rounded-md border border-emerald-400/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mb-4 rounded-md border border-rose-400/35 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-slate-100">
              {tr(locale, "Create article with mandatory deep research", "Создать статью с обязательным deep research")}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form action={createBlogPostFromDeepResearchAction} className="space-y-4">
              <input type="hidden" name="locale" value={locale} />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="topic">{tr(locale, "Topic *", "Тема *")}</Label>
                  <Input
                    id="topic"
                    name="topic"
                    required
                    placeholder={tr(locale, "Example: MCP observability rollout", "Пример: внедрение наблюдаемости MCP")}
                    className="border-white/10 bg-slate-950/80"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="angle">{tr(locale, "Angle (optional)", "Фокус (опционально)")}</Label>
                  <Textarea
                    id="angle"
                    name="angle"
                    rows={2}
                    placeholder={tr(
                      locale,
                      "Example: focus on production controls, rollback safety, and KPIs.",
                      "Пример: сфокусироваться на контролях в продакшене, безопасном откате и KPI.",
                    )}
                    className="border-white/10 bg-slate-950/80"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="slug">{tr(locale, "Slug *", "Slug *")}</Label>
                  <Input
                    id="slug"
                    name="slug"
                    required
                    placeholder="mcp-observability-rollout"
                    className="border-white/10 bg-slate-950/80"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tags">{tr(locale, "Tags (comma-separated) *", "Теги (через запятую) *")}</Label>
                  <Input
                    id="tags"
                    name="tags"
                    required
                    defaultValue="playbook,operations,quality"
                    className="border-white/10 bg-slate-950/80"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="titleEn">{tr(locale, "Title (EN) *", "Заголовок (EN) *")}</Label>
                  <Input
                    id="titleEn"
                    name="titleEn"
                    required
                    placeholder="MCP Observability Rollout in Production"
                    className="border-white/10 bg-slate-950/80"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="titleRu">{tr(locale, "Title (RU) *", "Заголовок (RU) *")}</Label>
                  <Input
                    id="titleRu"
                    name="titleRu"
                    required
                    placeholder="Внедрение наблюдаемости MCP в продакшене"
                    className="border-white/10 bg-slate-950/80"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="recencyDays">{tr(locale, "Recency window (days)", "Окно свежести (дни)")}</Label>
                  <Input
                    id="recencyDays"
                    name="recencyDays"
                    type="number"
                    min={1}
                    max={180}
                    defaultValue={30}
                    className="border-white/10 bg-slate-950/80"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="maxSources">{tr(locale, "Max curated sources", "Максимум отобранных источников")}</Label>
                  <Input
                    id="maxSources"
                    name="maxSources"
                    type="number"
                    min={3}
                    max={12}
                    defaultValue={6}
                    className="border-white/10 bg-slate-950/80"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-500 text-white hover:bg-blue-400">
                <Sparkles className="size-4" />
                {tr(
                  locale,
                  "Run deep research, verify, and create article",
                  "Сделать deep research, проверить и создать статью",
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-slate-100">{tr(locale, "Verification policy", "Политика проверки")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-300">
            <p className="inline-flex items-center gap-2 font-medium text-slate-100">
              <Bot className="size-4" />
              {tr(locale, "Mandatory deep research", "Обязательный deep research")}
            </p>
            <ul className="list-disc space-y-2 pl-5 marker:text-cyan-300">
              <li>
                {tr(
                  locale,
                  "Relevance gate: only high-scoring sources are selected.",
                  "Проверка релевантности: используются только источники с высоким скором.",
                )}
              </li>
              <li>
                {tr(
                  locale,
                  "Freshness gate: only recent sources inside the configured window.",
                  "Проверка свежести: используются только новые источники в заданном окне.",
                )}
              </li>
              <li>
                {tr(
                  locale,
                  "Diversity + corroboration gates: several domains and repeated signals are required.",
                  "Проверка разнообразия и подтверждения: нужны разные домены и повторяющиеся сигналы.",
                )}
              </li>
            </ul>
            <p className="rounded-md border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              {tr(
                locale,
                "Set EXA_API_KEY in environment variables. Without it, article automation is blocked.",
                "Укажите EXA_API_KEY в переменных окружения. Без этого автоматизация статьи не запустится.",
              )}
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </PageFrame>
  );
}
