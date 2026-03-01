import type { GithubActivity } from "@/lib/github-server-details";
import { tr, type Locale } from "@/lib/i18n";
import type { AuthType, HealthStatus, McpServer, VerificationLevel } from "@/lib/types";

export const healthBadgeConfig: Record<
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
    className: "border-border bg-muted text-muted-foreground",
    dotClassName: "bg-muted-foreground",
  },
};

export const authBadgeConfig: Record<
  AuthType,
  {
    label: string;
  }
> = {
  none: { label: "Open" },
  api_key: { label: "API Key" },
  oauth: { label: "OAuth" },
};

export const verificationBadgeConfig: Record<
  VerificationLevel,
  {
    label: string;
  }
> = {
  community: { label: "Community" },
  partner: { label: "Partner" },
  official: { label: "Official" },
};

export type CapabilityGroups = {
  read: string[];
  write: string[];
  admin: string[];
  automation: string[];
};

export function formatCheckedAt(value: string | undefined | null, locale: Locale): string {
  if (!value) {
    return tr(locale, "Pending first health scan", "Pending first health scan");
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return tr(locale, "Pending first health scan", "Pending first health scan");
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildCapabilityGroups(tools: string[]): CapabilityGroups {
  return {
    read: tools.filter((tool) => /^(read|get|list|search|fetch)/i.test(tool)),
    write: tools.filter((tool) => /^(create|write|update|edit|set|post|put)/i.test(tool)),
    admin: tools.filter((tool) => /(delete|remove|admin|manage|permission|workflow)/i.test(tool)),
    automation: tools.filter((tool) => /(sync|batch|auto|job|trigger|queue)/i.test(tool)),
  };
}

function getSimilarServers(mcpServer: McpServer, allServers: McpServer[]) {
  return allServers
    .filter((item) => item.slug !== mcpServer.slug)
    .map((item) => {
      const sharedTags = item.tags.filter((tag) => mcpServer.tags.includes(tag)).length;
      const categoryBoost = item.category === mcpServer.category ? 2 : 0;
      const toolOverlap = item.tools.filter((tool) => mcpServer.tools.includes(tool)).length;
      return { server: item, score: sharedTags + categoryBoost + toolOverlap };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

export function buildServerDetailViewModel({
  mcpServer,
  allServers,
  githubActivity,
}: {
  mcpServer: McpServer;
  allServers: McpServer[];
  githubActivity: GithubActivity | null;
}) {
  const healthStatus = mcpServer.healthStatus ?? "unknown";
  const healthBadge = healthBadgeConfig[healthStatus];
  const isHealthPending = healthStatus === "unknown" && !mcpServer.healthCheckedAt;
  const authBadge = authBadgeConfig[mcpServer.authType];
  const verificationBadge = verificationBadgeConfig[mcpServer.verificationLevel];
  const visitUrl = mcpServer.repoUrl || mcpServer.serverUrl;
  const similarServers = getSimilarServers(mcpServer, allServers);
  const capabilityGroups = buildCapabilityGroups(mcpServer.tools);
  const hasCapabilityGroups = Object.values(capabilityGroups).some((group) => group.length > 0);
  const hasRecentGithubActivity =
    !!githubActivity && (githubActivity.commits.length > 0 || githubActivity.releases.length > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${mcpServer.name} MCP Server`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description: mcpServer.description,
    url: mcpServer.repoUrl || mcpServer.serverUrl,
  };

  return {
    healthBadge,
    isHealthPending,
    authBadge,
    verificationBadge,
    visitUrl,
    similarServers,
    capabilityGroups,
    hasCapabilityGroups,
    hasRecentGithubActivity,
    jsonLd,
  };
}
