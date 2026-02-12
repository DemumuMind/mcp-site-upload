import { NextResponse } from "next/server";
import { getAllBlogPosts } from "@/lib/blog/service";
import { getAllBlogV2ListItems } from "@/lib/blog-v2/contentlayer";
import { isBlogV2Enabled } from "@/lib/blog-v2/flags";
import { getCatalogSnapshot } from "@/lib/catalog/snapshot";
type StaticSitemapRoute = {
    path: string;
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
    priority: number;
};
type SitemapEntry = {
    url: string;
    lastModified: string;
    changeFrequency: StaticSitemapRoute["changeFrequency"];
    priority: number;
};
const staticRoutes: readonly StaticSitemapRoute[] = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/catalog", changeFrequency: "daily", priority: 0.9 },
    { path: "/about", changeFrequency: "weekly", priority: 0.8 },
    { path: "/pricing", changeFrequency: "weekly", priority: 0.8 },
    { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
    { path: "/discord", changeFrequency: "weekly", priority: 0.7 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
    { path: "/categories", changeFrequency: "weekly", priority: 0.7 },
    { path: "/mcp", changeFrequency: "weekly", priority: 0.7 },
    { path: "/tools", changeFrequency: "weekly", priority: 0.7 },
    { path: "/how-to-use", changeFrequency: "weekly", priority: 0.7 },
    { path: "/submit-server", changeFrequency: "weekly", priority: 0.7 },
    { path: "/cookie-settings", changeFrequency: "monthly", priority: 0.5 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/auth", changeFrequency: "monthly", priority: 0.4 },
    { path: "/sitemap", changeFrequency: "monthly", priority: 0.4 },
    { path: "/llms.txt", changeFrequency: "monthly", priority: 0.4 },
];
function escapeXml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}
function serializeUrl(entry: SitemapEntry) {
    return [
        "<url>",
        `<loc>${escapeXml(entry.url)}</loc>`,
        `<lastmod>${entry.lastModified}</lastmod>`,
        `<changefreq>${entry.changeFrequency}</changefreq>`,
        `<priority>${entry.priority.toFixed(1)}</priority>`,
        "</url>",
    ].join("");
}
export async function GET() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const nowIso = new Date().toISOString();
    const catalogSnapshot = await getCatalogSnapshot();
    const activeServers = catalogSnapshot.servers;
    const blogPosts = isBlogV2Enabled()
        ? getAllBlogV2ListItems().map((post) => ({
            slug: post.slug,
            publishedAt: post.publishedAt,
            updatedAt: post.updatedAt,
        }))
        : (await getAllBlogPosts()).map((post) => ({
            slug: post.slug,
            publishedAt: post.publishedAt,
            updatedAt: post.updatedAt,
        }));
    const staticEntries: SitemapEntry[] = staticRoutes.map((route) => ({
        url: new URL(route.path, siteUrl).toString(),
        lastModified: nowIso,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
    }));
    const serverEntries: SitemapEntry[] = activeServers.map((mcpServer) => ({
        url: new URL(`/server/${mcpServer.slug}`, siteUrl).toString(),
        lastModified: mcpServer.createdAt ? new Date(mcpServer.createdAt).toISOString() : nowIso,
        changeFrequency: "weekly",
        priority: 0.8,
    }));
    const blogEntries: SitemapEntry[] = blogPosts.map((post) => ({
        url: new URL(`/blog/${post.slug}`, siteUrl).toString(),
        lastModified: new Date(post.updatedAt ?? post.publishedAt).toISOString(),
        changeFrequency: "weekly",
        priority: 0.7,
    }));
    const payload = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...[...staticEntries, ...serverEntries, ...blogEntries].map(serializeUrl),
        "</urlset>",
    ].join("");
    return new NextResponse(payload, {
        status: 200,
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
    });
}
