import { expect, test } from "@playwright/test";

test.describe("Admin API auth", () => {
  test("GET /api/admin/security-events/export without auth returns 401", async ({ request }) => {
    const response = await request.get("/api/admin/security-events/export");

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ ok: false });
    expect(typeof body.error).toBe("string");
  });

  test("GET /api/admin/multi-agent/weekly-export without auth returns 401", async ({ request }) => {
    const response = await request.get("/api/admin/multi-agent/weekly-export");

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(typeof body.error).toBe("string");
  });

  test("POST /api/admin/blog-v2/generate without auth returns 401", async ({ request }) => {
    const response = await request.post("/api/admin/blog-v2/generate", {
      data: {
        topic: "mcp architecture",
        tags: ["architecture"],
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ ok: false });
    expect(typeof body.message).toBe("string");
  });

  test("POST /api/admin/blog-v2/preview without auth returns 401", async ({ request }) => {
    const response = await request.post("/api/admin/blog-v2/preview", {
      data: {
        draft: {
          slug: "test-draft",
          title: "Test draft",
          excerpt: "This is a valid excerpt for preview.",
          tags: ["testing"],
          publishedAt: "2026-03-06T12:00:00.000Z",
          readingTime: 4,
          researchPacketId: "packet-1",
          researchProvider: "test-provider",
          researchSourceCount: 1,
          mdx: "## Overview\n\nThis is enough MDX content for preview.",
          sourceUrls: ["https://example.com"],
          notes: ["note"],
        },
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ ok: false });
    expect(typeof body.message).toBe("string");
  });

  test("POST /api/admin/blog-v2/publish without auth returns 401", async ({ request }) => {
    const response = await request.post("/api/admin/blog-v2/publish", {
      data: {
        draft: {
          slug: "test-draft",
          title: "Test draft",
          excerpt: "This is a valid excerpt for publish.",
          tags: ["testing"],
          publishedAt: "2026-03-06T12:00:00.000Z",
          readingTime: 4,
          researchPacketId: "packet-1",
          researchProvider: "test-provider",
          researchSourceCount: 1,
          mdx: "## Overview\n\nThis is enough MDX content for publish.",
          sourceUrls: ["https://example.com"],
          notes: ["note"],
        },
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ ok: false });
    expect(typeof body.message).toBe("string");
  });
});
