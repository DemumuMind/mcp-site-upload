import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bot, Sparkles } from "lucide-react";

import {
  createBlogPostFromDeepResearchAction,
  logoutAdminAction,
  runRuBlogBackfillAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getRecentBlogRuBackfillRuns } from "@/lib/blog/backfill";
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
    backfillChanged?: string;
    backfillApplied?: string;
    backfillErrors?: string;
    backfillTableChanged?: string;
    backfillStorageChanged?: string;
    backfillLimit?: string;
    backfillRunId?: string;
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

function parseCounter(value?: string): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function formatRunDate(isoDate: string, locale: "en" | "ru"): string {
  try {
    return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

function statusLabel(locale: "en" | "ru", status: "success" | "partial" | "failed"): string {
  if (status === "success") {
    return tr(locale, "Success", "Успех");
  }

  if (status === "partial") {
    return tr(locale, "Partial", "Частично");
  }

  return tr(locale, "Failed", "Ошибка");
}

function statusToneClass(status: "success" | "partial" | "failed"): string {
  if (status === "success") {
    return "border-emerald-400/35 bg-emerald-500/10 text-emerald-200";
  }

  if (status === "partial") {
    return "border-amber-400/35 bg-amber-500/10 text-amber-200";
  }

  return "border-rose-400/35 bg-rose-500/10 text-rose-200";
}

export default async function AdminBlogPage({ searchParams }: AdminBlogPageProps) {
  const locale = await getLocale();
  const {
    success,
    error,
    slug,
    research,
    sources,
    backfillChanged,
    backfillApplied,
    backfillErrors,
    backfillTableChanged,
    backfillStorageChanged,
    backfillLimit,
    backfillRunId,
  } = await searchParams;

  let backfillHistory = {
    available: false,
    runs: [] as Awaited<ReturnType<typeof getRecentBlogRuBackfillRuns>>["runs"],
  };

  try {
    backfillHistory = await getRecentBlogRuBackfillRuns(8);
  } catch {
    backfillHistory = {
      available: false,
      runs: [],
    };
  }

  const successMessage =
    success === "created"
      ? tr(
          locale,
          `Post created: ${slug}. Deep research packet: ${research}. Sources used: ${sources}.`,
          `Статья создана: ${slug}. Пакет deep research: ${research}. Использовано источников: ${sources}.`,
        )
      : success === "backfill"
        ? tr(
            locale,
            `RU backfill completed. Changed: ${parseCounter(backfillChanged)}, applied: ${parseCounter(backfillApplied)}, errors: ${parseCounter(backfillErrors)}. Table changed: ${parseCounter(backfillTableChanged)}. Storage changed: ${parseCounter(backfillStorageChanged)}. Limit: ${parseCounter(backfillLimit)}.${backfillRunId ? ` Run ID: ${backfillRunId}.` : ""}`,
            `RU backfill завершён. Изменено: ${parseCounter(backfillChanged)}, применено: ${parseCounter(backfillApplied)}, ошибок: ${parseCounter(backfillErrors)}. Изменено в таблице: ${parseCounter(backfillTableChanged)}. Изменено в storage: ${parseCounter(backfillStorageChanged)}. Лимит: ${parseCounter(backfillLimit)}.${backfillRunId ? ` Run ID: ${backfillRunId}.` : ""}`,
          )
        : null;

  const errorMessage = error ? tr(locale, formatError(error) ?? error, formatError(error) ?? error) : null;

  return (
    <div className="relative overflow-hidden border-t border-white/10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#060a14_0%,#070c18_48%,#050913_100%)]" />
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

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
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

            <div className="space-y-2 rounded-md border border-cyan-400/25 bg-cyan-500/10 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-cyan-200">
                {tr(locale, "RU copy maintenance", "Обслуживание RU-копии")}
              </p>
              <p className="text-xs text-slate-300">
                {tr(
                  locale,
                  "Runs a one-time normalization pass for legacy deep-research auto-posts (table + storage).",
                  "Запускает разовую нормализацию legacy deep-research автопостов (таблица + storage).",
                )}
              </p>

              <form action={runRuBlogBackfillAction} className="space-y-2">
                <div className="space-y-1.5">
                  <Label htmlFor="backfillLimit">{tr(locale, "Scan limit", "Лимит сканирования")}</Label>
                  <Input
                    id="backfillLimit"
                    name="backfillLimit"
                    type="number"
                    min={1}
                    max={5000}
                    defaultValue={500}
                    className="border-white/10 bg-slate-950/80"
                  />
                </div>

                <Button type="submit" className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                  {tr(locale, "Run RU backfill now", "Запустить RU backfill сейчас")}
                </Button>
              </form>

              <div className="rounded-md border border-white/10 bg-slate-950/60 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-100">
                  {tr(locale, "Recent backfill runs", "Последние backfill-запуски")}
                </p>

                {backfillHistory.available ? (
                  backfillHistory.runs.length > 0 ? (
                    <ul className="mt-2 space-y-2">
                      {backfillHistory.runs.map((run) => (
                        <li key={run.id} className="rounded-md border border-white/10 bg-white/[0.02] p-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusToneClass(run.status)}`}
                            >
                              {statusLabel(locale, run.status)}
                            </span>

                            <span className="text-[11px] text-slate-400">{formatRunDate(run.createdAt, locale)}</span>
                          </div>

                          <p className="mt-1 text-[11px] text-slate-300">
                            {tr(
                              locale,
                              `Changed ${run.changed}, applied ${run.applied}, errors ${run.errors}, table ${run.table.changed}, storage ${run.storage.changed}, limit ${run.scanLimit}.`,
                              `Изменено ${run.changed}, применено ${run.applied}, ошибок ${run.errors}, таблица ${run.table.changed}, storage ${run.storage.changed}, лимит ${run.scanLimit}.`,
                            )}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-500">
                            {tr(locale, "Run ID", "Run ID")}: {run.id}
                          </p>

                          {run.errorMessage ? (
                            <p className="mt-1 text-[11px] text-rose-300">{run.errorMessage}</p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-[11px] text-slate-400">
                      {tr(locale, "No backfill runs recorded yet.", "История backfill пока пустая.")}
                    </p>
                  )
                ) : (
                  <p className="mt-2 text-[11px] text-amber-200">
                    {tr(
                      locale,
                      "Backfill history table is unavailable. Apply Supabase migration to enable audit log.",
                      "Таблица истории backfill недоступна. Примените Supabase-миграцию для включения аудита.",
                    )}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
