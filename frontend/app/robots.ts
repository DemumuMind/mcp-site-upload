import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const sitemapUrl = new URL("/sitemap.xml", siteUrl).toString();
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin", "/admin/*"],
            },
        ],
        sitemap: sitemapUrl,
    };
}
