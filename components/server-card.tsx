"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, ExternalLink, KeyRound, LockKeyhole, ShieldCheck, Unlock } from "lucide-react";
import { toast } from "sonner";

import { useLocale } from "@/components/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { tr } from "@/lib/i18n";
import type { AuthType, HealthStatus, McpServer } from "@/lib/types";

const authBadgeConfig: Record<AuthType, { labelEn: string; labelRu: string; icon: typeof Unlock }> = {
  none: { labelEn: "Open", labelRu: "Открытый", icon: Unlock },
  api_key: { labelEn: "API Key", labelRu: "API ключ", icon: KeyRound },
  oauth: { labelEn: "OAuth", labelRu: "OAuth", icon: LockKeyhole },
};

const verificationBadgeConfig = {
  community: { en: "Community", ru: "Сообщество" },
  partner: { en: "Partner", ru: "Партнер" },
  official: { en: "Official", ru: "Официальный" },
};

const healthBadgeConfig: Record<
  HealthStatus,
  { labelEn: string; labelRu: string; className: string; dotClassName: string }
> = {
  healthy: {
    labelEn: "Healthy",
    labelRu: "Стабильно",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    dotClassName: "bg-emerald-400",
  },
  degraded: {
    labelEn: "Degraded",
    labelRu: "Проблемы",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    dotClassName: "bg-amber-300",
  },
  down: {
    labelEn: "Down",
    labelRu: "Недоступен",
    className: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    dotClassName: "bg-rose-300",
  },
  unknown: {
    labelEn: "Unknown",
    labelRu: "Неизвестно",
    className: "border-white/10 bg-white/5 text-slate-300",
    dotClassName: "bg-slate-400",
  },
};

type ServerCardProps = {
  mcpServer: McpServer;
};

export function ServerCard({ mcpServer }: ServerCardProps) {
  const locale = useLocale();
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const authBadge = authBadgeConfig[mcpServer.authType];
  const AuthIcon = authBadge.icon;
  const visitUrl = mcpServer.repoUrl || mcpServer.serverUrl;
  const healthStatus = mcpServer.healthStatus ?? "unknown";
  const healthBadge = healthBadgeConfig[healthStatus];

  async function handleCopyServerUrl() {
    if (!mcpServer.serverUrl) {
      toast.error(tr(locale, "Server URL is not available", "URL сервера недоступен"));
      return;
    }

    try {
      await navigator.clipboard.writeText(mcpServer.serverUrl);
      toast.success(
        tr(
          locale,
          `${mcpServer.name}: URL copied to clipboard`,
          `${mcpServer.name}: URL скопирован в буфер обмена`,
        ),
      );
    } catch {
      toast.error(tr(locale, "Failed to copy URL", "Не удалось скопировать URL"));
    }
  }

  return (
    <Card className="border-white/10 bg-slate-900/70 shadow-[0_0_0_1px_rgba(148,163,184,0.05)] transition hover:border-blue-400/45 hover:shadow-[0_0_0_1px_rgba(59,130,246,0.4),0_0_24px_rgba(59,130,246,0.18)]">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base leading-tight text-slate-100">
            <Link className="hover:text-blue-300" href={`/server/${mcpServer.slug}`}>
              {mcpServer.name}
            </Link>
          </CardTitle>
          <Badge
            variant="outline"
            className="gap-1 border-white/10 bg-slate-950/70 text-slate-300"
          >
            <AuthIcon className="size-3" />
            {tr(locale, authBadge.labelEn, authBadge.labelRu)}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-blue-500/15 text-blue-300">{mcpServer.category}</Badge>
          <Badge variant="secondary" className="bg-white/5 text-slate-300">
            <ShieldCheck className="mr-1 size-3" />
            {tr(
              locale,
              verificationBadgeConfig[mcpServer.verificationLevel].en,
              verificationBadgeConfig[mcpServer.verificationLevel].ru,
            )}
          </Badge>
          <Badge variant="outline" className={healthBadge.className}>
            <span className={`mr-1 inline-block size-1.5 rounded-full ${healthBadge.dotClassName}`} />
            {tr(locale, healthBadge.labelEn, healthBadge.labelRu)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="line-clamp-3 text-sm text-slate-300">{mcpServer.description}</p>

        <div className="rounded-xl border border-white/10 bg-slate-950/70 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs font-medium tracking-wide text-slate-400 uppercase">
              {tr(locale, "Server URL", "URL сервера")}
            </span>
            <button
              type="button"
              onClick={handleCopyServerUrl}
              className="inline-flex items-center gap-1 text-xs text-blue-300 transition hover:text-blue-200"
            >
              <Copy className="size-3.5" />
              {tr(locale, "Copy", "Копировать")}
            </button>
          </div>
          <p className="truncate text-sm text-slate-200">{mcpServer.serverUrl || "N/A"}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {mcpServer.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      </CardContent>

      <CardFooter className="grid w-full grid-cols-2 gap-2">
        <Button
          asChild
          variant="outline"
          className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
        >
          <Link href={`/server/${mcpServer.slug}`}>{tr(locale, "Details", "Детали")}</Link>
        </Button>

        {visitUrl ? (
          <Button
            asChild
            variant="outline"
            className="border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
          >
            <Link href={visitUrl} target="_blank" rel="noreferrer">
              {tr(locale, "Visit", "Открыть")}
              <ExternalLink className="size-4" />
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            disabled
            className="border-white/10 bg-white/[0.02]"
          >
            {tr(locale, "Visit", "Открыть")}
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          className="col-span-2 bg-white/[0.02] hover:bg-blue-500/15"
          onClick={() => setToolsExpanded((isExpanded) => !isExpanded)}
        >
          {toolsExpanded
            ? tr(locale, "Hide Tools", "Скрыть инструменты")
            : tr(locale, `Tools (${mcpServer.tools.length})`, `Инструменты (${mcpServer.tools.length})`)}
        </Button>

        {toolsExpanded ? (
          <div className="col-span-2 space-y-3 rounded-xl border border-white/10 bg-slate-950/70 p-3">
            {mcpServer.tools.length > 0 ? (
              <div className="max-h-40 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {mcpServer.tools.map((toolName) => (
                    <Badge
                      key={toolName}
                      variant="outline"
                      className="border-white/12 text-slate-300"
                    >
                      {toolName}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                {tr(locale, "No tools published for this server yet.", "Для этого сервера пока не опубликованы инструменты.")}
              </p>
            )}

            <Button
              asChild
              variant="outline"
              className="w-full border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
            >
              <Link href={`/server/${mcpServer.slug}`}>
                {tr(locale, "Open full details", "Открыть полные детали")}
              </Link>
            </Button>
          </div>
        ) : null}
      </CardFooter>
    </Card>
  );
}
