import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";

import {
  logoutAdminAction,
  moderateServerStatusAction,
  saveAdminDashboardSettingsAction,
} from "@/app/admin/actions";
import { PageFrame, PageHero, PageMetric, PageSection } from "@/components/page-templates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAdminDashboardSnapshot } from "@/lib/admin-dashboard";
import { tr, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getPendingServers } from "@/lib/servers";

export const metadata: Metadata = {
  title: "Moderation",
  description: "Admin moderation dashboard for pending server submissions.",
};

type AdminPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

function getFeedbackMessage({
  locale,
  success,
  error,
}: {
  locale: Locale;
  success?: string;
  error?: string;
}) {
  if (success === "active") {
    return {
      tone: "success" as const,
      text: tr(locale, "Server approved and moved to active.", "Сервер одобрен и переведён в активный статус."),
    };
  }

  if (success === "rejected") {
    return {
      tone: "success" as const,
      text: tr(locale, "Server rejected successfully.", "Сервер успешно отклонён."),
    };
  }

  if (success === "settings") {
    return {
      tone: "success" as const,
      text: tr(locale, "Dashboard settings saved.", "Настройки панели сохранены."),
    };
  }

  if (error) {
    return {
      tone: "error" as const,
      text:
        error === "supabase"
          ? tr(locale, "Supabase admin mode is not configured.", "Админ-режим Supabase не настроен.")
          : error,
    };
  }

  return null;
}

