import { expect, test } from "@playwright/test";

test.describe("Admin API local success paths", () => {
  test("POST /api/admin/blog-v2/preview accepts admin bearer token and returns preview payload", async ({
    request,
  }) => {
    const adminToken = process.env.ADMIN_ACCESS_TOKEN?.trim() || "local-admin-token";

    const response = await request.post("/api/admin/blog-v2/preview", {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
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

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      ok: true,
      actor: "fallback_token",
      preview: {
        slug: "test-draft",
        title: "Test draft",
      },
    });
  });
});
