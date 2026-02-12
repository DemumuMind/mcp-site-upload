import type { McpServer } from "@/lib/types";
import type { CatalogSort } from "@/lib/catalog/types";
export function getServerScore(mcpServer: McpServer): number {
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
    const toolsScore = Math.min(mcpServer.tools.length / 10, 2.2);
    const tagsScore = Math.min(mcpServer.tags.length / 6, 0.8);
    return verificationScore + healthScore + toolsScore + tagsScore;
}
export function sortCatalogServers(servers: McpServer[], sort: CatalogSort): McpServer[] {
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
        const compared = getServerScore(a) - getServerScore(b);
        if (compared === 0) {
            return a.name.localeCompare(b.name);
        }
        return sort.direction === "asc" ? compared : -compared;
    });
}
