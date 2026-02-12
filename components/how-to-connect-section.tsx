"use client";

import { useMemo } from "react";
import { CheckCircle2, Copy, FileCode2, Search } from "lucide-react";
import { toast } from "sonner";

import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";

type HowToConnectSectionProps = {
  serverName: string;
  serverUrl: string;
  onConfigCopied?: () => void;
};

function toConfigKey(serverName: string): string {
  return serverName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function HowToConnectSection({
  serverName,
  serverUrl,
  onConfigCopied,
}: HowToConnectSectionProps) {
  const locale = useLocale();

  const configSnippet = useMemo(() => {
    const configKey = toConfigKey(serverName) || "example-server";

    return JSON.stringify(
      {
        mcpServers: {
          [configKey]: {
            type: "sse",
            url: serverUrl,
          },
        },
      },
      null,
      2,
    );
  }, [serverName, serverUrl]);

  async function handleCopyConfig() {
    try {
      await navigator.clipboard.writeText(configSnippet);
      onConfigCopied?.();
      toast.success(
        tr(locale, "Config snippet copied to clipboard.", "Конфиг скопирован в буфер обмена."),
      );
    } catch {
      toast.error(
        tr(locale, "Unable to copy config snippet.", "Не удалось скопировать конфиг."),
      );
    }
  }

  return (
    <section
      id="how-to-use"
      className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/55 p-6 sm:p-8"
    >
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-slate-100">
          {tr(locale, "How to connect an MCP server", "Как подключить MCP-сервер")}
        </h3>
        <p className="max-w-3xl text-sm text-slate-300">
          {tr(
            locale,
            "Use this quick flow for Claude Desktop and other MCP-compatible clients. Pick a server, paste config, restart the client, and test a tool call.",
            "Используйте этот быстрый сценарий для Claude Desktop и других MCP-клиентов: выберите сервер, вставьте конфиг, перезапустите клиент и проверьте вызов инструмента.",
          )}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/10 bg-slate-950/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-slate-100">
              <Search className="size-4 text-cyan-300" />
              {tr(locale, "1. Select server", "1. Выберите сервер")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            {tr(
              locale,
              "Open the catalog and choose a server that matches your workflow and auth requirements.",
              "Откройте каталог и выберите сервер под ваш workflow и требования к авторизации.",
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-950/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-slate-100">
              <FileCode2 className="size-4 text-cyan-300" />
              {tr(locale, "2. Add config", "2. Добавьте конфиг")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            {tr(
              locale,
              "Copy this snippet into your claude_desktop_config.json file.",
              "Скопируйте этот фрагмент в файл claude_desktop_config.json.",
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-950/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-slate-100">
              <CheckCircle2 className="size-4 text-emerald-300" />
              {tr(locale, "3. Verify tools", "3. Проверьте инструменты")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            {tr(
              locale,
              "Restart your client and call one tool from this server to confirm connectivity.",
              "Перезапустите клиент и вызовите один инструмент этого сервера для проверки подключения.",
            )}
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-950/80 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-slate-300">
            {tr(locale, "Example config for", "Пример конфига для")} {" "}
            <span className="font-medium text-slate-100">{serverName}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
            onClick={handleCopyConfig}
          >
            <Copy className="size-4" />
            {tr(locale, "Copy config", "Копировать конфиг")}
          </Button>
        </div>
        <pre className="overflow-x-auto rounded-lg border border-white/10 bg-slate-900/80 p-3 text-xs text-slate-200">
          <code>{configSnippet}</code>
        </pre>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <CheckCircle2 className="size-4 text-emerald-300" />
        {tr(
          locale,
          "Tip: keep endpoint secrets out of source control and store them via environment variables where possible.",
          "Совет: не храните секреты endpoint в репозитории; используйте переменные окружения.",
        )}
      </div>
    </section>
  );
}
