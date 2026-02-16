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

import { PageFrame } from "@/components/page-templates";
import { ServerLogo } from "@/components/server-logo";
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
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
  healthy: {
    label: "Healthy",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    dotClassName: "bg-emerald-400",
  },
  degraded: {
    label: "Degraded",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    dotClassName: "bg-amber-300",
  },
  down: {
    label: "Down",
    className: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    dotClassName: "bg-rose-300",
  },
  unknown: {
    label: "Unknown",
    className: "border-white/10 bg-primary/5 text-violet-200",
    dotClassName: "bg-violet-300",
  },
};

const authBadgeConfig: Record<
  AuthType,
  {
    label: string;
    icon: typeof Unlock;
  }
> = {
  none: { label: "Open", icon: Unlock },
  api_key: { label: "API Key", icon: KeyRound },
  oauth: { label: "OAuth", icon: LockKeyhole },
};

const verificationBadgeConfig: Record<
  VerificationLevel,
  {
    label: string;
    icon: typeof ShieldCheck;
  }
> = {
  community: { label: "Community", icon: Users },
  partner: { label: "Partner", icon: Handshake },
  official: { label: "Official", icon: BadgeCheck },
};

function formatCheckedAt(value: string | undefined, locale: Locale): string {
  if (!value) {
    return tr(locale, "Not checked yet", "Not checked yet");
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return tr(locale, "Not checked yet", "Not checked yet");
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function generateMetadata({ params }: ServerDetailPageProps): Promise<Metadata> {
  const locale = await getLocale();
  const { slug } = await params;
  const mcpServer = await getServerBySlug(slug);

  if (!mcpServer) {
    return {
      title: tr(locale, "Server not found", "Server not found"),
      description: tr(
        locale,
        "The requested MCP server does not exist or is not active.",
        "The requested MCP server does not exist or is not active.",
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
    <PageFrame variant="directory">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <div className="mb-6">
          <Button asChild variant="ghost" className="px-0 text-violet-200 hover:text-white">
            <Link href="/catalog">
              <ArrowLeft className="size-4" />
              {tr(locale, "Back to catalog", "Back to catalog")}
            </Link>
          </Button>
        </div>

        <Card className="border-white/10 bg-indigo-900/70">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-4">
                <ServerLogo
                  mcpServer={mcpServer}
                  className="size-16 border-white/20 bg-primary/90 sm:size-20"
                  imageClassName="h-full w-full object-contain p-2"
                  symbolClassName="text-3xl sm:text-4xl"
                />

                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-violet-50">{mcpServer.name}</h1>
                  <p className="text-sm text-violet-200">{mcpServer.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-500/15 text-blue-300">{mcpServer.category}</Badge>
                <Badge variant="outline" className="border-white/10 bg-card/70 text-violet-200">
                  <AuthIcon className="mr-1 size-3" />
                  {tr(locale, authBadge.label, authBadge.label)}
                </Badge>
                <Badge variant="outline" className="border-white/15 text-violet-200">
                  <VerificationIcon className="mr-1 size-3" />
                  {tr(locale, verificationBadge.label, verificationBadge.label)}
                </Badge>
                <Badge variant="outline" className={healthBadge.className}>
                  <span className={`mr-1 inline-block size-1.5 rounded-full ${healthBadge.dotClassName}`} />
                  {tr(locale, healthBadge.label, healthBadge.label)}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-card/70 p-4">
              <p className="mb-2 text-xs font-medium tracking-wide text-violet-300 uppercase">{tr(locale, "Server URL", "Server URL")}</p>
              <p className="break-all text-sm text-violet-100">{mcpServer.serverUrl}</p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-medium text-violet-50">{tr(locale, "Available tools", "Available tools")}</h2>
              {mcpServer.tools.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {mcpServer.tools.map((toolName) => (
                    <Badge key={toolName} variant="outline" className="border-white/12 text-violet-200">
                      {toolName}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-violet-300">{tr(locale, "No tool list published yet.", "No tool list published yet.")}</p>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-card/70 p-4">
              <p className="mb-2 text-xs font-medium tracking-wide text-violet-300 uppercase">{tr(locale, "Health check", "Health check")}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-violet-200">
                <span>
                  {tr(locale, "Status", "Status")}: {tr(locale, healthBadge.label, healthBadge.label)}
                </span>
                <span>
                  {tr(locale, "Last checked", "Last checked")}: {formatCheckedAt(mcpServer.healthCheckedAt, locale)}
                </span>
              </div>
              {mcpServer.healthError ? (
                <p className="mt-2 text-xs text-rose-200">
                  {tr(locale, "Last error", "Last error")}: {mcpServer.healthError}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              {visitUrl ? (
                <Button asChild className="bg-blue-500 hover:bg-blue-400">
                  <Link href={visitUrl} target="_blank" rel="noreferrer">
                    {tr(locale, "Visit", "Visit")}
                    <ExternalLink className="size-4" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageFrame>
  );
}