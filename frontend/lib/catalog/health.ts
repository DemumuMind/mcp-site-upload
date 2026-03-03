import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { HealthStatus } from "@/lib/types";

function isPrivateIpv4(address: string): boolean {
  const octets = address.split(".").map((p) => Number.parseInt(p, 10));
  if (octets.length !== 4 || octets.some((p) => Number.isNaN(p) || p < 0 || p > 255)) return true;
  const [first, second] = octets;
  if (first === 10 || first === 127) return true;
  if (first === 169 && second === 254) return true;
  if (first === 172 && second >= 16 && second <= 31) return true;
  if (first === 192 && second === 168) return true;
  if (first === 0 || first >= 224) return true;
  return false;
}

function isUnsafeHost(hostname: string): boolean {
  const h = hostname.trim().toLowerCase();
  if (!h) return true;
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal")) return true;
  const ipVersion = isIP(h);
  if (ipVersion === 4) return isPrivateIpv4(h);
  if (ipVersion === 6) {
    if (h === "::" || h === "::1") return true;
    if (h.startsWith("fe80:") || h.startsWith("fc") || h.startsWith("fd")) return true;
    if (h.startsWith("::ffff:")) return isPrivateIpv4(h.slice("::ffff:".length));
  }
  return false;
}

async function isSafeServerUrl(rawUrl: string): Promise<boolean> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  if (parsed.username || parsed.password) return false;
  if (isUnsafeHost(parsed.hostname)) return false;
  if (isIP(parsed.hostname)) return true;
  try {
    const records = await lookup(parsed.hostname, { all: true, verbatim: true });
    if (records.length === 0) return false;
    return records.every((r) => !isUnsafeHost(r.address));
  } catch {
    return false;
  }
}

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

    // 2. Check Server/Homepage URL with SSRF protection
    if (status === "healthy" && serverUrl) {
      const safe = await isSafeServerUrl(serverUrl);
      if (!safe) {
        status = "unknown";
        errorMsg = "Unsafe or invalid server URL";
      } else {
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
