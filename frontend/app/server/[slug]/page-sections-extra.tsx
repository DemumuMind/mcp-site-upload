import type { Locale } from "@/lib/i18n";
import type { GithubActivity } from "@/lib/github-server-details";
import type { McpServer } from "@/lib/types";
import { formatCheckedAt } from "./page-view-model";
import { ExternalTextLink, SectionCard, SectionLabel } from "./section-primitives";

export function RiskTrustList({
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

export function RecentActivityCard({
  locale,
  githubActivity,
  hasRecentGithubActivity,
}: {
  locale: Locale;
  githubActivity: GithubActivity | null;
  hasRecentGithubActivity: boolean;
}) {
  if (!hasRecentGithubActivity || !githubActivity) return null;
  const releaseItems = githubActivity.releases.slice(0, 3).map(release => ({ id: release.url, release }));
  const commitItems = githubActivity.commits.slice(0, 3).map(commit => ({ id: commit.sha, commit }));

  return (
    <SectionCard>
      <SectionLabel>Recent activity</SectionLabel>
      {releaseItems.length > 0 ? (
        <div className="mb-3">
          <p className="mb-1 text-sm font-medium text-foreground">Releases</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            {releaseItems.map(({ id, release }) => (
              <p key={id}>
                <ExternalTextLink href={release.url}>{release.name}</ExternalTextLink>
                {release.publishedAt ? ` - ${formatCheckedAt(release.publishedAt, locale)}` : ""}
              </p>
            ))}
          </div>
        </div>
      ) : null}
      {commitItems.length > 0 ? (
        <div>
          <p className="mb-1 text-sm font-medium text-foreground">Commits</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            {commitItems.map(({ id, commit }) => (
              <p key={id}>
                <ExternalTextLink href={commit.url}>{commit.message || commit.sha.slice(0, 7)}</ExternalTextLink>
                {commit.date ? ` - ${formatCheckedAt(commit.date, locale)}` : ""}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}
