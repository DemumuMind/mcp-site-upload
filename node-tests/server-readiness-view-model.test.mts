import assert from "node:assert/strict";
import test from "node:test";

import * as readinessModule from "../frontend/app/server/[slug]/page-readiness.ts";

const { buildServerReadinessViewModel } = readinessModule;

test("marks healthy low-friction verified servers as ready for rollout", () => {
  const model = buildServerReadinessViewModel({
    mcpServer: {
      id: "github",
      name: "GitHub MCP",
      slug: "github",
      description: "Repo workflows",
      serverUrl: "https://example.com/github",
      category: "Developer Tools",
      authType: "none",
      tags: ["github", "developer-tools"],
      repoUrl: "https://github.com/example/github",
      maintainer: { name: "Demo" },
      status: "active",
      verificationLevel: "official",
      healthStatus: "healthy",
      healthCheckedAt: "2026-03-07T00:00:00.000Z",
      tools: ["list_repositories", "read_file", "open_pr"],
    },
    docsSignal: "verified",
  });

  assert.equal(model.score, 100);
  assert.equal(model.status, "ready");
  assert.equal(model.statusLabel, "Ready for rollout");
  assert.equal(model.recommendedAction, "Ship to a pilot workflow");
  assert.equal(model.checklistItems.length, 5);
  assert.deepEqual(
    model.checklistItems.map((item) => item.status),
    ["ready", "ready", "ready", "ready", "ready"],
  );
});

test("downgrades readiness when auth and trust context need review", () => {
  const model = buildServerReadinessViewModel({
    mcpServer: {
      id: "postgres",
      name: "Postgres MCP",
      slug: "postgres",
      description: "Database access",
      serverUrl: "https://example.com/postgres",
      category: "Databases",
      authType: "api_key",
      tags: ["postgres", "database"],
      maintainer: { name: "Demo" },
      status: "active",
      verificationLevel: "community",
      healthStatus: "unknown",
      tools: ["run_query", "describe_table"],
    },
    docsSignal: "linked",
  });

  assert.equal(model.status, "review");
  assert.equal(model.statusLabel, "Review before rollout");
  assert.equal(model.recommendedAction, "Validate setup with an owner first");
  assert.equal(model.checklistItems.find((item) => item.key === "auth")?.status, "review");
  assert.equal(model.checklistItems.find((item) => item.key === "health")?.status, "review");
  assert.equal(model.checklistItems.find((item) => item.key === "trust")?.status, "review");
  assert.equal(model.checklistItems.find((item) => item.key === "docs")?.status, "review");
});

test("clamps blocked readiness score when health is down", () => {
  const model = buildServerReadinessViewModel({
    mcpServer: {
      id: "blocked-server",
      name: "Blocked Server",
      slug: "blocked-server",
      description: "Health is currently down",
      serverUrl: "https://example.com/blocked",
      category: "Developer Tools",
      authType: "none",
      tags: ["ops"],
      repoUrl: "https://github.com/example/blocked",
      maintainer: { name: "Demo" },
      status: "active",
      verificationLevel: "official",
      healthStatus: "down",
      tools: ["run"],
    },
    docsSignal: "verified",
  });

  assert.equal(model.status, "blocked");
  assert.equal(model.statusLabel, "Blocked for rollout");
  assert.equal(model.recommendedAction, "Resolve trust or health blockers");
  assert.equal(model.score, 34);
  assert.equal(model.checklistItems.find((item) => item.key === "health")?.status, "blocked");
});
