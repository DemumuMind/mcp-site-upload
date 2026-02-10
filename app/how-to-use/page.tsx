import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  KeyRound,
  ListChecks,
  ServerCog,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  TriangleAlert,
} from "lucide-react";

import { HowToConnectSection } from "@/components/how-to-connect-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCatalogSnapshot } from "@/lib/catalog/snapshot";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return {
    title: tr(locale, "Setup Guide", "Гайд по настройке"),
    description: tr(
      locale,
      "Step-by-step setup guide for connecting MCP servers and validating tool calls.",
      "Пошаговый гайд по подключению MCP-серверов и проверке вызовов инструментов.",
    ),
  };
}

const setupSteps = [
  {
    icon: ServerCog,
    title: {
      en: "1. Choose a server",
      ru: "1. Выберите сервер",
    },
    description: {
      en: "Open the catalog and select a server that matches your stack, trust requirements, and workflow.",
      ru: "Откройте каталог и выберите сервер под ваш стек, требования к доверию и сценарий работы.",
    },
  },
  {
    icon: ShieldCheck,
    title: {
      en: "2. Check trust signals",
      ru: "2. Проверьте сигналы доверия",
    },
    description: {
      en: "Review auth type, verification status, and maintainer metadata before connecting in production.",
      ru: "Перед подключением в production проверьте тип auth, статус верификации и данные мейнтейнера.",
    },
  },
  {
    icon: ClipboardCheck,
    title: {
      en: "3. Add MCP config",
      ru: "3. Добавьте MCP-конфиг",
    },
    description: {
      en: "Paste the server snippet into your client MCP config file and save.",
      ru: "Вставьте серверный фрагмент в MCP-конфиг клиента и сохраните изменения.",
    },
  },
  {
    icon: TerminalSquare,
    title: {
      en: "4. Run a smoke test",
      ru: "4. Выполните smoke-тест",
    },
    description: {
      en: "Restart the client, call one tool, and confirm that responses are stable and expected.",
      ru: "Перезапустите клиент, вызовите один инструмент и убедитесь, что ответы стабильные и ожидаемые.",
    },
  },
] as const;

const prerequisites = [
  {
    en: "MCP-compatible client (OpenAI Codex, Claude Code, Cursor, Windsurf, GitHub Copilot, VS Code, or another compatible app).",
    ru: "MCP-совместимый клиент (OpenAI Codex, Claude Code, Cursor, Windsurf, GitHub Copilot, VS Code или другое совместимое приложение).",
  },
  {
    en: "Access to your local MCP config file.",
    ru: "Доступ к локальному файлу MCP-конфига.",
  },
  {
    en: "Server credentials/token if the selected server requires authentication.",
    ru: "Учетные данные или токен сервера, если выбранный сервер требует авторизацию.",
  },
  {
    en: "Network access to the server endpoint.",
    ru: "Сетевой доступ к endpoint выбранного сервера.",
  },
] as const;

