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

import { PageFrame } from "@/components/page-templates";
import { ServerLogo } from "@/components/server-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <main className="bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(viewModel.jsonLd) }}
        />

        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_24%),radial-gradient(circle_at_84%_16%,hsl(var(--accent)/0.16),transparent_18%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_68%)]" />
          <div className="section-shell py-10 sm:py-14 lg:py-18">
            <Button asChild variant="ghost" className="px-0 text-muted-foreground hover:text-foreground">
              <Link href="/catalog">
                <ArrowLeft className="size-4" />
                {tr(locale, "Back to catalog", "Back to catalog")}
              </Link>
            </Button>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
                  {tr(locale, "DemumuMind Catalog", "DemumuMind Catalog")}
                </p>
                <h1 className="mt-5 font-serif text-[clamp(3rem,9vw,6.4rem)] leading-[0.94] tracking-[-0.06em] text-foreground">
                  {mcpServer.name}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {mcpServer.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Badge className="rounded-none bg-primary/12 text-primary">{mcpServer.category}</Badge>
                  <Badge variant="outline" className="rounded-none border-border/80 bg-transparent text-foreground">
                    <AuthIcon className="mr-1 size-3" />
                    {tr(locale, viewModel.authBadge.label, viewModel.authBadge.label)}
                  </Badge>
                  <Badge variant="outline" className="rounded-none border-border/80 bg-transparent text-foreground">
                    <VerificationIcon className="mr-1 size-3" />
                    {tr(locale, viewModel.verificationBadge.label, viewModel.verificationBadge.label)}
                  </Badge>
                  <Badge variant="outline" className={`rounded-none ${viewModel.healthBadge.className}`}>
                    <span className={`mr-1 inline-block size-1.5 rounded-full ${viewModel.healthBadge.dotClassName}`} />
                    {tr(locale, viewModel.healthBadge.label, viewModel.healthBadge.label)}
                  </Badge>
                </div>
              </div>

              <div className="border border-border/60 bg-background/72 p-6 backdrop-blur-sm sm:p-7">
                <div className="flex items-start gap-4">
                  <ServerLogo
                    mcpServer={mcpServer}
                    className="size-16 border border-border bg-card shadow-[0_12px_28px_hsl(var(--foreground)/0.16)] sm:size-20"
                    imageClassName="h-full w-full object-contain p-2"
                    symbolClassName="text-3xl sm:text-4xl"
                  />
                  <div>
                    <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">
                      {tr(locale, "Server snapshot", "Server snapshot")}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {tr(locale, "Use this page to validate trust, inspect capabilities, and copy connection details before introducing the server into your workflow.", "Use this page to validate trust, inspect capabilities, and copy connection details before introducing the server into your workflow.")}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <ActionButtonsSection
                    locale={locale}
                    visitUrl={viewModel.visitUrl}
                    slug={mcpServer.slug}
                    serverUrl={mcpServer.serverUrl}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="section-shell py-10 sm:py-14">
            <div className="space-y-6 border border-border/60 bg-background/70 p-6 sm:p-8">
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
            </div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
