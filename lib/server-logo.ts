import type { McpServer } from "@/lib/types";
export type LogoStyle = {
    symbol: string;
    symbolClassName: string;
    wordmark?: string;
    wordmarkClassName?: string;
};
export type LogoFallbackTheme = {
    containerClassName: string;
    symbolClassName: string;
};
const logoStyleBySlug: Record<string, LogoStyle> = {
    linear: {
        symbol: "L",
        symbolClassName: "text-white",
        wordmark: "Linear",
        wordmarkClassName: "text-slate-900",
    },
    github: {
        symbol: "GH",
        symbolClassName: "text-white",
        wordmark: "GitHub",
        wordmarkClassName: "text-slate-900",
    },
    figma: {
        symbol: "F",
        symbolClassName: "text-white",
        wordmark: "Figma",
        wordmarkClassName: "text-slate-900",
    },
    sentry: {
        symbol: "S",
        symbolClassName: "text-white",
        wordmark: "Sentry",
        wordmarkClassName: "text-slate-900",
    },
    slack: {
        symbol: "SL",
        symbolClassName: "text-white",
        wordmark: "Slack",
        wordmarkClassName: "text-slate-900",
    },
    postgres: {
        symbol: "PG",
        symbolClassName: "text-white",
        wordmark: "Postgres",
        wordmarkClassName: "text-slate-900",
    },
};
const fallbackThemes: readonly LogoFallbackTheme[] = [
    {
        containerClassName: "from-sky-500 via-cyan-500 to-indigo-600",
        symbolClassName: "text-white",
    },
    {
        containerClassName: "from-violet-500 via-fuchsia-500 to-pink-600",
        symbolClassName: "text-white",
    },
    {
        containerClassName: "from-emerald-500 via-teal-500 to-cyan-600",
        symbolClassName: "text-white",
    },
    {
        containerClassName: "from-amber-500 via-orange-500 to-rose-600",
        symbolClassName: "text-white",
    },
    {
        containerClassName: "from-blue-600 via-indigo-600 to-violet-700",
        symbolClassName: "text-white",
    },
    {
        containerClassName: "from-slate-600 via-slate-700 to-slate-900",
        symbolClassName: "text-slate-100",
    },
];
type LogoSourceServer = Pick<McpServer, "slug" | "name" | "repoUrl" | "serverUrl">;
const localServerLogoBasePath = "/server-logos/simpleicons";
const simpleIconSlugByAlias: Record<string, string> = {
    a2a: "googlegemini",
    a2abench: "googlegemini",
    airtable: "airtable",
    apify: "apify",
    asana: "asana",
    brave: "brave",
    chrome: "googlechrome",
    discord: "discord",
    exa: "exa",
    filesystem: "files",
    figma: "figma",
    github: "github",
    gitlab: "gitlab",
    google: "google",
    hubspot: "hubspot",
    jira: "jira",
    linear: "linear",
    modelcontextprotocol: "modelcontextprotocol",
    notion: "notion",
    openai: "openai",
    playwright: "playwright",
    postgresql: "postgresql",
    sentry: "sentry",
    shopify: "shopify",
    slack: "slack",
    stripe: "stripe",
    trello: "trello",
};
function createLocalSimpleIconCandidate(simpleIconSlug: string): string {
    return `${localServerLogoBasePath}/${encodeURIComponent(simpleIconSlug)}.svg`;
}
function getInitials(name: string): string {
    const words = name
        .split(/\s+/)
        .map((word) => word.trim())
        .filter(Boolean);
    if (words.length === 0) {
        return "MCP";
    }
    if (words.length === 1) {
        return words[0].slice(0, 3).toUpperCase();
    }
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
}
export function resolveLogoStyle(mcpServer: Pick<McpServer, "slug" | "name">): LogoStyle {
    const predefined = logoStyleBySlug[mcpServer.slug];
    if (predefined) {
        return predefined;
    }
    return {
        symbol: getInitials(mcpServer.name),
        symbolClassName: "text-white",
    };
}
function hashString(value: string): number {
    let hash = 5381;
    for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 33) ^ value.charCodeAt(index);
    }
    return hash >>> 0;
}
export function resolveLogoFallbackTheme(mcpServer: Pick<McpServer, "slug" | "name">): LogoFallbackTheme {
    const key = (mcpServer.slug || mcpServer.name).toLowerCase();
    const hash = hashString(key);
    const index = hash % fallbackThemes.length;
    return fallbackThemes[index];
}
function toHostname(urlValue?: string): string | null {
    if (!urlValue) {
        return null;
    }
    try {
        const parsed = new URL(urlValue);
        if (!parsed.hostname) {
            return null;
        }
        return parsed.hostname.toLowerCase();
    }
    catch {
        return null;
    }
}
function getDomainLogoCandidates(hostname: string): string[] {
    const candidates = new Set<string>();
    const normalizedHost = hostname.toLowerCase();
    const hostAliases = normalizedHost.split(".");
    for (const alias of hostAliases) {
        const simpleIconSlug = simpleIconSlugByAlias[alias];
        if (simpleIconSlug) {
            candidates.add(createLocalSimpleIconCandidate(simpleIconSlug));
        }
    }
    if (normalizedHost.includes("chrome")) {
        candidates.add(createLocalSimpleIconCandidate("googlechrome"));
    }
    return [...candidates];
}
function getNameBasedLogoCandidates(mcpServer: LogoSourceServer): string[] {
    const candidates = new Set<string>();
    const slug = mcpServer.slug.toLowerCase();
    const normalizedName = mcpServer.name.toLowerCase();
    for (const [alias, simpleIconSlug] of Object.entries(simpleIconSlugByAlias)) {
        if (slug.includes(alias) || normalizedName.includes(alias)) {
            candidates.add(createLocalSimpleIconCandidate(simpleIconSlug));
        }
    }
    if (normalizedName.includes("devtools")) {
        candidates.add(createLocalSimpleIconCandidate("googlechrome"));
    }
    if (normalizedName.includes("filesystem")) {
        candidates.add(createLocalSimpleIconCandidate("files"));
    }
    return [...candidates];
}
export function getServerLogoCandidates(mcpServer: LogoSourceServer): string[] {
    const candidates = new Set<string>();
    for (const candidate of getNameBasedLogoCandidates(mcpServer)) {
        candidates.add(candidate);
    }
    const hosts = [toHostname(mcpServer.repoUrl), toHostname(mcpServer.serverUrl)].filter((value): value is string => Boolean(value));
    for (const host of hosts) {
        for (const candidate of getDomainLogoCandidates(host)) {
            candidates.add(candidate);
        }
    }
    return [...candidates];
}
