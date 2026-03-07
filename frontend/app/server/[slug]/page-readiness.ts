import type { McpServer } from "@/lib/types";

export type ReadinessStatus = "ready" | "review" | "blocked";

export type ServerReadinessChecklistItem = {
  key: "trust" | "health" | "auth" | "tools" | "docs";
  label: string;
  status: ReadinessStatus;
  detail: string;
};

export type ServerReadinessViewModel = {
  score: number;
  status: ReadinessStatus;
  statusLabel: string;
  recommendedAction: string;
  checklistItems: ServerReadinessChecklistItem[];
};

export function buildServerReadinessViewModel({
  mcpServer,
  hasLicense,
}: {
  mcpServer: McpServer;
  hasLicense: boolean;
}): ServerReadinessViewModel {
  const checklistItems: ServerReadinessChecklistItem[] = [
    buildTrustChecklistItem(mcpServer),
    buildHealthChecklistItem(mcpServer),
    buildAuthChecklistItem(mcpServer),
    buildToolsChecklistItem(mcpServer),
    buildDocsChecklistItem(mcpServer, hasLicense),
  ];

  const score = clampScore(
    checklistItems.reduce((total, item) => total + statusScore(item.status), 0),
  );
  const status = getOverallStatus(checklistItems);

  return {
    score,
    status,
    statusLabel: getStatusLabel(status),
    recommendedAction: getRecommendedAction(status),
    checklistItems,
  };
}

function buildTrustChecklistItem(mcpServer: McpServer): ServerReadinessChecklistItem {
  if (mcpServer.verificationLevel === "official" || mcpServer.verificationLevel === "partner") {
    return {
      key: "trust",
      label: "Trust context",
      status: "ready",
      detail: `Verification level: ${capitalize(mcpServer.verificationLevel)}`,
    };
  }

  return {
    key: "trust",
    label: "Trust context",
    status: "review",
    detail: "Community verification requires an owner review",
  };
}

function buildHealthChecklistItem(mcpServer: McpServer): ServerReadinessChecklistItem {
  const healthStatus = mcpServer.healthStatus ?? "unknown";
  if (healthStatus === "healthy") {
    return {
      key: "health",
      label: "Health signal",
      status: "ready",
      detail: "Latest probe reported healthy status",
    };
  }
  if (healthStatus === "down") {
    return {
      key: "health",
      label: "Health signal",
      status: "blocked",
      detail: "Current health status is down",
    };
  }

  return {
    key: "health",
    label: "Health signal",
    status: "review",
    detail: "Health needs a fresh successful probe before rollout",
  };
}

function buildAuthChecklistItem(mcpServer: McpServer): ServerReadinessChecklistItem {
  if (mcpServer.authType === "none") {
    return {
      key: "auth",
      label: "Auth setup",
      status: "ready",
      detail: "No additional auth handoff required",
    };
  }
  if (mcpServer.authType === "oauth") {
    return {
      key: "auth",
      label: "Auth setup",
      status: "review",
      detail: "OAuth callback and account ownership need validation",
    };
  }

  return {
    key: "auth",
    label: "Auth setup",
    status: "review",
    detail: "API key provisioning is required before rollout",
  };
}

function buildToolsChecklistItem(mcpServer: McpServer): ServerReadinessChecklistItem {
  if (mcpServer.tools.length > 0) {
    return {
      key: "tools",
      label: "Tool coverage",
      status: "ready",
      detail: `${mcpServer.tools.length} published tools available for review`,
    };
  }

  return {
    key: "tools",
    label: "Tool coverage",
    status: "review",
    detail: "No published tool list available yet",
  };
}

function buildDocsChecklistItem(
  mcpServer: McpServer,
  hasLicense: boolean,
): ServerReadinessChecklistItem {
  if (mcpServer.repoUrl && hasLicense) {
    return {
      key: "docs",
      label: "Source and docs",
      status: "ready",
      detail: "Repository link and license metadata are available",
    };
  }

  return {
    key: "docs",
    label: "Source and docs",
    status: "review",
    detail: "Repository or license context is incomplete",
  };
}

function getOverallStatus(items: ServerReadinessChecklistItem[]): ReadinessStatus {
  if (items.some((item) => item.status === "blocked")) {
    return "blocked";
  }
  if (items.some((item) => item.status === "review")) {
    return "review";
  }
  return "ready";
}

function getStatusLabel(status: ReadinessStatus): string {
  switch (status) {
    case "ready":
      return "Ready for rollout";
    case "review":
      return "Review before rollout";
    case "blocked":
      return "Blocked for rollout";
  }
}

function getRecommendedAction(status: ReadinessStatus): string {
  switch (status) {
    case "ready":
      return "Ship to a pilot workflow";
    case "review":
      return "Validate setup with an owner first";
    case "blocked":
      return "Resolve trust or health blockers";
  }
}

function statusScore(status: ReadinessStatus): number {
  switch (status) {
    case "ready":
      return 20;
    case "review":
      return 12;
    case "blocked":
      return 4;
  }
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
