import assert from "node:assert/strict";
import test from "node:test";

import {
  clearProcessMemoryCache,
  readProcessMemoryCache,
} from "../frontend/lib/cache/memory.ts";

test.afterEach(() => {
  clearProcessMemoryCache();
});

test("process memory cache reuses entries before TTL expiry", () => {
  const now = 0;
  let loadCount = 0;

  const first = readProcessMemoryCache(
    "sectionIndex",
    "test:section-index:docs",
    () => ({ call: ++loadCount }),
    () => now,
  );
  const second = readProcessMemoryCache(
    "sectionIndex",
    "test:section-index:docs",
    () => ({ call: ++loadCount }),
    () => now + 1_000,
  );

  assert.equal(loadCount, 1);
  assert.equal(first, second);
});

test("process memory cache refreshes entries after TTL expiry", () => {
  let now = 0;
  let loadCount = 0;

  const first = readProcessMemoryCache(
    "howToUsePaths",
    "test:how-to-use",
    () => ({ call: ++loadCount }),
    () => now,
  );

  now = 61_000;

  const second = readProcessMemoryCache(
    "howToUsePaths",
    "test:how-to-use",
    () => ({ call: ++loadCount }),
    () => now,
  );

  assert.equal(loadCount, 2);
  assert.notEqual(first, second);
  assert.deepEqual(second, { call: 2 });
});

test("process memory cache stores null results until TTL expiry", () => {
  const now = 0;
  let loadCount = 0;

  const first = readProcessMemoryCache(
    "sectionIndex",
    "test:missing-section",
    () => {
      loadCount += 1;
      return null;
    },
    () => now,
  );
  const second = readProcessMemoryCache(
    "sectionIndex",
    "test:missing-section",
    () => {
      loadCount += 1;
      return { call: loadCount };
    },
    () => now + 5_000,
  );

  assert.equal(loadCount, 1);
  assert.equal(first, null);
  assert.equal(second, null);
});
