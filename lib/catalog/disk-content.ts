import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

import { applyServerCatalogDefaults } from "@/lib/server-catalog-defaults";
import type { McpServer, ServerStatus } from "@/lib/types";

const catalogEntriesRoot = path.join(process.cwd(), "content", "catalog", "entries");

const maintainerSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email().optional(),
});

const diskCatalogEntrySchema = z.object({
  id: z.string().trim().min(1).optional(),
  createdAt: z.string().trim().optional(),
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1),
  serverUrl: z.string().trim().default(""),
  category: z.string().trim().min(1).default("Other"),
  authType: z.enum(["oauth", "api_key", "none"]).default("none"),
  tags: z.array(z.string().trim().min(1)).default([]),
  repoUrl: z.string().trim().optional(),
  maintainer: maintainerSchema.optional(),
  status: z.enum(["pending", "active", "rejected"]).default("active"),
  verificationLevel: z.enum(["community", "partner", "official"]).default("community"),
  healthStatus: z.enum(["unknown", "healthy", "degraded", "down"]).optional(),
  healthCheckedAt: z.string().trim().optional(),
  healthError: z.string().trim().optional(),
  tools: z.array(z.string().trim().min(1)).default([]),
});

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseCatalogEntryFile(filePath: string): McpServer {
  const raw = fs.readFileSync(filePath, "utf8");

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in ${filePath}: ${(error as Error).message}`);
  }

  const parsed = diskCatalogEntrySchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new Error(`Invalid catalog entry schema in ${filePath}: ${parsed.error.message}`);
  }

  const catalogEntry = parsed.data;
  const fileSlug = path.basename(filePath, ".json");
  const normalizedFileSlug = normalizeSlug(fileSlug);
  const normalizedEntrySlug = normalizeSlug(catalogEntry.slug ?? catalogEntry.name);
  const slug = normalizedEntrySlug || normalizedFileSlug;

  if (!slug) {
    throw new Error(`Could not derive slug for catalog entry file: ${filePath}`);
  }

  return applyServerCatalogDefaults({
    id: catalogEntry.id ?? `catalog-${slug}`,
    createdAt: catalogEntry.createdAt,
    name: catalogEntry.name,
    slug,
    description: catalogEntry.description,
    serverUrl: catalogEntry.serverUrl,
    category: catalogEntry.category,
    authType: catalogEntry.authType,
    tags: catalogEntry.tags,
    repoUrl: catalogEntry.repoUrl,
    maintainer: catalogEntry.maintainer,
    status: catalogEntry.status,
    verificationLevel: catalogEntry.verificationLevel,
    healthStatus: catalogEntry.healthStatus,
    healthCheckedAt: catalogEntry.healthCheckedAt,
    healthError: catalogEntry.healthError,
    tools: catalogEntry.tools,
  });
}

export function getCatalogEntriesFromDisk(status?: ServerStatus): McpServer[] {
  if (!fs.existsSync(catalogEntriesRoot)) {
    return [];
  }

  const fileNames = fs
    .readdirSync(catalogEntriesRoot)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right));

  const parsedEntries = fileNames.map((fileName) =>
    parseCatalogEntryFile(path.join(catalogEntriesRoot, fileName)),
  );

  if (!status) {
    return parsedEntries;
  }

  return parsedEntries.filter((catalogEntry) => catalogEntry.status === status);
}
