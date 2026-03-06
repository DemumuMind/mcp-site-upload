import type { Locale } from "@/lib/i18n";
import type { GithubActivity } from "@/lib/github-server-details";
import type { McpServer } from "@/lib/types";
import { formatCheckedAt } from "./page-view-model";
import { ExternalTextLink, SectionCard, SectionLabel } from "./section-primitives";

export function RiskTrustList({ mcpServer, verificationLabel, healthLabel, isHealthPending, hasLicense }: { mcpServer: McpServer; verificationLabel: string; healthLabel: string; isHealthPending: boolean; hasLicense: boolean; }) {
  return (
    <SectionCard>
      <SectionLabel className="mb-2">Risk & trust</SectionLabel>
      <ul className="editorial-list border border-border/60 text-sm text-muted-foreground">
        <li className="px-4 py-3">Verification: {verificationLabel}</li>
        <li className="px-4 py-3">Health: {isHealthPending ? "Pending first health scan" : healthLabel}</li>
        <li className="px-4 py-3">Repository linked: {mcpServer.repoUrl ? "Yes" : "No"}</li>
        <li className="px-4 py-3">License detected: {hasLicense ? "Yes" : "No"}</li>
        <li className="px-4 py-3">Maintainer: {mcpServer.maintainer?.name ?? "Unknown"}</li>
      </ul>
    </SectionCard>
  );
}

export function RecentActivityCard({ locale, githubActivity, hasRecentGithubActivity }: { locale: Locale; githubActivity: GithubActivity | null; hasRecentGithubActivity: boolean; }) {
  if (!hasRecentGithubActivity || !githubActivity) return null;
  const releaseItems = githubActivity.releases.slice(0, 3).map(release => ({ id: release.url, release }));
  const commitItems = githubActivity.commits.slice(0, 3).map(commit => ({ id: commit.sha, commit }));

  return (
    <SectionCard>
      <SectionLabel>Recent activity</SectionLabel>
      {releaseItems.length > 0 ? <div className="mb-4"><p className="mb-2 text-sm font-medium text-foreground">Releases</p><div className="editorial-list border border-border/60 text-sm text-muted-foreground">{releaseItems.map(({ id, release }) => <p key={id} className="px-4 py-3"><ExternalTextLink href={release.url}>{release.name}</ExternalTextLink>{release.publishedAt ? ` - ${formatCheckedAt(release.publishedAt, locale)}` : ""}</p>)}</div></div> : null}
      {commitItems.length > 0 ? <div><p className="mb-2 text-sm font-medium text-foreground">Commits</p><div className="editorial-list border border-border/60 text-sm text-muted-foreground">{commitItems.map(({ id, commit }) => <p key={id} className="px-4 py-3"><ExternalTextLink href={commit.url}>{commit.message || commit.sha.slice(0, 7)}</ExternalTextLink>{commit.date ? ` - ${formatCheckedAt(commit.date, locale)}` : ""}</p>)}</div></div> : null}
    </SectionCard>
  );
}
