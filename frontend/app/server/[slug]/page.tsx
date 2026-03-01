import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Handshake,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Unlock,
  Users,
} from "lucide-react";

import { PageFrame, PageShell } from "@/components/page-templates";
import { ServerLogo } from "@/components/server-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getGithubDetails } from "@/lib/github-server-details";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getActiveServers, getServerBySlug } from "@/lib/servers";
import type { AuthType, VerificationLevel } from "@/lib/types";

import {
  ActionButtonsSection,
  AvailableToolsSection,
  CapabilityGroupsSection,
  GithubStatsSection,
  HealthSection,
  RecentActivitySection,
  RiskTrustSection,
  ServerUrlSection,
  SimilarServersSection,
} from "./page-sections";
import { buildServerDetailViewModel } from "./page-view-model";

type ServerDetailPageProps = {
  params: Promise<{ slug: string }>;
};

const authIconConfig: Record<AuthType, typeof Unlock> = {
  none: Unlock,
  api_key: KeyRound,
  oauth: LockKeyhole,
};

const verificationIconConfig: Record<VerificationLevel, typeof ShieldCheck> = {
  community: Users,
  partner: Handshake,
  official: BadgeCheck,
};

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

  const { stats: githubStats, activity: githubActivity } = await getGithubDetails(mcpServer.repoUrl);
  const allServers = await getActiveServers();
  const viewModel = buildServerDetailViewModel({
    mcpServer,
    allServers,
    githubActivity,
  });

  const AuthIcon = authIconConfig[mcpServer.authType];
  const VerificationIcon = verificationIconConfig[mcpServer.verificationLevel];

  return (
    <PageFrame variant="directory">
      <PageShell className="max-w-4xl px-4 sm:px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(viewModel.jsonLd) }}
        />

        <div className="mb-6">
          <Button asChild variant="ghost" className="px-0 text-muted-foreground hover:text-foreground">
            <Link href="/catalog">
              <ArrowLeft className="size-4" />
              {tr(locale, "Back to catalog", "Back to catalog")}
            </Link>
          </Button>
        </div>

        <Card className="border-border bg-card/90">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-4">
                <ServerLogo
                  mcpServer={mcpServer}
                  className="size-16 border-border bg-card shadow-[0_12px_28px_hsl(var(--foreground)/0.25)] sm:size-20"
                  imageClassName="h-full w-full object-contain p-2"
                  symbolClassName="text-3xl sm:text-4xl"
                />

                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground">{mcpServer.name}</h1>
                  <p className="text-sm text-muted-foreground">{mcpServer.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary/15 text-primary">{mcpServer.category}</Badge>
                <Badge variant="outline" className="border-border bg-card/70 text-muted-foreground">
                  <AuthIcon className="mr-1 size-3" />
                  {tr(locale, viewModel.authBadge.label, viewModel.authBadge.label)}
                </Badge>
                <Badge variant="outline" className="border-border text-muted-foreground">
                  <VerificationIcon className="mr-1 size-3" />
                  {tr(locale, viewModel.verificationBadge.label, viewModel.verificationBadge.label)}
                </Badge>
                <Badge variant="outline" className={viewModel.healthBadge.className}>
                  <span
                    className={`mr-1 inline-block size-1.5 rounded-full ${viewModel.healthBadge.dotClassName}`}
                  />
                  {tr(locale, viewModel.healthBadge.label, viewModel.healthBadge.label)}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <ServerUrlSection locale={locale} mcpServer={mcpServer} />
            <AvailableToolsSection locale={locale} mcpServer={mcpServer} />
            <CapabilityGroupsSection
              hasCapabilityGroups={viewModel.hasCapabilityGroups}
              capabilityGroups={viewModel.capabilityGroups}
            />
            <GithubStatsSection locale={locale} githubStats={githubStats} />
            <HealthSection
              locale={locale}
              mcpServer={mcpServer}
              healthLabel={viewModel.healthBadge.label}
              isHealthPending={viewModel.isHealthPending}
            />
            <RiskTrustSection
              mcpServer={mcpServer}
              verificationLabel={viewModel.verificationBadge.label}
              healthLabel={viewModel.healthBadge.label}
              isHealthPending={viewModel.isHealthPending}
              hasLicense={!!githubStats?.license}
            />
            <RecentActivitySection
              locale={locale}
              githubActivity={githubActivity}
              hasRecentGithubActivity={viewModel.hasRecentGithubActivity}
            />
            <SimilarServersSection similarServers={viewModel.similarServers} />
            <ActionButtonsSection
              locale={locale}
              visitUrl={viewModel.visitUrl}
              slug={mcpServer.slug}
              serverUrl={mcpServer.serverUrl}
            />
          </CardContent>
        </Card>
      </PageShell>
    </PageFrame>
  );
}
