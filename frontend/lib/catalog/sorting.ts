import type { McpServer } from "@/lib/types";
import type { CatalogSort } from "@/lib/catalog/types";
function normalizeQueryTokens(query?: string): string[] {
    if (!query) {
        return [];
    }
    return query
        .toLowerCase()
        .split(/\s+/)
        .map((token) => token.trim())
        .filter((token) => token.length > 0);
}
function getIntentScore(mcpServer: McpServer, query?: string): number {
    const tokens = normalizeQueryTokens(query);
    if (tokens.length === 0) {
        return 0;
    }
    const haystacks = [
        { value: mcpServer.name.toLowerCase(), weight: 3 },
        { value: mcpServer.description.toLowerCase(), weight: 1.6 },
        { value: mcpServer.category.toLowerCase(), weight: 1.2 },
        { value: (mcpServer.maintainer?.name ?? "").toLowerCase(), weight: 1.1 },
    ];
    let score = 0;
    for (const token of tokens) {
        if (mcpServer.tags.some((tag) => tag.toLowerCase().includes(token))) {
            score += 1.4;
        }
        if (mcpServer.tools.some((tool) => tool.toLowerCase().includes(token))) {
            score += 1.2;
        }
        for (const haystack of haystacks) {
            if (haystack.value.includes(token)) {
                score += haystack.weight;
            }
        }
    }
    return score;
}
function getTrustScore(mcpServer: McpServer): number {
    const verificationScore = {
        official: 3.5,
        partner: 2.4,
        community: 1.6,
    }[mcpServer.verificationLevel];
    const healthScore = {
        healthy: 1.2,
        unknown: 0.6,
        degraded: 0.25,
        down: 0,
    }[mcpServer.healthStatus ?? "unknown"];
    const repositoryScore = mcpServer.repoUrl ? 0.8 : 0;
    return verificationScore + healthScore + repositoryScore;
}
function getQualityScore(mcpServer: McpServer): number {
    const toolsScore = Math.min(mcpServer.tools.length / 11, 2.2);
    const tagsScore = Math.min(mcpServer.tags.length / 7, 0.8);
    return toolsScore + tagsScore;
}
export function getServerScore(mcpServer: McpServer, query?: string): number {
    const intentScore = getIntentScore(mcpServer, query);
    const trustScore = getTrustScore(mcpServer);
    const qualityScore = getQualityScore(mcpServer);
    return intentScore * 1.6 + trustScore * 1.2 + qualityScore;
}
export function getServerTrustScore(mcpServer: McpServer): number {
    return Number(getTrustScore(mcpServer).toFixed(2));
}
export function sortCatalogServers(servers: McpServer[], sort: CatalogSort, query?: string): McpServer[] {
    return [...servers].sort((a, b) => {
        if (sort.field === "name") {
            const compared = a.name.localeCompare(b.name);
            return sort.direction === "asc" ? compared : -compared;
        }
        if (sort.field === "tools") {
            const compared = a.tools.length - b.tools.length;
            if (compared === 0) {
                return a.name.localeCompare(b.name);
            }
            return sort.direction === "asc" ? compared : -compared;
        }
        if (sort.field === "updated") {
            const leftTimestamp = Date.parse(a.createdAt ?? "");
            const rightTimestamp = Date.parse(b.createdAt ?? "");
            const normalizedLeft = Number.isFinite(leftTimestamp) ? leftTimestamp : 0;
            const normalizedRight = Number.isFinite(rightTimestamp) ? rightTimestamp : 0;
            const compared = normalizedLeft - normalizedRight;
            if (compared === 0) {
                return a.name.localeCompare(b.name);
            }
            return sort.direction === "asc" ? compared : -compared;
        }
        const compared = getServerScore(a, query) - getServerScore(b, query);
        if (compared === 0) {
            return a.name.localeCompare(b.name);
        }
        return sort.direction === "asc" ? compared : -compared;
    });
}
