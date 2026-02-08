import type { MetadataRoute } from "next";

import { getActiveServers } from "@/lib/servers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const activeServers = await getActiveServers();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const serverRoutes: MetadataRoute.Sitemap = activeServers.map((mcpServer) => ({
    url: `${baseUrl}/server/${mcpServer.slug}`,
    lastModified: mcpServer.createdAt ? new Date(mcpServer.createdAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...serverRoutes];
}
