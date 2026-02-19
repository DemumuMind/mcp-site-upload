type GithubRepoRef = {
  owner: string;
  repo: string;
};

export type GithubRepoStats = {
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  pushedAt: string | null;
  license: string | null;
};

export type GithubActivity = {
  commits: Array<{ sha: string; message: string; date: string | null; url: string }>;
  releases: Array<{ name: string; tag: string; publishedAt: string | null; url: string }>;
};

export type GithubReadme = {
  content: string;
  tools: string[];
};

type GithubCommitApiItem = {
  sha?: string;
  html_url?: string;
  commit?: { message?: string; author?: { date?: string } };
};

type GithubReleaseApiItem = {
  name?: string;
  tag_name?: string;
  published_at?: string;
  html_url?: string;
};

function parseRepoRef(repoUrl?: string): GithubRepoRef | null {
  if (!repoUrl) return null;
  try {
    const parsed = new URL(repoUrl);
    if (!(parsed.hostname === "github.com" || parsed.hostname.endsWith(".github.com"))) return null;
    const [owner, repo] = parsed.pathname.split("/").filter(Boolean);
    if (!owner || !repo) return null;
    return { owner, repo: repo.replace(/\.git$/i, "") };
  } catch {
    return null;
  }
}

function getHeaders(): HeadersInit {
  const token = process.env.GH_API_TOKEN?.trim() || process.env.GITHUB_TOKEN?.trim();
  return token
    ? {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      }
    : { Accept: "application/vnd.github+json" };
}

export async function getGithubDetails(repoUrl?: string): Promise<{
  stats: GithubRepoStats | null;
  activity: GithubActivity | null;
}> {
  const ref = parseRepoRef(repoUrl);
  if (!ref) return { stats: null, activity: null };

  const headers = getHeaders();
  const repoEndpoint = `https://api.github.com/repos/${ref.owner}/${ref.repo}`;
  const [repoRes, commitsRes, releasesRes] = await Promise.all([
    fetch(repoEndpoint, { headers, next: { revalidate: 1800 } }),
    fetch(`${repoEndpoint}/commits?per_page=5`, { headers, next: { revalidate: 1800 } }),
    fetch(`${repoEndpoint}/releases?per_page=5`, { headers, next: { revalidate: 1800 } }),
  ]);

  const stats = repoRes.ok
    ? await repoRes.json().then((json) => ({
        stars: json.stargazers_count ?? 0,
        forks: json.forks_count ?? 0,
        watchers: json.subscribers_count ?? 0,
        openIssues: json.open_issues_count ?? 0,
        pushedAt: json.pushed_at ?? null,
        license: json.license?.spdx_id ?? null,
      }))
    : null;

  const commits = commitsRes.ok
    ? await commitsRes.json().then((items: GithubCommitApiItem[]) =>
        (items ?? []).slice(0, 5).map((item) => ({
          sha: item.sha ?? "",
          message: String(item.commit?.message ?? "").split("\n")[0] ?? "",
          date: item.commit?.author?.date ?? null,
          url: item.html_url ?? "",
        })),
      )
    : [];

  const releases = releasesRes.ok
    ? await releasesRes.json().then((items: GithubReleaseApiItem[]) =>
        (items ?? []).slice(0, 5).map((item) => ({
          name: item.name || item.tag_name || "Release",
          tag: item.tag_name || "",
          publishedAt: item.published_at ?? null,
          url: item.html_url ?? "",
        })),
      )
    : [];

  return {
    stats,
    activity: { commits, releases },
  };
}

export async function getGithubReadme(repoUrl?: string): Promise<GithubReadme | null> {
  const ref = parseRepoRef(repoUrl);
  if (!ref) return null;

  const headers = getHeaders();
  const readmeEndpoint = `https://api.github.com/repos/${ref.owner}/${ref.repo}/readme`;

  try {
    const res = await fetch(readmeEndpoint, { headers, next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const json = await res.json();
    if (!json.content) return null;

    // GitHub returns base64 encoded content
    const content = Buffer.from(json.content, "base64").toString("utf-8");
    const tools = extractToolsFromMarkdown(content);

    return { content, tools };
  } catch (error) {
    console.error("Failed to fetch README:", error);
    return null;
  }
}

function extractToolsFromMarkdown(content: string): string[] {
  const tools = new Set<string>();

  // Look for sections like ## Tools, ## Capabilities, ## Functions
  const sectionRegex = /##?\s*(Tools|Capabilities|Functions|Features|Available Tools)[\s\S]*?(?=##|$)/gi;
  const sections = content.match(sectionRegex);

  if (sections) {
    for (const section of sections) {
      // Match list items like "* tool-name: description" or "- tool-name"
      const itemRegex = /^\s*[*\-]\s*[`* ]*([a-zA-Z0-9_\-]+)[`* ]*[:\-]?\s*/gm;
      let match;
      while ((match = itemRegex.exec(section)) !== null) {
        if (match[1] && match[1].length > 2) {
          tools.add(match[1]);
        }
      }
    }
  }

  // Fallback: search for common tool naming patterns in the whole document if nothing found
  if (tools.size === 0) {
    const genericRegex = /`([a-z0-9_]{3,30})`\s+tool/gi;
    let match;
    while ((match = genericRegex.exec(content)) !== null) {
      tools.add(match[1]);
    }
  }

  return Array.from(tools).slice(0, 20);
}
