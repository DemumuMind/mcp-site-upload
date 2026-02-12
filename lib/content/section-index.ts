import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { Locale } from "@/lib/i18n";
const sectionLocaleSchema = z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    eyebrow: z.string().trim().min(1).optional(),
    heroTitle: z.string().trim().min(1).optional(),
    heroDescription: z.string().trim().min(1).optional(),
});
const sectionIndexSchema = z.object({
    section: z.string().trim().min(1).optional(),
    locale: z.object({
        en: sectionLocaleSchema,
    }),
});
type SectionIndex = z.infer<typeof sectionIndexSchema>;
export type SectionLocaleCopy = z.infer<typeof sectionLocaleSchema>;
const contentRoot = path.join(process.cwd(), "content");
const sectionCache = new Map<string, SectionIndex | null>();
function getSectionIndexFilePath(sectionKey: string): string {
    return path.join(contentRoot, sectionKey, "_index.json");
}
export function getSectionIndex(sectionKey: string): SectionIndex | null {
    if (sectionCache.has(sectionKey)) {
        return sectionCache.get(sectionKey) ?? null;
    }
    const filePath = getSectionIndexFilePath(sectionKey);
    if (!fs.existsSync(filePath)) {
        sectionCache.set(sectionKey, null);
        return null;
    }
    const raw = fs.readFileSync(filePath, "utf8");
    let parsedJson: unknown;
    try {
        parsedJson = JSON.parse(raw);
    }
    catch (error) {
        throw new Error(`Invalid JSON in section index file "${filePath}": ${(error as Error).message}`);
    }
    const parsed = sectionIndexSchema.safeParse(parsedJson);
    if (!parsed.success) {
        throw new Error(`Invalid section index schema in "${filePath}": ${parsed.error.message}`);
    }
    sectionCache.set(sectionKey, parsed.data);
    return parsed.data;
}
export function getSectionLocaleCopy(sectionIndex: SectionIndex | null, locale: Locale): SectionLocaleCopy | null {
    if (!sectionIndex) {
        return null;
    }
    void locale;
    return sectionIndex.locale.en;
}
