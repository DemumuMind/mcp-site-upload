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
    devtools: "googlechrome",
    discord: "discord",
    exa: "exa",
    filesystem: "files",
    files: "files",
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
    postgres: "postgresql",
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

function createGeneratedLogoDataUrl(seedValue: string): string {
    const seed = hashString(seedValue || "mcp");
    const hueA = seed % 360;
    const hueB = (seed * 7) % 360;
    const hueC = (seed * 13) % 360;
    const rotation = seed % 360;
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="MCP generated logo">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hueA} 78% 55%)"/>
      <stop offset="100%" stop-color="hsl(${hueB} 78% 45%)"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="hsl(${hueC} 90% 70% / .95)"/>
      <stop offset="100%" stop-color="white"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="28" fill="url(#bg)"/>
  <g transform="translate(64 64) rotate(${rotation}) translate(-64 -64)">
    <path d="M22 76 L64 20 L106 76 L64 108 Z" fill="url(#accent)" opacity=".95"/>
    <circle cx="64" cy="64" r="18" fill="hsl(224 32% 12% / .82)"/>
  </g>
</svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
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
    if (candidates.size === 0) {
        candidates.add(createLocalSimpleIconCandidate("modelcontextprotocol"));
    }
    candidates.add(createGeneratedLogoDataUrl(`${mcpServer.slug}|${mcpServer.name}`));
    return [...candidates];
}
