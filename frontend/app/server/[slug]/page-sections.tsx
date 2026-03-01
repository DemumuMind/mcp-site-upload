import Link from "next/link";

import { ConnectionTestButton } from "@/components/server/connection-test-button";
import { CopyConfigButton } from "@/components/server/copy-config-button";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

import type { GithubActivity, GithubRepoStats } from "@/lib/github-server-details";
import { tr, type Locale } from "@/lib/i18n";
import type { McpServer } from "@/lib/types";

import { formatCheckedAt, type CapabilityGroups } from "./page-view-model";
import { ExternalTextLink, OutlineBadge, SectionCard, SectionLabel } from "./section-primitives";

type CommonSectionProps = {
  locale: Locale;
  mcpServer: McpServer;
};

type HealthSectionProps = CommonSectionProps & {
  healthLabel: string;
  isHealthPending: boolean;
};

export function ServerUrlSection({ locale, mcpServer }: CommonSectionProps) {
  return (
    <SectionCard>
      <SectionLabel className="mb-2">{tr(locale, "Server URL", "Server URL")}</SectionLabel>
      <p className="break-all text-sm text-foreground">{mcpServer.serverUrl}</p>
    </SectionCard>
  );
}

export function AvailableToolsSection({ locale, mcpServer }: CommonSectionProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium text-foreground">{tr(locale, "Available tools", "Available tools")}</h2>
      {mcpServer.tools.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {mcpServer.tools.map((toolName) => (
            <OutlineBadge key={toolName}>{toolName}</OutlineBadge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{tr(locale, "No tool list published yet.", "No tool list published yet.")}</p>
      )}
    </div>
  );
}

export function CapabilityGroupsSection({
  hasCapabilityGroups,
  capabilityGroups,
}: {
  hasCapabilityGroups: boolean;
  capabilityGroups: CapabilityGroups;
}) {
  if (!hasCapabilityGroups) {
    return null;
  }

  return (
    <SectionCard>
      <SectionLabel>Tool capabilities</SectionLabel>
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(capabilityGroups).map(([key, tools]) =>
          tools.length > 0 ? (
            <div key={key} className="rounded-lg border border-border bg-card/50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{key}</p>
              <div className="flex flex-wrap gap-1.5">
                {tools.slice(0, 6).map((toolName) => (
                  <OutlineBadge key={`${key}-${toolName}`}>{toolName}</OutlineBadge>
                ))}
              </div>
            </div>
          ) : null,
        )}
      </div>
    </SectionCard>
  );
}

export function GithubStatsSection({
  locale,
  githubStats,
}: {
  locale: Locale;
  githubStats: GithubRepoStats | null;
}) {
  if (!githubStats) {
    return null;
  }

  const githubStatBadges = [
    `Stars: ${githubStats.stars}`,
    `Forks: ${githubStats.forks}`,
    `Watchers: ${githubStats.watchers}`,
    `Issues: ${githubStats.openIssues}`,
    githubStats.license ?? "No license",
  ];

  return (
    <SectionCard>
      <SectionLabel>GitHub stats</SectionLabel>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {githubStatBadges.map((statBadge) => (
          <OutlineBadge key={statBadge} className="justify-center px-3 py-2 text-foreground">
            {statBadge}
          </OutlineBadge>
        ))}
      </div>
      {githubStats.pushedAt ? (
        <p className="mt-3 text-xs text-muted-foreground">Last push: {formatCheckedAt(githubStats.pushedAt, locale)}</p>
      ) : null}
    </SectionCard>
  );
}

export function HealthSection({
  locale,
  mcpServer,
  healthLabel,
  isHealthPending,
}: HealthSectionProps) {
  return (
    <SectionCard>
      <SectionLabel className="mb-2">{tr(locale, "Health check", "Health check")}</SectionLabel>
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span>
          {tr(locale, "Status", "Status")}: {isHealthPending
            ? tr(locale, "Pending first health scan", "Pending first health scan")
            : tr(locale, healthLabel, healthLabel)}
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
      <div className="mt-3">
        <ConnectionTestButton slug={mcpServer.slug} />
      </div>
    </SectionCard>
  );
}

export function RiskTrustSection({
  mcpServer,
  verificationLabel,
  healthLabel,
  isHealthPending,
  hasLicense,
}: {
  mcpServer: McpServer;
  verificationLabel: string;
  healthLabel: string;
  isHealthPending: boolean;
  hasLicense: boolean;
}) {
  return (
    <SectionCard>
      <SectionLabel className="mb-2">Risk & trust</SectionLabel>
      <ul className="space-y-1 text-sm text-muted-foreground">
        <li>Verification: {verificationLabel}</li>
        <li>Health: {isHealthPending ? "Pending first health scan" : healthLabel}</li>
        <li>Repository linked: {mcpServer.repoUrl ? "Yes" : "No"}</li>
        <li>License detected: {hasLicense ? "Yes" : "No"}</li>
        <li>Maintainer: {mcpServer.maintainer?.name ?? "Unknown"}</li>
      </ul>
    </SectionCard>
  );
}

export function RecentActivitySection({
  locale,
  githubActivity,
  hasRecentGithubActivity,
}: {
  locale: Locale;
  githubActivity: GithubActivity | null;
  hasRecentGithubActivity: boolean;
}) {
  if (!hasRecentGithubActivity || !githubActivity) {
    return null;
  }

  const formatActivityDate = (date: string | null) => (date ? ` - ${formatCheckedAt(date, locale)}` : "");

  return (
    <SectionCard>
      <SectionLabel>Recent activity</SectionLabel>
      {githubActivity.releases.length > 0 ? (
        <div className="mb-3">
          <p className="mb-1 text-sm font-medium text-foreground">Releases</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            {githubActivity.releases.slice(0, 3).map((release) => (
              <p key={release.url}>
                <ExternalTextLink href={release.url}>{release.name}</ExternalTextLink>
                {formatActivityDate(release.publishedAt)}
              </p>
            ))}
          </div>
        </div>
      ) : null}
      {githubActivity.commits.length > 0 ? (
        <div>
          <p className="mb-1 text-sm font-medium text-foreground">Commits</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            {githubActivity.commits.slice(0, 3).map((commit) => (
              <p key={commit.sha}>
                <ExternalTextLink href={commit.url}>{commit.message || commit.sha.slice(0, 7)}</ExternalTextLink>
                {formatActivityDate(commit.date)}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}

export function SimilarServersSection({
  similarServers,
}: {
  similarServers: Array<{ server: McpServer; score: number }>;
}) {
  if (similarServers.length === 0) {
    return null;
  }

  return (
    <SectionCard>
      <SectionLabel>Similar servers</SectionLabel>
      <div className="grid gap-2 sm:grid-cols-2">
        {similarServers.map(({ server }) => (
          <Link
            key={server.id}
            href={`/server/${server.slug}`}
            className="rounded-lg border border-border bg-card/50 px-3 py-2 text-sm text-foreground transition hover:border-primary/40"
          >
            {server.name}
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}

export function ActionButtonsSection({
  locale,
  visitUrl,
  slug,
  serverUrl,
}: {
  locale: Locale;
  visitUrl: string;
  slug: string;
  serverUrl: string;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {visitUrl ? (
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href={visitUrl} target="_blank" rel="noreferrer">
            {tr(locale, "Visit", "Visit")}
            <ExternalLink className="size-4" />
          </Link>
        </Button>
      ) : null}
      <CopyConfigButton name={slug} serverUrl={serverUrl} />
    </div>
  );
}
