import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  ExternalLink,
  Handshake,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Unlock,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { tr, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getServerBySlug } from "@/lib/servers";
import type { AuthType, HealthStatus, VerificationLevel } from "@/lib/types";

type ServerDetailPageProps = {
  params: Promise<{ slug: string }>;
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

const authBadgeConfig: Record<AuthType, { labelEn: string; labelRu: string; icon: typeof Unlock }> = {
  none: { labelEn: "Open", labelRu: "Открытый", icon: Unlock },
  api_key: { labelEn: "API Key", labelRu: "API ключ", icon: KeyRound },
  oauth: { labelEn: "OAuth", labelRu: "OAuth", icon: LockKeyhole },
};

const verificationBadgeConfig: Record<
  VerificationLevel,
  { labelEn: string; labelRu: string; icon: typeof ShieldCheck }
> = {
  community: { labelEn: "Community", labelRu: "Сообщество", icon: Users },
  partner: { labelEn: "Partner", labelRu: "Партнер", icon: Handshake },
  official: { labelEn: "Official", labelRu: "Официальный", icon: BadgeCheck },
};

function formatCheckedAt(value: string | undefined, locale: Locale): string {
  if (!value) {
    return tr(locale, "Not checked yet", "Пока не проверялся");
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return tr(locale, "Not checked yet", "Пока не проверялся");
  }

  return date.toLocaleString(locale === "ru" ? "ru-RU" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function generateMetadata({
  params,
}: ServerDetailPageProps): Promise<Metadata> {
  const locale = await getLocale();
  const { slug } = await params;
  const mcpServer = await getServerBySlug(slug);

  if (!mcpServer) {
    return {
      title: tr(locale, "Server not found", "Сервер не найден"),
      description: tr(
        locale,
        "The requested MCP server does not exist or is not active.",
        "Запрошенный MCP-сервер не существует или не активен.",
      ),
    };
  }

  const title = `${mcpServer.name} MCP Server`;

  return {
    title,
    description: mcpServer.description,
    openGraph: {
      title,
      description: mcpServer.description,
      type: "article",
      url: `/server/${mcpServer.slug}`,
    },
    twitter: {
      card: "summary",
      title,
      description: mcpServer.description,
    },
  };
}

export default async function ServerDetailPage({ params }: ServerDetailPageProps) {
  const locale = await getLocale();
  const { slug } = await params;
  const mcpServer = await getServerBySlug(slug);

  if (!mcpServer) {
    notFound();
  }

  const healthStatus = mcpServer.healthStatus ?? "unknown";
  const healthBadge = healthBadgeConfig[healthStatus];
  const authBadge = authBadgeConfig[mcpServer.authType];
  const AuthIcon = authBadge.icon;
  const verificationBadge = verificationBadgeConfig[mcpServer.verificationLevel];
  const VerificationIcon = verificationBadge.icon;
  const visitUrl = mcpServer.repoUrl || mcpServer.serverUrl;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${mcpServer.name} MCP Server`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description: mcpServer.description,
    url: mcpServer.repoUrl || mcpServer.serverUrl,
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-6">
        <Button asChild variant="ghost" className="px-0 text-slate-300 hover:text-white">
          <Link href="/">
            <ArrowLeft className="size-4" />
            {tr(locale, "Back to catalog", "Назад в каталог")}
          </Link>
        </Button>
      </div>

      <Card className="border-white/10 bg-slate-900/70">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
                {mcpServer.name}
              </h1>
              <p className="text-sm text-slate-300">{mcpServer.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge className="bg-blue-500/15 text-blue-300">{mcpServer.category}</Badge>
              <Badge variant="outline" className="border-white/10 bg-slate-950/70 text-slate-300">
                <AuthIcon className="mr-1 size-3" />
                {tr(locale, authBadge.labelEn, authBadge.labelRu)}
              </Badge>
              <Badge variant="outline" className="border-white/15 text-slate-300">
                <VerificationIcon className="mr-1 size-3" />
                {tr(locale, verificationBadge.labelEn, verificationBadge.labelRu)}
              </Badge>
              <Badge variant="outline" className={healthBadge.className}>
                <span className={`mr-1 inline-block size-1.5 rounded-full ${healthBadge.dotClassName}`} />
                {tr(locale, healthBadge.labelEn, healthBadge.labelRu)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-slate-400 uppercase">
              {tr(locale, "Server URL", "URL сервера")}
            </p>
            <p className="break-all text-sm text-slate-200">{mcpServer.serverUrl}</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-medium text-slate-100">
              {tr(locale, "Available tools", "Доступные инструменты")}
            </h2>
            {mcpServer.tools.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {mcpServer.tools.map((toolName) => (
                  <Badge key={toolName} variant="outline" className="border-white/12 text-slate-300">
                    {toolName}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                {tr(locale, "No tool list published yet.", "Список инструментов пока не опубликован.")}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
            <p className="mb-2 text-xs font-medium tracking-wide text-slate-400 uppercase">
              {tr(locale, "Health check", "Проверка состояния")}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span>
                {tr(locale, "Status", "Статус")}: {tr(locale, healthBadge.labelEn, healthBadge.labelRu)}
              </span>
              <span>
                {tr(locale, "Last checked", "Последняя проверка")}: {formatCheckedAt(mcpServer.healthCheckedAt, locale)}
              </span>
            </div>
            {mcpServer.healthError ? (
              <p className="mt-2 text-xs text-rose-200">
                {tr(locale, "Last error", "Последняя ошибка")}: {mcpServer.healthError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            {visitUrl ? (
              <Button asChild className="bg-blue-500 hover:bg-blue-400">
                <Link href={visitUrl} target="_blank" rel="noreferrer">
                  {tr(locale, "Visit", "Открыть")}
                  <ExternalLink className="size-4" />
                </Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
