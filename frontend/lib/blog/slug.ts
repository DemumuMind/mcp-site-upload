function normalizeWhitespace(value: string): string {
    return value.replace(/\s+/g, " ").trim();
}
const trailingTimestampSuffixPattern = /-\d{9,13}$/;
export function normalizeBlogSlug(value: string): string {
    const normalized = normalizeWhitespace(value)
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    return normalized;
}
export function normalizeBlogSeriesSlug(value: string): string {
    const normalized = normalizeBlogSlug(value);
    return normalized.replace(trailingTimestampSuffixPattern, "");
}
export function toTitleFromSlug(slug: string): string {
    return slug
        .split(/[-_]/g)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}
export function normalizeSlugList(values: string[]): string[] {
    const dedupe = new Set<string>();
    const normalized = values
        .map((value) => normalizeBlogSlug(value))
        .filter(Boolean)
        .filter((value) => {
        if (dedupe.has(value)) {
            return false;
        }
        dedupe.add(value);
        return true;
    });
    return normalized;
}
