import repoCachePolicyJson from "./repo-cache-policy.json" with { type: "json" };

type Visibility = "public" | "private";

type ServerDataPolicy = {
  tag: string;
  revalidateSeconds: number;
};

type HttpCachePolicy = {
  visibility?: Visibility;
  noStore?: boolean;
  noCache?: boolean;
  mustRevalidate?: boolean;
  maxAgeSeconds?: number;
  staleWhileRevalidateSeconds?: number;
};

type RequestCacheMode = NonNullable<RequestInit["cache"]>;

type RequestCachePolicy = {
  cache?: RequestCacheMode;
};

type MemoryCachePolicy = {
  ttlSeconds: number;
};

type CookieConsentStoragePolicy = {
  choiceLocalStorageKey: string;
  profileLocalStorageKey: string;
  choiceCookieKey: string;
  profileCookieKey: string;
  changeEvent: string;
  openEvent: string;
  maxAgeSeconds: number;
};

type SubmitServerDraftStoragePolicy = {
  localStorageKey: string;
};

type ToolsRulesStoragePolicy = {
  presetsLocalStorageKey: string;
  historyLocalStorageKey: string;
};

type RateLimitPolicy = {
  windowMs: number;
  maxRequests: number;
};

type AuthSecurityPolicy = {
  loginWindowSeconds: number;
  maxFailedAttempts: number;
  alertFailedAttemptsThreshold: number;
  alertFailedAttemptsEscalationThreshold: number;
};

type OperationsPolicy = {
  catalogAutoSyncLockTtlSeconds: number;
  catalogSyncAllLockTtlSeconds: number;
  backupFreshnessHours: number;
  backupRestoreDrillMaxAgeDays: number;
  backupRetentionDays: number;
  imageMinimumCacheTtlSeconds: number;
};

type RepoCachePolicy = {
  version: number;
  serverData: {
    catalogActiveServers: ServerDataPolicy;
    blogSnapshot: ServerDataPolicy;
    adminDashboard: ServerDataPolicy;
    githubRepoDetails: ServerDataPolicy;
    githubReadme: ServerDataPolicy;
  };
  http: {
    publicDocument: HttpCachePolicy;
    apiNoStore: HttpCachePolicy;
    exportNoStore: HttpCachePolicy;
  };
  requests: {
    internalApi: RequestCachePolicy;
    interactiveSearch: RequestCachePolicy;
    operationalProbe: RequestCachePolicy;
    providerSearch: RequestCachePolicy;
    providerMutation: RequestCachePolicy;
  };
  memory: {
    howToUsePaths: MemoryCachePolicy;
    sectionIndex: MemoryCachePolicy;
  };
  storage: {
    cookieConsent: CookieConsentStoragePolicy;
    submitServerDraft: SubmitServerDraftStoragePolicy;
    toolsRules: ToolsRulesStoragePolicy;
  };
  rateLimits: {
    public: RateLimitPolicy;
    admin: RateLimitPolicy;
    cron: RateLimitPolicy;
  };
  security: {
    auth: AuthSecurityPolicy;
  };
  operations: OperationsPolicy;
};

type ServerDataPolicyKey = keyof RepoCachePolicy["serverData"];
type HttpPolicyKey = keyof RepoCachePolicy["http"];
type RequestPolicyKey = keyof RepoCachePolicy["requests"];
type MemoryPolicyKey = keyof RepoCachePolicy["memory"];
type RateLimitPolicyKey = keyof RepoCachePolicy["rateLimits"];
type SecurityPolicyKey = keyof RepoCachePolicy["security"];
type OperationPolicyKey = keyof RepoCachePolicy["operations"];

const repoCachePolicy = repoCachePolicyJson as RepoCachePolicy;

export const REPO_CACHE_POLICY_VERSION = repoCachePolicy.version;

export function getServerDataPolicy(policyKey: ServerDataPolicyKey): ServerDataPolicy {
  return repoCachePolicy.serverData[policyKey];
}

export function getServerDataTag(policyKey: ServerDataPolicyKey): string {
  return getServerDataPolicy(policyKey).tag;
}

export function getServerDataRevalidateSeconds(policyKey: ServerDataPolicyKey): number {
  return getServerDataPolicy(policyKey).revalidateSeconds;
}

export function withNextFetchCache(
  policyKey: ServerDataPolicyKey,
  init: RequestInit & { next?: { revalidate?: number } } = {},
): RequestInit & { next: { revalidate: number } } {
  return {
    ...init,
    next: {
      ...init.next,
      revalidate: getServerDataRevalidateSeconds(policyKey),
    },
  };
}

export function getHttpCachePolicy(policyKey: HttpPolicyKey): HttpCachePolicy {
  return repoCachePolicy.http[policyKey];
}

