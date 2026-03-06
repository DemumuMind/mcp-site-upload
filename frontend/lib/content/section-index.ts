import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { readProcessMemoryCache } from "@/lib/cache/memory";
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
function resolveContentRoot(): string {
    const cwd = process.cwd();
    const direct = path.join(cwd, "content");
    if (fs.existsSync(direct)) {
        return direct;
    }
    return path.join(cwd, "frontend", "content");
}
const contentRoot = resolveContentRoot();
function getSectionIndexFilePath(sectionKey: string): string {
    return path.join(contentRoot, sectionKey, "_index.json");
}
export function getSectionIndex(sectionKey: string): SectionIndex | null {
    const filePath = getSectionIndexFilePath(sectionKey);
    return readProcessMemoryCache("sectionIndex", `content:section-index:${sectionKey}`, () => {
        if (!fs.existsSync(filePath)) {
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
        return parsed.data;
    });
}
export function getSectionLocaleCopy(sectionIndex: SectionIndex | null, locale: Locale): SectionLocaleCopy | null {
    if (!sectionIndex) {
        return null;
    }
    void locale;
    return sectionIndex.locale.en;
}
