import fs from "node:fs";
import path from "node:path";

const cachePolicyPath = path.resolve(process.cwd(), "frontend/lib/cache/repo-cache-policy.json");
const repoCachePolicy = JSON.parse(fs.readFileSync(cachePolicyPath, "utf8"));

export function getHttpCachePolicy(policyKey) {
  return repoCachePolicy.http?.[policyKey] ?? null;
}

export function getRequestCachePolicy(policyKey) {
  return repoCachePolicy.requests?.[policyKey] ?? null;
}

export function buildCacheControlHeader(policyKey) {
  const policy = getHttpCachePolicy(policyKey);
  if (!policy) {
    return "";
  }

  const directives = [];

  if (policy.visibility) {
    directives.push(policy.visibility);
  }
  if (policy.noStore) {
    directives.push("no-store");
  }
  if (policy.noCache) {
    directives.push("no-cache");
  }
  if (policy.mustRevalidate) {
    directives.push("must-revalidate");
  }
  if (typeof policy.maxAgeSeconds === "number") {
    directives.push(`max-age=${policy.maxAgeSeconds}`);
  }
  if (typeof policy.staleWhileRevalidateSeconds === "number") {
    directives.push(`stale-while-revalidate=${policy.staleWhileRevalidateSeconds}`);
  }

  return directives.join(", ");
}

export function withRequestCachePolicy(policyKey, init = {}) {
  const policy = getRequestCachePolicy(policyKey);
  if (!policy?.cache) {
    return init;
  }

  return {
    ...init,
    cache: policy.cache,
  };
}

export function getMemoryPolicy(policyKey) {
  return repoCachePolicy.memory?.[policyKey] ?? null;
}

export function getSecurityPolicy(policyKey) {
  return repoCachePolicy.security?.[policyKey] ?? null;
}

export function getOperationPolicy(policyKey) {
  return repoCachePolicy.operations?.[policyKey];
}

export function getRepoCachePolicyVersion() {
  return repoCachePolicy.version ?? 0;
}
