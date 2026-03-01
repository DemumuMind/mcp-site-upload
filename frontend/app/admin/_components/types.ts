import type { AdminDashboardSnapshot } from "@/lib/admin-dashboard";
import type { Locale } from "@/lib/i18n";
import type { McpServer } from "@/lib/types";

export type AdminPageSectionsProps = {
  locale: Locale;
  dashboardSnapshot: AdminDashboardSnapshot;
  pendingCount: number;
  filteredCount: number;
  query: string;
  selectedCategory: string;
  selectedAuth: string;
  selectedSecurityEvent: string;
  categoryOptions: string[];
  authOptions: string[];
  filteredPendingServers: McpServer[];
  securityEventOptions: string[];
  filteredSecurityEvents: AdminDashboardSnapshot["security"]["recentEvents"];
  stickyAdminHref: string;
  securityFilterEmail: string;
  securityFilterFrom: string;
  securityFilterTo: string;
  securityFilterFromTs: string;
  securityFilterToTs: string;
  securityPageSize: number;
  securitySortBy: "created_at" | "event_type" | "email" | "ip_address";
  securitySortOrder: "asc" | "desc";
};
