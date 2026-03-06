import assert from "node:assert/strict";
import test from "node:test";

import * as serversModule from "../frontend/lib/servers.ts";

const { getActiveServers } = serversModule;

test("returns local fallback servers when supabase public env is unavailable in non-production", async () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const originalNodeEnv = process.env.NODE_ENV;

  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  process.env.NODE_ENV = "development";

  try {
    const servers = await getActiveServers();
    assert.ok(servers.length >= 3);
    assert.deepEqual(
      servers.slice(0, 3).map((server) => server.slug),
      ["github", "postgres", "playwright"],
    );
  } finally {
    if (originalUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    }

    if (originalAnon === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalAnon;
    }

    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  }
});