const clientGuides = [
  {
    client: "OpenAI Codex",
    badge: { en: "Codex", ru: "Codex" },
    where: {
      en: "Open MCP/Tools settings in Codex, add the server endpoint, provide auth credentials, then reload the workspace/session.",
      ru: "Откройте настройки MCP/Tools в Codex, добавьте endpoint сервера, укажите auth-данные и перезапустите workspace/сессию.",
    },
    smoke: {
      en: "Ask Codex to list tools from the connected server and execute one read-only tool call.",
      ru: "Попросите Codex показать инструменты подключенного сервера и выполнить один read-only вызов.",
    },
  },
  {
    client: "Claude Code",
    badge: { en: "CLI Agent", ru: "CLI-агент" },
    where: {
      en: "Add the server in Claude Code MCP configuration, save, and restart the agent session to load tools.",
      ru: "Добавьте сервер в MCP-конфиг Claude Code, сохраните и перезапустите сессию агента для загрузки инструментов.",
    },
    smoke: {
      en: "Run one low-risk call (health/list/read) and verify stable output shape.",
      ru: "Выполните один безопасный вызов (health/list/read) и проверьте стабильный формат ответа.",
    },
  },
  {
    client: "Cursor",
    badge: { en: "IDE", ru: "IDE" },
    where: {
      en: "Open Cursor MCP/integrations settings, add server URL and token, then reload the IDE window.",
      ru: "Откройте настройки MCP/интеграций в Cursor, добавьте URL сервера и токен, затем перезагрузите окно IDE.",
    },
    smoke: {
      en: "Call a simple tool from chat/agent mode and confirm the response arrives without timeout.",
      ru: "Вызовите простой инструмент из chat/agent-режима и убедитесь, что ответ приходит без таймаута.",
    },
  },
  {
    client: "Windsurf",
    badge: { en: "IDE", ru: "IDE" },
    where: {
      en: "Configure MCP server in Windsurf integrations, map auth, and restart agent context.",
      ru: "Настройте MCP-сервер в интеграциях Windsurf, укажите auth и перезапустите контекст агента.",
    },
    smoke: {
      en: "Run a single deterministic tool action and verify identical output on repeat.",
      ru: "Выполните одно детерминированное действие инструмента и проверьте одинаковый результат при повторе.",
    },
  },
  {
    client: "GitHub Copilot",
    badge: { en: "Copilot", ru: "Copilot" },
    where: {
      en: "Use Copilot-compatible MCP integration path (extension/settings), register endpoint and credentials, then reload VS Code.",
      ru: "Используйте MCP-интеграцию для Copilot (через extension/settings), добавьте endpoint и credentials, затем перезапустите VS Code.",
    },
    smoke: {
      en: "Trigger a tool-assisted Copilot request and verify that MCP tool outputs are available to the agent.",
      ru: "Запустите tool-assisted запрос Copilot и проверьте, что вывод MCP-инструментов доступен агенту.",
    },
  },
  {
    client: "VS Code",
    badge: { en: "Editor", ru: "Редактор" },
    where: {
      en: "Configure MCP server through your chosen VS Code agent extension and keep endpoint/auth in local settings.",
      ru: "Настройте MCP-сервер через выбранное агентное расширение VS Code и храните endpoint/auth в локальных settings.",
    },
    smoke: {
      en: "Run one tool call from the extension chat and confirm logs show a successful MCP handshake.",
      ru: "Выполните один вызов инструмента из чата расширения и проверьте в логах успешный MCP-handshake.",
    },
  },
  {
    client: "And more",
    badge: { en: "Other clients", ru: "Другие клиенты" },
    where: {
      en: "For any MCP-compatible client: add endpoint, auth, and transport settings (SSE/HTTP/stdin) according to the client docs.",
      ru: "Для любого MCP-совместимого клиента: добавьте endpoint, auth и transport-настройки (SSE/HTTP/stdin) по документации клиента.",
    },
    smoke: {
      en: "Validate with the same 3-step test: list tools -> run read-only tool -> verify stable response schema.",
      ru: "Проверьте тем же 3-шаговым тестом: list tools -> read-only вызов -> проверка стабильной схемы ответа.",
    },
  },
] as const;

const troubleshooting = [
  {
    problem: {
      en: "Server does not appear in the client",
      ru: "Сервер не появляется в клиенте",
    },
    fix: {
      en: "Validate JSON syntax, restart the client fully, then check logs for config parse errors.",
      ru: "Проверьте синтаксис JSON, полностью перезапустите клиент и посмотрите логи на ошибки парсинга конфига.",
    },
  },
  {
    problem: {
      en: "Authentication errors",
      ru: "Ошибки авторизации",
    },
    fix: {
      en: "Confirm token scope and expiration. Rotate the token if needed and avoid hardcoding secrets in git.",
      ru: "Проверьте scope и срок действия токена. При необходимости выпустите новый и не храните секреты в git.",
    },
  },
  {
    problem: {
      en: "Tool call timeouts",
      ru: "Таймауты вызовов инструментов",
    },
    fix: {
      en: "Verify endpoint availability, inspect firewall/proxy settings, and test the server outside the client first.",
      ru: "Проверьте доступность endpoint, настройки firewall/proxy и протестируйте сервер отдельно от клиента.",
    },
  },
] as const;

