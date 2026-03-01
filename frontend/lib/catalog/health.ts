import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { HealthStatus } from "@/lib/types";

export async function checkServerHealth(slug: string, repoUrl?: string, serverUrl?: string) {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) return;

  let status: HealthStatus = "healthy";
  let errorMsg = "";

  try {
    // 1. Check Repo URL (GitHub API or simple fetch)
    if (repoUrl && repoUrl.includes("github.com")) {
      const repoPath = new URL(repoUrl).pathname.slice(1);
      const res = await fetch(`https://api.github.com/repos/${repoPath}`, {
        headers: {
          Authorization: `Bearer ${process.env.GH_API_TOKEN || process.env.GITHUB_TOKEN || ""}`,
          Accept: "application/vnd.github+json",
        }
      });
      if (!res.ok) {
        status = "down";
        errorMsg = `Repo not accessible: ${res.status}`;
      }
    }

    // 2. Check Server/Homepage URL
    if (status === "healthy" && serverUrl) {
      try {
        const res = await fetch(serverUrl, { method: "HEAD", signal: AbortSignal.timeout(5000) });
        if (!res.ok && res.status !== 405) { // 405 Method Not Allowed is fine for HEAD
          status = "degraded";
          errorMsg = `Homepage returned ${res.status}`;
        }
      } catch {
        status = "degraded";
        errorMsg = "Homepage timeout or connection error";
      }
    }
  } catch (e) {
    status = "unknown";
    errorMsg = e instanceof Error ? e.message : "Unknown health check error";
  }

  await adminClient.from("servers").update({
    health_status: status,
    health_checked_at: new Date().toISOString(),
    health_error: errorMsg
  }).eq("slug", slug);

  return { status, error: errorMsg };
}

export async function runFullHealthCheck() {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) return;

  const { data: servers } = await adminClient
    .from("servers")
    .select("slug, repo_url, server_url")
    .eq("status", "active");

  if (!servers) return;

  const results = [];
  for (const server of servers) {
    const res = await checkServerHealth(server.slug, server.repo_url, server.server_url);
    results.push({ slug: server.slug, ...res });
  }

  return results;
}
