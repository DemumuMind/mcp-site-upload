import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPypiSeedSet,
  normalizePypiPackage,
  normalizePypiProjectUrls,
} from "../frontend/lib/catalog/providers/pypi.ts";

test("collects package names and repo-derived hints for PyPI seeding", () => {
  const seeds = buildPypiSeedSet([
    { packageName: "example-mcp" },
    { packageName: "example-mcp" },
    { repoHint: "https://github.com/example/python-mcp" },
    { repoHint: "https://github.com/example/python_mcp" },
  ]);

  assert.deepEqual(seeds, ["example-mcp", "example-mcp", "python-mcp", "python-mcp"]);
});

test("normalizes PyPI project urls and prefers repository links", () => {
  const urls = normalizePypiProjectUrls(
    {
      Homepage: "https://example.com/docs",
      Source: "https://github.com/example/python-mcp",
      Documentation: "https://docs.example.com/python-mcp",
    },
    "https://pypi.org/project/example-mcp/",
  );

  assert.equal(urls.repoUrl, "https://github.com/example/python-mcp");
  assert.equal(urls.repoUrlNormalized, "github.com/example/python-mcp");
  assert.equal(urls.homepageUrl, "https://example.com/docs");
});

test("maps a PyPI JSON payload into a normalized candidate", () => {
  const candidate = normalizePypiPackage({
    packageName: "example-mcp",
    payload: {
      info: {
        name: "example-mcp",
        summary: "Python MCP server",
        description: "Python MCP server for docs",
        home_page: "https://example.com/docs",
        project_urls: {
          Source: "https://github.com/example/python-mcp",
        },
        author: "Example Org",
        version: "0.9.1",
      },
    },
    repoHints: ["https://github.com/example/python-mcp"],
    scopeKey: "pypi:example-mcp",
  });

  assert.equal(candidate.sourceType, "pypi");
  assert.equal(candidate.identity.packageType, "pypi");
  assert.equal(candidate.identity.packageName, "example-mcp");
  assert.equal(candidate.repoUrlNormalized, "github.com/example/python-mcp");
  assert.equal(candidate.maintainer?.name, "Example Org");
});
