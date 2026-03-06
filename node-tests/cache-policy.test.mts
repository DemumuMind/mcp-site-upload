import assert from "node:assert/strict";
import test from "node:test";

import {
  BACKUP_FRESHNESS_HOURS,
  BACKUP_RESTORE_DRILL_MAX_AGE_DAYS,
  BACKUP_RETENTION_DAYS,
  buildCacheControlHeader,
  CACHE_TAGS,
  CATALOG_AUTO_SYNC_LOCK_TTL_SECONDS,
  CATALOG_SYNC_ALL_LOCK_TTL_SECONDS,
  COOKIE_CONSENT_COOKIE_KEY,
  COOKIE_CONSENT_PROFILE_STORAGE_KEY,
  getRateLimitPolicy,
  getServerDataRevalidateSeconds,
  SUBMIT_SERVER_DRAFT_STORAGE_KEY,
  TOOLS_RULES_HISTORY_STORAGE_KEY,
  TOOLS_RULES_PRESETS_STORAGE_KEY,
} from "../frontend/lib/cache/policy.ts";

test("cache registry exposes the expected shared cache tags and TTLs", () => {
  assert.equal(CACHE_TAGS.catalogServers, "catalog-servers");
  assert.equal(CACHE_TAGS.blogPosts, "blog-posts");
  assert.equal(CACHE_TAGS.adminDashboard, "admin-dashboard");
  assert.equal(getServerDataRevalidateSeconds("catalogActiveServers"), 300);
  assert.equal(getServerDataRevalidateSeconds("adminDashboard"), 30);
  assert.equal(CATALOG_AUTO_SYNC_LOCK_TTL_SECONDS, 900);
  assert.equal(CATALOG_SYNC_ALL_LOCK_TTL_SECONDS, 1800);
});

test("cache registry builds stable cache-control headers", () => {
  assert.equal(buildCacheControlHeader("apiNoStore"), "no-store, no-cache, must-revalidate");
  assert.equal(buildCacheControlHeader("exportNoStore"), "no-store");
  assert.equal(buildCacheControlHeader("publicDocument"), "public, max-age=3600, stale-while-revalidate=86400");
});

test("cache registry keeps browser storage and ops freshness values centralized", () => {
  assert.equal(COOKIE_CONSENT_COOKIE_KEY, "demumumind_cookie_consent");
  assert.equal(COOKIE_CONSENT_PROFILE_STORAGE_KEY, "demumumind-cookie-consent-profile");
  assert.equal(SUBMIT_SERVER_DRAFT_STORAGE_KEY, "demumumind-submit-server-draft-v2");
  assert.equal(TOOLS_RULES_PRESETS_STORAGE_KEY, "tools.rules.presets.v1");
  assert.equal(TOOLS_RULES_HISTORY_STORAGE_KEY, "tools.rules.history.v1");
  assert.equal(BACKUP_FRESHNESS_HOURS, 26);
  assert.equal(BACKUP_RESTORE_DRILL_MAX_AGE_DAYS, 45);
  assert.equal(BACKUP_RETENTION_DAYS, 30);
});

test("rate-limit presets are sourced from the shared cache policy registry", () => {
  assert.deepEqual(getRateLimitPolicy("public"), {
    windowMs: 60_000,
    maxRequests: 120,
  });
  assert.deepEqual(getRateLimitPolicy("admin"), {
    windowMs: 60_000,
    maxRequests: 240,
  });
  assert.deepEqual(getRateLimitPolicy("cron"), {
    windowMs: 60_000,
    maxRequests: 30,
  });
});