const bestPractices = [
  {
    en: "Start with one server per workflow and expand only after stable smoke tests.",
    ru: "Начинайте с одного сервера на workflow и расширяйте список только после стабильных smoke-тестов.",
  },
  {
    en: "Track auth changes and token rotations in your internal runbook.",
    ru: "Фиксируйте изменения auth и ротации токенов во внутреннем runbook.",
  },
  {
    en: "Keep MCP config in local environment and out of shared repositories.",
    ru: "Храните MCP-конфиг локально и не добавляйте его в общие репозитории.",
  },
  {
    en: "Use verification and maintainer signals before enabling production workflows.",
    ru: "Проверяйте верификацию и сигналы мейнтейнера перед включением production-workflow.",
  },
] as const;

export default async function HowToUsePage() {
  const locale = await getLocale();
  const catalogSnapshot = await getCatalogSnapshot({ featuredLimit: 1 });
  const sampleServer = catalogSnapshot.sampleServer;

  return (
    <div className="relative overflow-hidden border-t border-white/10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#02070f_0%,#030a15_42%,#050814_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_14%_4%,rgba(56,189,248,0.28),transparent_42%),radial-gradient(circle_at_84%_6%,rgba(59,130,246,0.18),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(56,189,248,0.06)_1px,transparent_1px),linear-gradient(rgba(56,189,248,0.05)_1px,transparent_1px)] bg-[size:42px_42px] opacity-30" />

      <section className="mx-auto w-full max-w-6xl px-4 pb-6 pt-10 sm:px-6 sm:pt-14">
        <div className="space-y-5 rounded-3xl border border-cyan-400/25 bg-slate-950/72 p-6 sm:p-10">
          <Badge className="w-fit border-cyan-400/35 bg-cyan-500/10 text-cyan-200">
            <Sparkles className="size-3" />
            {tr(locale, "Developer-First Onboarding", "Developer-first онбординг")}
          </Badge>

          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-100 sm:text-6xl">
              {tr(locale, "Setup Guide", "Гайд по настройке")}
            </h1>
            <p className="max-w-4xl text-base leading-8 text-slate-300 sm:text-lg">
              {tr(
                locale,
                "A practical playbook to connect MCP servers, validate trust and auth signals, and move to production safely.",
                "Практический гайд по подключению MCP-серверов, проверке trust/auth-сигналов и безопасному выходу в production.",
              )}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-11 rounded-xl bg-blue-500 px-6 text-white hover:bg-blue-400">
              <Link href="/catalog">
                {tr(locale, "Open Catalog", "Открыть каталог")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl border-white/20 bg-slate-950/70 text-slate-100 hover:bg-slate-900"
            >
              <Link href="#quick-start">
                <ListChecks className="size-4" />
                  {tr(locale, "Jump to Quick Start", "Перейти к быстрому старту")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="quick-start" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-5 space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
            {tr(locale, "Quick Start", "Быстрый старт")}
          </h2>
          <p className="text-sm text-slate-300 sm:text-base">
            {tr(
              locale,
              "Use this sequence for the fastest and lowest-risk setup.",
              "Используйте эту последовательность для самой быстрой и безопасной настройки.",
            )}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {setupSteps.map((step) => (
            <Card
              key={step.title.en}
              className="border-white/10 bg-slate-950/75 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/35"
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xl text-slate-100">
                  <span className="inline-flex size-8 items-center justify-center rounded-full border border-cyan-400/35 bg-cyan-500/10 text-cyan-200">
                    <step.icon className="size-4" />
                  </span>
                  {tr(locale, step.title.en, step.title.ru)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-slate-300">
                {tr(locale, step.description.en, step.description.ru)}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/10 bg-slate-950/75">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-100">
              <CheckCircle2 className="size-5 text-cyan-300" />
              {tr(locale, "Before You Start", "Перед началом")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm leading-7 text-slate-300">
              {prerequisites.map((item) => (
                <li key={item.en} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-300" />
                  <span>{tr(locale, item.en, item.ru)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-950/75">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-100">
              <KeyRound className="size-5 text-cyan-300" />
              {tr(locale, "Client Setup Matrix", "Матрица настройки клиентов")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {clientGuides.map((item) => (
              <div key={item.client} className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold tracking-[0.1em] text-slate-200 uppercase">{item.client}</p>
                  <Badge variant="outline" className="border-cyan-400/30 bg-cyan-500/10 text-cyan-200">
                    {tr(locale, item.badge.en, item.badge.ru)}
                  </Badge>
                </div>
                <p className="text-xs leading-6 text-slate-300">{tr(locale, item.where.en, item.where.ru)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-5 space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
            {tr(
              locale,
              "Client-specific Setup (OpenAI Codex, Claude Code, Cursor, Windsurf, GitHub Copilot, VS Code, and more)",
              "Настройка по клиентам (OpenAI Codex, Claude Code, Cursor, Windsurf, GitHub Copilot, VS Code и другие)",
            )}
          </h2>
          <p className="text-sm text-slate-300 sm:text-base">
            {tr(
              locale,
              "Follow the exact flow for your client and finish with a smoke test before enabling production workflows.",
              "Используйте точный flow для вашего клиента и завершайте настройку smoke-тестом перед запуском production-workflow.",
            )}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {clientGuides.map((item) => (
            <Card key={`${item.client}-setup`} className="border-white/10 bg-slate-950/75">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between gap-2 text-lg text-slate-100">
                  <span>{item.client}</span>
                  <Badge variant="outline" className="border-cyan-400/30 bg-cyan-500/10 text-cyan-200">
                    {tr(locale, item.badge.en, item.badge.ru)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-slate-300">
                <div>
                  <p className="text-xs font-semibold tracking-[0.1em] text-slate-400 uppercase">
                    {tr(locale, "Where to configure", "Где настраивать")}
                  </p>
                  <p>{tr(locale, item.where.en, item.where.ru)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-[0.1em] text-slate-400 uppercase">
                    {tr(locale, "Smoke test", "Smoke-тест")}
                  </p>
                  <p>{tr(locale, item.smoke.en, item.smoke.ru)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <HowToConnectSection
          serverName={sampleServer?.name || "MCP Server"}
          serverUrl={sampleServer?.serverUrl || "https://example-mcp-server.dev/sse"}
        />
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-5 space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
            {tr(locale, "Troubleshooting", "Диагностика проблем")}
          </h2>
          <p className="text-sm text-slate-300 sm:text-base">
            {tr(
              locale,
              "If setup fails, use this checklist before changing architecture or replacing tools.",
              "Если настройка не работает, пройдите этот чеклист до смены архитектуры или инструментов.",
            )}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {troubleshooting.map((item) => (
            <Card key={item.problem.en} className="border-white/10 bg-slate-950/75">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-100">
                  <TriangleAlert className="size-4 text-amber-300" />
                  {tr(locale, item.problem.en, item.problem.ru)}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-slate-300">
                {tr(locale, item.fix.en, item.fix.ru)}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        <div className="rounded-3xl border border-cyan-400/20 bg-[linear-gradient(90deg,rgba(10,25,47,0.92),rgba(4,47,70,0.88))] p-6 sm:p-10">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
            {tr(locale, "Production Best Practices", "Рекомендации для production")}
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-200 sm:text-base">
            {bestPractices.map((item) => (
              <li key={item.en} className="flex items-start gap-2">
                <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-300" />
                <span>{tr(locale, item.en, item.ru)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-11 rounded-xl bg-blue-500 px-6 text-white hover:bg-blue-400">
              <Link href="/catalog">
                {tr(locale, "Browse MCP Servers", "Смотреть MCP-серверы")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-xl border-white/20 bg-slate-950/65 text-slate-100 hover:bg-slate-900"
            >
              <Link href="/submit-server#submit">{tr(locale, "Submit Your Server", "Отправить свой сервер")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
