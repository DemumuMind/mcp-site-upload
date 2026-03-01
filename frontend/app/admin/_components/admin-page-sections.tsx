import { AuditSection } from "@/app/admin/_components/audit-section";
import { ModerationQueueSection } from "@/app/admin/_components/moderation-queue-section";
import { OverviewMultiAgentSections } from "@/app/admin/_components/overview-multi-agent-sections";
import { SecurityEventsSection } from "@/app/admin/_components/security-events-section";
import { SettingsEventsSections } from "@/app/admin/_components/settings-events-sections";
import type { AdminPageSectionsProps } from "@/app/admin/_components/types";

export function AdminPageSections(props: AdminPageSectionsProps) {
  return (
    <>
      <OverviewMultiAgentSections locale={props.locale} dashboardSnapshot={props.dashboardSnapshot} />
      <ModerationQueueSection
        locale={props.locale}
        pendingCount={props.pendingCount}
        filteredCount={props.filteredCount}
        query={props.query}
        selectedCategory={props.selectedCategory}
        selectedAuth={props.selectedAuth}
        categoryOptions={props.categoryOptions}
        authOptions={props.authOptions}
        filteredPendingServers={props.filteredPendingServers}
        stickyAdminHref={props.stickyAdminHref}
      />
      <SecurityEventsSection
        locale={props.locale}
        dashboardSnapshot={props.dashboardSnapshot}
        selectedSecurityEvent={props.selectedSecurityEvent}
        securityEventOptions={props.securityEventOptions}
        securityFilterEmail={props.securityFilterEmail}
        securityFilterFrom={props.securityFilterFrom}
        securityFilterTo={props.securityFilterTo}
        securityFilterFromTs={props.securityFilterFromTs}
        securityFilterToTs={props.securityFilterToTs}
        securityPageSize={props.securityPageSize}
        securitySortBy={props.securitySortBy}
        securitySortOrder={props.securitySortOrder}
        filteredSecurityEvents={props.filteredSecurityEvents}
      />
      <AuditSection locale={props.locale} dashboardSnapshot={props.dashboardSnapshot} />
      <SettingsEventsSections
        locale={props.locale}
        dashboardSnapshot={props.dashboardSnapshot}
        stickyAdminHref={props.stickyAdminHref}
      />
    </>
  );
}