function formatCompactNumber(locale: Locale, value: number): string {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

const faqItems = [
  {
    questionEn: "Where does dashboard data come from?",
    questionRu: "Откуда берутся данные на панели?",
    answerEn:
      "Overview and analytics values come from Supabase tables: admin_dashboard_metrics, admin_server_request_distribution, and admin_system_events. Active server count is calculated from the live catalog.",
    answerRu:
      "Обзор и аналитика берутся из таблиц Supabase: admin_dashboard_metrics, admin_server_request_distribution и admin_system_events. Количество активных серверов считается из живого каталога.",
  },
  {
    questionEn: "How are settings saved?",
    questionRu: "Как сохраняются настройки?",
    answerEn:
      "The settings form writes to admin_dashboard_settings (singleton row id=1) through a protected server action and immediately revalidates /admin.",
    answerRu:
      "Форма настроек сохраняет данные в admin_dashboard_settings (одна запись с id=1) через защищённый server action и сразу ревалидирует /admin.",
  },
  {
    questionEn: "Why can values differ between environments?",
    questionRu: "Почему значения могут отличаться между окружениями?",
    answerEn:
      "Each environment has its own Supabase project and data snapshot. Local/staging/production can show different metrics and event history.",
    answerRu:
      "У каждого окружения свой проект Supabase и свой набор данных. Поэтому local/staging/production могут показывать разные метрики и историю событий.",
  },
  {
    questionEn: "What happens if Supabase is unavailable?",
    questionRu: "Что будет, если Supabase недоступен?",
    answerEn:
      "The page renders with safe fallback values for visibility, while write actions return an explicit configuration error.",
    answerRu:
      "Страница покажет безопасные fallback-значения для видимости, а операции сохранения вернут явную ошибку конфигурации.",
  },
  {
    questionEn: "How can we add new events into the feed?",
    questionRu: "Как добавить новые события в ленту?",
    answerEn:
      "Insert rows into admin_system_events (level, occurred_at, message_en, message_ru). The latest entries appear in the dashboard automatically.",
    answerRu:
      "Добавьте записи в admin_system_events (level, occurred_at, message_en, message_ru). Новые события автоматически появятся в панели.",
  },
] as const;

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const locale = await getLocale();
  const [pendingServers, dashboardSnapshot] = await Promise.all([
    getPendingServers(),
    getAdminDashboardSnapshot(),
  ]);
  const pendingCount = pendingServers.length;
  const { success, error } = await searchParams;
  const feedback = getFeedbackMessage({ locale, success, error });

  return (
    <PageFrame variant="ops">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <PageHero
          badgeTone="emerald"
          eyebrow={tr(locale, "Operations", "Операции")}
          title={tr(locale, "Moderation Dashboard", "Панель модерации")}
          description={tr(
            locale,
            "Review pending MCP submissions, approve trusted listings, and keep catalog quality high.",
            "Проверяйте ожидающие заявки MCP, одобряйте надежные листинги и поддерживайте качество каталога.",
          )}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                asChild
                variant="outline"
                className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
              >
                <Link href="/admin/blog">
                  <FileText className="size-4" />
                  {tr(locale, "Blog studio", "Студия блога")}
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
          }
          metrics={
            <PageMetric
              label={tr(locale, "Pending queue", "Очередь на модерацию")}
              value={pendingCount}
              valueClassName={pendingCount > 0 ? "text-amber-200" : "text-emerald-200"}
            />
          }
        />

        {feedback ? (
          <div
            className={`rounded-md border px-3 py-2 text-sm ${
              feedback.tone === "success"
                ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-200"
                : "border-rose-400/35 bg-rose-500/10 text-rose-200"
            }`}
          >
            {feedback.text}
          </div>
        ) : null}

        <PageSection>
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-slate-100">
                {tr(locale, "System overview", "Обзор системы")}
              </h2>
              <p className="text-sm text-slate-300">
                {tr(
                  locale,
                  "Live operational summary across core MCP infrastructure.",
                  "Оперативная сводка по ключевой MCP-инфраструктуре.",
                )}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Card className="border-white/10 bg-slate-900/70">
                <CardContent className="space-y-1 p-4">
                  <p className="text-xs tracking-wide text-slate-400 uppercase">
                    {tr(locale, "Active servers", "Активные серверы")}
                  </p>
                  <p className="text-2xl font-semibold text-emerald-200">
                    {dashboardSnapshot.overview.activeServers}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-slate-900/70">
                <CardContent className="space-y-1 p-4">
                  <p className="text-xs tracking-wide text-slate-400 uppercase">
                    {tr(locale, "Total requests", "Всего запросов")}
                  </p>
                  <p className="text-2xl font-semibold text-slate-100">
                    {formatCompactNumber(locale, dashboardSnapshot.overview.totalRequests)}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-slate-900/70">
                <CardContent className="space-y-1 p-4">
                  <p className="text-xs tracking-wide text-slate-400 uppercase">
                    {tr(locale, "Average latency", "Средняя задержка")}
                  </p>
                  <p className="text-2xl font-semibold text-cyan-200">
                    {dashboardSnapshot.overview.averageLatencyMs}ms
                  </p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-slate-900/70">
                <CardContent className="space-y-1 p-4">
                  <p className="text-xs tracking-wide text-slate-400 uppercase">Uptime</p>
                  <p className="text-2xl font-semibold text-emerald-200">
                    {dashboardSnapshot.overview.uptimePercent.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </PageSection>

        <PageSection>
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-slate-100">
                {tr(locale, "Analytics", "Аналитика")}
              </h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-white/10 bg-slate-900/70">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-slate-100">
                    {tr(locale, "Request distribution by servers", "Распределение запросов по серверам")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dashboardSnapshot.analytics.requestDistribution.map((item) => (
                    <div key={item.serverSlug} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="font-mono">{item.serverName}</span>
                        <span>{formatCompactNumber(locale, item.requestCount)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                          style={{ width: `${Math.max(item.sharePercent, 2)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-slate-900/70">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-slate-100">
                    {tr(locale, "Latest events", "Последние события")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dashboardSnapshot.analytics.latestEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 rounded-md border border-white/10 bg-slate-950/60 px-3 py-2"
                    >
                      <span className="text-xs font-mono text-slate-400">{event.timeLabel}</span>
                      <span
                        className={`inline-flex size-2 rounded-full ${
                          event.level === "success"
                            ? "bg-emerald-400"
                            : event.level === "warning"
                              ? "bg-amber-400"
                              : event.level === "error"
                                ? "bg-rose-400"
                                : "bg-slate-400"
                        }`}
                      />
                      <p className="text-sm text-slate-200">
                        {tr(locale, event.messageEn, event.messageRu)}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </PageSection>

        <PageSection>
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-slate-100">
                {tr(locale, "Settings", "Настройки")}
              </h2>
            </div>

            <form action={saveAdminDashboardSettingsAction} className="grid gap-4 lg:grid-cols-2">
              <Card className="border-white/10 bg-slate-900/70">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-slate-100">
                    {tr(locale, "General settings", "Общие настройки")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <label className="grid gap-1.5 text-sm text-slate-300">
                    <span>{tr(locale, "Status update interval (sec)", "Обновление статуса (сек)")}</span>
                    <Input
                      name="statusUpdateIntervalSec"
                      type="number"
                      min={1}
                      max={300}
                      defaultValue={dashboardSnapshot.settings.statusUpdateIntervalSec}
                      className="border-white/15 bg-slate-950/80 text-slate-100"
                    />
                  </label>

                  <label className="grid gap-1.5 text-sm text-slate-300">
                    <span>{tr(locale, "Request limit per minute", "Лимит запросов в минуту")}</span>
                    <Input
                      name="requestLimitPerMinute"
                      type="number"
                      min={1}
                      max={100000}
                      defaultValue={dashboardSnapshot.settings.requestLimitPerMinute}
                      className="border-white/15 bg-slate-950/80 text-slate-100"
                    />
                  </label>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-slate-900/70">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-slate-100">
                    {tr(locale, "Notifications", "Уведомления")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <label className="flex items-center gap-2 rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      name="notifyEmailOnErrors"
                      defaultChecked={dashboardSnapshot.settings.notifyEmailOnErrors}
                      className="size-4 rounded border-white/20 bg-slate-900 accent-cyan-400"
                    />
                    <span>{tr(locale, "Email alerts on errors", "Электронная почта при ошибках")}</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      name="notifyPushNotifications"
                      defaultChecked={dashboardSnapshot.settings.notifyPushNotifications}
                      className="size-4 rounded border-white/20 bg-slate-900 accent-cyan-400"
                    />
                    <span>{tr(locale, "Push notifications", "Push-уведомления")}</span>
                  </label>

                  <label className="flex items-center gap-2 rounded-md border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      name="notifyWebhookIntegrations"
                      defaultChecked={dashboardSnapshot.settings.notifyWebhookIntegrations}
                      className="size-4 rounded border-white/20 bg-slate-900 accent-cyan-400"
                    />
                    <span>{tr(locale, "Webhook integrations", "Webhook интеграции")}</span>
                  </label>
                </CardContent>
              </Card>

              <div className="flex justify-end lg:col-span-2">
                <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-400">
                  {tr(locale, "Save settings", "Сохранить настройки")}
                </Button>
              </div>
            </form>
          </div>
        </PageSection>

        <PageSection>
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-slate-100">
                {tr(locale, "Frequently Asked Questions", "Часто задаваемые вопросы")}
              </h2>
            </div>

            <div className="space-y-2">
              {faqItems.map((item) => (
                <details
                  key={item.questionEn}
                  className="rounded-lg border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-300 open:bg-slate-950/80"
                >
                  <summary className="cursor-pointer list-none font-medium text-slate-100">
                    {tr(locale, item.questionEn, item.questionRu)}
                  </summary>
                  <p className="mt-2 leading-6">{tr(locale, item.answerEn, item.answerRu)}</p>
                </details>
              ))}
            </div>
          </div>
        </PageSection>

        <PageSection>
          {pendingServers.length === 0 ? (
            <Card className="border-white/10 bg-slate-900/55">
              <CardHeader>
                <CardTitle className="text-slate-100">
                  {tr(locale, "No pending submissions", "Нет ожидающих заявок")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">
                {tr(
                  locale,
                  "New servers submitted through the public form will appear here.",
                  "Новые серверы, отправленные через публичную форму, появятся здесь.",
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {pendingServers.map((mcpServer) => (
                <Card key={mcpServer.id} className="border-white/10 bg-slate-900/70">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-base text-slate-100">{mcpServer.name}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-blue-500/15 text-blue-300">{mcpServer.category}</Badge>
                      <Badge variant="secondary" className="bg-white/8 text-slate-300">
                        {mcpServer.authType}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-300">{mcpServer.description}</p>
                    <p className="truncate text-xs text-slate-400">{mcpServer.serverUrl}</p>

                    <div className="flex gap-2">
                      <form action={moderateServerStatusAction} className="w-full">
                        <input type="hidden" name="serverId" value={mcpServer.id} />
                        <input type="hidden" name="status" value="active" />
                        <Button
                          type="submit"
                          className="w-full bg-emerald-500/80 text-white hover:bg-emerald-400"
                        >
                          {tr(locale, "Approve", "Одобрить")}
                        </Button>
                      </form>

                      <form action={moderateServerStatusAction} className="w-full">
                        <input type="hidden" name="serverId" value={mcpServer.id} />
                        <input type="hidden" name="status" value="rejected" />
                        <Button
                          type="submit"
                          variant="outline"
                          className="w-full border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                        >
                          {tr(locale, "Reject", "Отклонить")}
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </PageSection>
      </div>
    </PageFrame>
  );
}

