import { getServerDataPolicy } from "./policy.ts";

export function buildServerDataCacheConfig(
  policyKey: Parameters<typeof getServerDataPolicy>[0],
): { revalidate: number; tags: [string] } {
  const policy = getServerDataPolicy(policyKey);

  return {
    revalidate: policy.revalidateSeconds,
    tags: [policy.tag],
  };
}