export function buildCacheControlHeader(policyKey: HttpPolicyKey): string {
  const policy = getHttpCachePolicy(policyKey);
  const directives: string[] = [];

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

export function getRequestCachePolicy(policyKey: RequestPolicyKey): RequestCachePolicy {
  return repoCachePolicy.requests[policyKey];
}

export function withRequestCachePolicy(
  policyKey: RequestPolicyKey,
  init: RequestInit = {},
): RequestInit {
  const policy = getRequestCachePolicy(policyKey);
  if (!policy.cache) {
    return init;
  }

  return {
    ...init,
    cache: policy.cache,
  };
}

export function getMemoryPolicy(policyKey: MemoryPolicyKey): MemoryCachePolicy {
  return repoCachePolicy.memory[policyKey];
}

export function getMemoryTtlSeconds(policyKey: MemoryPolicyKey): number {
  return getMemoryPolicy(policyKey).ttlSeconds;
}

export function getRateLimitPolicy(policyKey: RateLimitPolicyKey): RateLimitPolicy {
  return repoCachePolicy.rateLimits[policyKey];
}

export function getSecurityPolicy(policyKey: SecurityPolicyKey): RepoCachePolicy["security"][SecurityPolicyKey] {
  return repoCachePolicy.security[policyKey];
}

export function getOperationPolicy(policyKey: OperationPolicyKey): number {
  return repoCachePolicy.operations[policyKey];
}

export const CACHE_TAGS = Object.freeze({
  catalogServers: getServerDataTag("catalogActiveServers"),
  blogPosts: getServerDataTag("blogSnapshot"),
  adminDashboard: getServerDataTag("adminDashboard"),
  githubRepoDetails: getServerDataTag("githubRepoDetails"),
  githubReadme: getServerDataTag("githubReadme"),
});

export const COOKIE_CONSENT_STORAGE_KEY = repoCachePolicy.storage.cookieConsent.choiceLocalStorageKey;
export const COOKIE_CONSENT_PROFILE_STORAGE_KEY = repoCachePolicy.storage.cookieConsent.profileLocalStorageKey;
export const COOKIE_CONSENT_COOKIE_KEY = repoCachePolicy.storage.cookieConsent.choiceCookieKey;
export const COOKIE_CONSENT_PROFILE_COOKIE_KEY = repoCachePolicy.storage.cookieConsent.profileCookieKey;
export const COOKIE_CONSENT_EVENT = repoCachePolicy.storage.cookieConsent.changeEvent;
export const COOKIE_CONSENT_OPEN_EVENT = repoCachePolicy.storage.cookieConsent.openEvent;
export const COOKIE_CONSENT_MAX_AGE_SECONDS = repoCachePolicy.storage.cookieConsent.maxAgeSeconds;

export const SUBMIT_SERVER_DRAFT_STORAGE_KEY = repoCachePolicy.storage.submitServerDraft.localStorageKey;

export const TOOLS_RULES_PRESETS_STORAGE_KEY = repoCachePolicy.storage.toolsRules.presetsLocalStorageKey;
export const TOOLS_RULES_HISTORY_STORAGE_KEY = repoCachePolicy.storage.toolsRules.historyLocalStorageKey;

const authSecurityPolicy = getSecurityPolicy("auth");

export const AUTH_LOGIN_WINDOW_SECONDS = authSecurityPolicy.loginWindowSeconds;
export const AUTH_MAX_FAILED_ATTEMPTS = authSecurityPolicy.maxFailedAttempts;
export const AUTH_ALERT_FAILED_ATTEMPTS_THRESHOLD = authSecurityPolicy.alertFailedAttemptsThreshold;
export const AUTH_ALERT_FAILED_ATTEMPTS_ESCALATION_THRESHOLD =
  authSecurityPolicy.alertFailedAttemptsEscalationThreshold;

export const IMAGE_MINIMUM_CACHE_TTL_SECONDS = repoCachePolicy.operations.imageMinimumCacheTtlSeconds;

export const BACKUP_FRESHNESS_HOURS = repoCachePolicy.operations.backupFreshnessHours;
export const BACKUP_RESTORE_DRILL_MAX_AGE_DAYS = repoCachePolicy.operations.backupRestoreDrillMaxAgeDays;
export const BACKUP_RETENTION_DAYS = repoCachePolicy.operations.backupRetentionDays;

export const CATALOG_AUTO_SYNC_LOCK_TTL_SECONDS = repoCachePolicy.operations.catalogAutoSyncLockTtlSeconds;
export const CATALOG_SYNC_ALL_LOCK_TTL_SECONDS = repoCachePolicy.operations.catalogSyncAllLockTtlSeconds;
