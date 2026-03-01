import { unstable_cache } from "next/cache";
import { inferServerLanguage } from "@/lib/catalog-taxonomy";
import { getCategoryEntries } from "@/lib/catalog/facets";
import { getActiveServers } from "@/lib/servers";
import type { McpServer } from "@/lib/types";
type CatalogSnapshotOptions = {
    featuredLimit?: number;
    bypassCache?: boolean;
};
export type CatalogSnapshot = {
    servers: McpServer[];
    featuredServers: McpServer[];
    sampleServer: McpServer | null;
    totalServers: number;
    totalTools: number;
    totalCategories: number;
    totalGithubLinked: number;
    githubLinkedPercent: number;
    categoryEntries: Array<[
        string,
        number
    ]>;
    languageEntries: Array<[
        string,
        number
    ]>;
};
export const CATALOG_SERVERS_CACHE_TAG = "catalog-servers";
export const CATALOG_SERVERS_REVALIDATE_SECONDS = 300;
function sortFacetEntries(entries: Array<[
    string,
    number
]>): Array<[
    string,
    number
]> {
    return [...entries].sort((a, b) => {
        if (b[1] !== a[1]) {
            return b[1] - a[1];
        }
        return a[0].localeCompare(b[0]);
    });
}
function getLanguageEntries(servers: McpServer[]): Array<[
    string,
    number
]> {
    const languageCountMap = new Map<string, number>();
    for (const mcpServer of servers) {
        const language = inferServerLanguage(mcpServer);
        languageCountMap.set(language, (languageCountMap.get(language) ?? 0) + 1);
    }
    return sortFacetEntries([...languageCountMap.entries()]);
}
const getCachedActiveServers = unstable_cache(async () => getActiveServers(), ["catalog-active-servers"], {
    revalidate: CATALOG_SERVERS_REVALIDATE_SECONDS,
    tags: [CATALOG_SERVERS_CACHE_TAG],
});
function isGithubRepoUrl(repoUrl?: string): boolean {
    if (!repoUrl)
        return false;
    try {
        const parsed = new URL(repoUrl);
        return parsed.hostname === "github.com" || parsed.hostname.endsWith(".github.com");
    }
    catch {
        return repoUrl.toLowerCase().includes("github.com/");
    }
}
export function buildCatalogSnapshot(servers: McpServer[], options: CatalogSnapshotOptions = {}): CatalogSnapshot {
    const featuredLimit = options.featuredLimit ?? 4;
    const featuredServers = servers.slice(0, featuredLimit);
    const categoryEntries = getCategoryEntries(servers);
    const languageEntries = getLanguageEntries(servers);
    const totalGithubLinked = servers.reduce((total, mcpServer) => total + (isGithubRepoUrl(mcpServer.repoUrl) ? 1 : 0), 0);
    const githubLinkedPercent = servers.length > 0 ? Math.round((totalGithubLinked / servers.length) * 100) : 0;
    return {
        servers,
        featuredServers,
        sampleServer: featuredServers[0] ?? null,
        totalServers: servers.length,
        totalTools: servers.reduce((total, mcpServer) => total + mcpServer.tools.length, 0),
        totalCategories: categoryEntries.length,
        totalGithubLinked,
        githubLinkedPercent,
        categoryEntries,
        languageEntries,
    };
}
export async function getCatalogSnapshot(options: CatalogSnapshotOptions = {}): Promise<CatalogSnapshot> {
    const servers = options.bypassCache ? await getActiveServers() : await getCachedActiveServers();
    return buildCatalogSnapshot(servers, options);
}

export async function clearCatalogSnapshotRedisCache(): Promise<void> {
    // Redis snapshot cache is currently not configured in this build.
}
