import assert from "node:assert/strict";
import test from "node:test";

import * as workspaceModule from "../frontend/lib/catalog/workspace-core.ts";

const { buildCatalogWorkspaceCore } = workspaceModule;

test("builds a shared catalog workspace from snapshot data and route params", () => {
  const servers = [
    {
      id: "server-github",
      createdAt: "2026-03-06T00:00:00.000Z",
      name: "GitHub MCP",
      slug: "github",
      description: "Repository workflows",
      serverUrl: "https://github.com/modelcontextprotocol/servers",
      category: "Developer Tools",
      authType: "oauth",
      tags: ["github", "developer-tools"],
      repoUrl: "https://github.com/modelcontextprotocol/servers",
      maintainer: { name: "Demo" },
      status: "active",
      verificationLevel: "official",
      healthStatus: "healthy",
      tools: ["list_repositories", "read_file"],
    },
    {
      id: "server-postgres",
      createdAt: "2026-03-05T00:00:00.000Z",
      name: "Postgres MCP",
      slug: "postgres",
      description: "Database workflows",
      serverUrl: "https://postgresql.org",
      category: "Databases",
      authType: "api_key",
      tags: ["postgres", "database"],
      repoUrl: "https://postgresql.org",
      maintainer: { name: "Demo" },
      status: "active",
      verificationLevel: "partner",
      healthStatus: "healthy",
      tools: ["run_query", "describe_table", "list_tables"],
    },
  ];

  const workspace = buildCatalogWorkspaceCore(
    {
      servers,
      featuredServers: [servers[0]],
      totalServers: 2,
      totalTools: 5,
      totalCategories: 2,
      categoryEntries: [["Developer Tools", 1], ["Databases", 1]],
    },
    {
      query: "postgres",
      layout: "list",
      pageSize: "24",
      page: "0",
      auth: ["api_key", "api_key"],
    },
    {
      parseQuery: (searchParams) => ({
        page: Math.max(1, Number(searchParams.get("page") ?? "1")),
        pageSize: Number(searchParams.get("pageSize") ?? "12"),
        query: searchParams.get("query") ?? "",
        categories: [],
        auth: Array.from(new Set(searchParams.getAll("auth"))),
        tags: [],
        verification: [],
        health: [],
        toolsMin: null,
        toolsMax: null,
        sortBy: "rating",
        sortDir: "desc",
        layout: (searchParams.get("layout") ?? "grid") as "grid" | "list",
      }),
      runSearch: (snapshotServers, query) => {
        const items = snapshotServers.filter((server) => {
          return (
            query.auth.length === 0 ||
            query.auth.includes(server.authType)
          ) && server.slug.includes(query.query);
        });

        return {
          items,
          total: items.length,
          page: query.page,
          pageSize: query.pageSize,
          totalPages: 1,
          facets: {
            tagEntries: [["postgres", 1]],
          },
          appliedFilters: {
            ...query,
            auth: Array.from(new Set(query.auth)),
            page: 1,
          },
        };
      },
    },
  );

  assert.equal(workspace.query.query, "postgres");
  assert.equal(workspace.query.layout, "list");
  assert.equal(workspace.query.page, 1);
  assert.equal(workspace.query.pageSize, 24);
  assert.deepEqual(workspace.query.auth, ["api_key"]);

  assert.equal(workspace.summary.totalServers, 2);
  assert.equal(workspace.summary.totalTools, 5);
  assert.deepEqual(
    workspace.summary.featuredServers.map((server) => server.slug),
    ["github"],
  );

  assert.equal(workspace.result.total, 1);
  assert.deepEqual(
    workspace.result.items.map((server) => server.slug),
    ["postgres"],
  );
});
