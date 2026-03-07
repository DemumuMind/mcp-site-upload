import assert from "node:assert/strict";
import test from "node:test";

import {
  extractImageReferencesFromText,
  normalizeOciImageReference,
} from "../frontend/lib/catalog/providers/oci.ts";

test("normalizes GHCR image references with tags", () => {
  const ref = normalizeOciImageReference("ghcr.io/example/team-mcp:1.2.3");

  assert.deepEqual(ref, {
    registryHost: "ghcr.io",
    imageName: "example/team-mcp",
    tag: "1.2.3",
    digest: null,
    canonicalRef: "ghcr.io/example/team-mcp:1.2.3",
  });
});

test("normalizes Docker Hub image references with digests", () => {
  const ref = normalizeOciImageReference("docker.io/library/example@sha256:abcdef");

  assert.deepEqual(ref, {
    registryHost: "docker.io",
    imageName: "library/example",
    tag: null,
    digest: "sha256:abcdef",
    canonicalRef: "docker.io/library/example@sha256:abcdef",
  });
});

test("extracts explicit OCI references from free text and ignores invalid values", () => {
  const refs = extractImageReferencesFromText(`
    Run with ghcr.io/example/team-mcp:latest
    Or fallback to docker.io/library/example@sha256:abcdef
    Ignore localhost:5000/internal-only:dev
  `);

  assert.deepEqual(refs, [
    {
      registryHost: "ghcr.io",
      imageName: "example/team-mcp",
      tag: "latest",
      digest: null,
      canonicalRef: "ghcr.io/example/team-mcp:latest",
    },
    {
      registryHost: "docker.io",
      imageName: "library/example",
      tag: null,
      digest: "sha256:abcdef",
      canonicalRef: "docker.io/library/example@sha256:abcdef",
    },
  ]);
});
