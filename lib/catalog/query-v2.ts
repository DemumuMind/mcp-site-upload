import type { AuthType, HealthStatus, VerificationLevel, } from "@/lib/types";
import type { CatalogQueryV2, CatalogSortDirection, CatalogSortField, CatalogViewMode, } from "@/lib/catalog/types";
type QueryParamsReader = Pick<URLSearchParams, "get" | "getAll">;
export const catalogPageSizeOptions = [12, 24, 48] as const;
const defaultSortBy: CatalogSortField = "rating";
const defaultSortDir: CatalogSortDirection = "desc";
const defaultLayout: CatalogViewMode = "grid";
const defaultPage = 1;
const defaultPageSize = 12;
const authTypeOrder: AuthType[] = ["none", "oauth", "api_key"];
const verificationOrder: VerificationLevel[] = ["community", "partner", "official"];
const healthOrder: HealthStatus[] = ["unknown", "healthy", "degraded", "down"];
const sortByValues: CatalogSortField[] = ["rating", "name", "tools", "updated"];
const sortDirValues: CatalogSortDirection[] = ["asc", "desc"];
const layoutValues: CatalogViewMode[] = ["grid", "list"];
function parsePositiveInt(value: string | null | undefined, fallback: number): number {
    if (!value) {
        return fallback;
    }
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
        return fallback;
    }
    return parsed;
}
function parseToolsBound(value: string | null | undefined): number | null {
    if (!value || value.trim().length === 0) {
        return null;
    }
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
        return null;
    }
    return Math.max(0, parsed);
}
function getOrderIndex<T extends string>(values: readonly T[], value: T): number {
    const index = values.indexOf(value);
    return index < 0 ? Number.MAX_SAFE_INTEGER : index;
}
function parseArrayParam(params: QueryParamsReader, key: string): string[] {
    return params
        .getAll(key)
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter((value) => value.length > 0);
}
function uniqueSorted(values: string[]): string[] {
    return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right));
}
function parseAuthTypes(values: string[]): AuthType[] {
    return Array.from(new Set(values.filter((value): value is AuthType => value === "none" || value === "oauth" || value === "api_key"))).sort((left, right) => getOrderIndex(authTypeOrder, left) - getOrderIndex(authTypeOrder, right));
}
function parseVerificationLevels(values: string[]): VerificationLevel[] {
    return Array.from(new Set(values.filter((value): value is VerificationLevel => value === "community" || value === "partner" || value === "official"))).sort((left, right) => getOrderIndex(verificationOrder, left) - getOrderIndex(verificationOrder, right));
}
function parseHealthStatuses(values: string[]): HealthStatus[] {
    return Array.from(new Set(values.filter((value): value is HealthStatus => value === "unknown" ||
        value === "healthy" ||
        value === "degraded" ||
        value === "down"))).sort((left, right) => getOrderIndex(healthOrder, left) - getOrderIndex(healthOrder, right));
}
function parseSortBy(value: string | null | undefined): CatalogSortField {
    if (value && sortByValues.includes(value as CatalogSortField)) {
        return value as CatalogSortField;
    }
    return defaultSortBy;
}
function parseSortDir(value: string | null | undefined): CatalogSortDirection {
    if (value && sortDirValues.includes(value as CatalogSortDirection)) {
        return value as CatalogSortDirection;
    }
    return defaultSortDir;
}
function parseLayout(value: string | null | undefined): CatalogViewMode {
    if (value && layoutValues.includes(value as CatalogViewMode)) {
        return value as CatalogViewMode;
    }
    return defaultLayout;
}
function parsePageSize(value: string | null | undefined): number {
    const parsed = parsePositiveInt(value, defaultPageSize);
    if (catalogPageSizeOptions.includes(parsed as (typeof catalogPageSizeOptions)[number])) {
        return parsed;
    }
    return defaultPageSize;
}
export function normalizeCatalogQueryV2(value: Partial<CatalogQueryV2>): CatalogQueryV2 {
    const page = Number.isFinite(value.page) ? Math.max(1, value.page ?? defaultPage) : defaultPage;
    const pageSize = catalogPageSizeOptions.includes((value.pageSize ?? defaultPageSize) as (typeof catalogPageSizeOptions)[number])
        ? (value.pageSize as (typeof catalogPageSizeOptions)[number])
        : defaultPageSize;
    const query = (value.query ?? "").trim();
    const categories = uniqueSorted(value.categories ?? []);
    const pricing = parseAuthTypes(value.pricing ?? []);
    const tags = uniqueSorted(value.tags ?? []);
    const verification = parseVerificationLevels(value.verification ?? []);
    const health = parseHealthStatuses(value.health ?? []);
    let toolsMin = typeof value.toolsMin === "number" && Number.isFinite(value.toolsMin)
        ? Math.max(0, Math.trunc(value.toolsMin))
        : null;
    let toolsMax = typeof value.toolsMax === "number" && Number.isFinite(value.toolsMax)
        ? Math.max(0, Math.trunc(value.toolsMax))
        : null;
    if (toolsMin !== null && toolsMax !== null && toolsMin > toolsMax) {
        [toolsMin, toolsMax] = [toolsMax, toolsMin];
    }
    return {
        page,
        pageSize,
        query,
        categories,
        pricing,
        tags,
        verification,
        health,
        toolsMin,
        toolsMax,
        sortBy: parseSortBy(value.sortBy),
        sortDir: parseSortDir(value.sortDir),
        layout: parseLayout(value.layout),
    };
}
export function parseCatalogQueryV2(params: QueryParamsReader): CatalogQueryV2 {
    return normalizeCatalogQueryV2({
        page: parsePositiveInt(params.get("page"), defaultPage),
        pageSize: parsePageSize(params.get("pageSize")),
        query: params.get("query") ?? "",
        categories: parseArrayParam(params, "category"),
        pricing: parseAuthTypes(parseArrayParam(params, "pricing")),
        tags: parseArrayParam(params, "tag"),
        verification: parseVerificationLevels(parseArrayParam(params, "verification")),
        health: parseHealthStatuses(parseArrayParam(params, "health")),
        toolsMin: parseToolsBound(params.get("toolsMin")),
        toolsMax: parseToolsBound(params.get("toolsMax")),
        sortBy: parseSortBy(params.get("sortBy")),
        sortDir: parseSortDir(params.get("sortDir")),
        layout: parseLayout(params.get("layout")),
    });
}
export function buildCatalogQueryV2SearchParams(value: CatalogQueryV2): URLSearchParams {
    const query = normalizeCatalogQueryV2(value);
    const params = new URLSearchParams();
    if (query.page > defaultPage) {
        params.set("page", String(query.page));
    }
    if (query.pageSize !== defaultPageSize) {
        params.set("pageSize", String(query.pageSize));
    }
    if (query.query.length > 0) {
        params.set("query", query.query);
    }
    query.categories.forEach((category) => {
        params.append("category", category);
    });
    query.pricing.forEach((pricing) => {
        params.append("pricing", pricing);
    });
    query.tags.forEach((tag) => {
        params.append("tag", tag);
    });
    query.verification.forEach((verification) => {
        params.append("verification", verification);
    });
    query.health.forEach((health) => {
        params.append("health", health);
    });
    if (query.toolsMin !== null) {
        params.set("toolsMin", String(query.toolsMin));
    }
    if (query.toolsMax !== null) {
        params.set("toolsMax", String(query.toolsMax));
    }
    if (query.sortBy !== defaultSortBy) {
        params.set("sortBy", query.sortBy);
    }
    if (query.sortDir !== defaultSortDir) {
        params.set("sortDir", query.sortDir);
    }
    if (query.layout !== defaultLayout) {
        params.set("layout", query.layout);
    }
    return params;
}
export function serializeCatalogQueryV2(value: CatalogQueryV2): string {
    return buildCatalogQueryV2SearchParams(value).toString();
}
export function areCatalogQueriesEqual(left: CatalogQueryV2, right: CatalogQueryV2): boolean {
    return serializeCatalogQueryV2(left) === serializeCatalogQueryV2(right);
}
