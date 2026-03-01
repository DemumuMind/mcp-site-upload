import type { AdminDashboardSnapshot } from "@/lib/admin-dashboard";
import type { McpServer } from "@/lib/types";

export type AdminPageQueryState = {
  success?: string;
  error?: string;
  q?: string;
  category?: string;
  auth?: string;
  securityEvent?: string;
  securityEmail?: string;
  securityFrom?: string;
  securityTo?: string;
  securityFromTs?: string;
  securityToTs?: string;
  securityPage?: string;
  securityPageSize?: string;
  securitySortBy?: "created_at" | "event_type" | "email" | "ip_address";
  securitySortOrder?: "asc" | "desc";
};

export type AdminSecurityQuery = {
  eventType: string;
  emailQuery: string;
  fromDate: string;
  toDate: string;
  fromTs: string;
  toTs: string;
  page: number;
  pageSize: number;
  sortBy: "created_at" | "event_type" | "email" | "ip_address";
  sortOrder: "asc" | "desc";
};

export function buildRawSearchParams(queryState: AdminPageQueryState): URLSearchParams {
  const rawSearchParams = new URLSearchParams();
  Object.entries(queryState).forEach(([key, value]) => {
    if (typeof value === "string" && value.length > 0) rawSearchParams.set(key, value);
  });
  return rawSearchParams;
}

export function buildSecurityQuery(queryState: AdminPageQueryState): AdminSecurityQuery {
  return {
    eventType: queryState.securityEvent || "all",
    emailQuery: (queryState.securityEmail || "").trim(),
    fromDate: (queryState.securityFrom || "").trim(),
    toDate: (queryState.securityTo || "").trim(),
    fromTs: (queryState.securityFromTs || "").trim(),
    toTs: (queryState.securityToTs || "").trim(),
    page: Math.max(Number(queryState.securityPage || "1") || 1, 1),
    pageSize: Math.max(Number(queryState.securityPageSize || "50") || 50, 10),
    sortBy: queryState.securitySortBy || "created_at",
    sortOrder: queryState.securitySortOrder || "desc",
  };
}

export function buildAdminPageViewModel(input: {
  pendingServers: McpServer[];
  dashboardSnapshot: AdminDashboardSnapshot;
  security: AdminSecurityQuery;
  queryState: AdminPageQueryState;
}) {
  const { pendingServers, dashboardSnapshot, security, queryState } = input;
  const query = (queryState.q || "").trim();
  const selectedCategory = queryState.category || "all";
  const selectedAuth = queryState.auth || "all";
  const selectedSecurityEvent = security.eventType;
  const normalizedQuery = query.toLowerCase();

  const categoryOptions = Array.from(new Set(pendingServers.map(item => item.category))).sort((a, b) =>
    a.localeCompare(b),
  );
  const authOptions = Array.from(new Set(pendingServers.map(item => item.authType))).sort((a, b) =>
    a.localeCompare(b),
  );

  const filteredPendingServers = pendingServers.filter((server) => {
    const queryMatches =
      normalizedQuery.length === 0 ||
      server.name.toLowerCase().includes(normalizedQuery) ||
      server.slug.toLowerCase().includes(normalizedQuery) ||
      server.description.toLowerCase().includes(normalizedQuery) ||
      server.serverUrl.toLowerCase().includes(normalizedQuery);
    const categoryMatches = selectedCategory === "all" || server.category === selectedCategory;
    const authMatches = selectedAuth === "all" || server.authType === selectedAuth;
    return queryMatches && categoryMatches && authMatches;
  });

  const securityEventOptions = Array.from(
    new Set(dashboardSnapshot.security.recentEvents.map(item => item.eventType)),
  ).sort((a, b) => a.localeCompare(b));

  const stickyParams = new URLSearchParams();
  if (query) stickyParams.set("q", query);
  if (selectedCategory !== "all") stickyParams.set("category", selectedCategory);
  if (selectedAuth !== "all") stickyParams.set("auth", selectedAuth);
  if (selectedSecurityEvent !== "all") stickyParams.set("securityEvent", selectedSecurityEvent);
  if (security.emailQuery) stickyParams.set("securityEmail", security.emailQuery);
  if (security.fromDate) stickyParams.set("securityFrom", security.fromDate);
  if (security.toDate) stickyParams.set("securityTo", security.toDate);
  if (security.fromTs) stickyParams.set("securityFromTs", security.fromTs);
  if (security.toTs) stickyParams.set("securityToTs", security.toTs);
  if (security.sortBy !== "created_at") stickyParams.set("securitySortBy", security.sortBy);
  if (security.sortOrder !== "desc") stickyParams.set("securitySortOrder", security.sortOrder);
  if (security.pageSize !== 50) stickyParams.set("securityPageSize", String(security.pageSize));
  if (security.page !== 1) stickyParams.set("securityPage", String(security.page));

  const stickyQueryString = stickyParams.toString();
  const stickyAdminHref = `/admin${stickyQueryString ? `?${stickyQueryString}` : ""}`;

  return {
    pendingCount: pendingServers.length,
    filteredCount: filteredPendingServers.length,
    query,
    selectedCategory,
    selectedAuth,
    selectedSecurityEvent,
    categoryOptions,
    authOptions,
    filteredPendingServers,
    securityEventOptions,
    filteredSecurityEvents: dashboardSnapshot.security.recentEvents,
    stickyAdminHref,
  };
}
