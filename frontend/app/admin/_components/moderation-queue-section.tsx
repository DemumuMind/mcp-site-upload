import Link from "next/link";
import { moderateServerStatusAction } from "@/app/admin/actions";
import { PageSection } from "@/components/page-templates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { tr } from "@/lib/i18n";
import type { AdminPageSectionsProps } from "@/app/admin/_components/types";
import { formatQueuedAt, getAuthTypeLabel } from "@/app/admin/_components/utils";

type Props = Pick<AdminPageSectionsProps, "locale" | "pendingCount" | "filteredCount" | "query" | "selectedCategory" | "selectedAuth" | "categoryOptions" | "authOptions" | "filteredPendingServers" | "stickyAdminHref">;

export function ModerationQueueSection({ locale, pendingCount, filteredCount, query, selectedCategory, selectedAuth, categoryOptions, authOptions, filteredPendingServers, stickyAdminHref }: Props) {
  return (
    <PageSection>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold text-foreground">{tr(locale, "Moderation queue", "Moderation queue")}</h2><div className="flex flex-wrap gap-2 text-xs"><Badge variant="secondary">{tr(locale, "Total", "Total")}: {pendingCount}</Badge><Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">{tr(locale, "Showing", "Showing")}: {filteredCount}</Badge></div></div>
        <form method="get" className="grid gap-3 border border-border/60 p-3 lg:grid-cols-[minmax(0,1fr)_220px_200px_auto]">
          <Input name="q" defaultValue={query} placeholder={tr(locale, "Search by name, slug, description, or URL", "Search by name, slug, description, or URL")} />
          <select name="category" defaultValue={selectedCategory} className="h-11 border border-border/70 bg-background/80 px-3 text-sm text-foreground rounded-none">
            <option value="all">{tr(locale, "All categories", "All categories")}</option>{categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <select name="auth" defaultValue={selectedAuth} className="h-11 border border-border/70 bg-background/80 px-3 text-sm text-foreground rounded-none">
            <option value="all">{tr(locale, "All auth types", "All auth types")}</option>{authOptions.map((authType) => <option key={authType} value={authType}>{getAuthTypeLabel(locale, authType)}</option>)}
          </select>
          <div className="flex items-center gap-2"><Button type="submit" variant="outline">{tr(locale, "Apply", "Apply")}</Button><Button asChild variant="ghost"><Link href="/admin">{tr(locale, "Reset", "Reset")}</Link></Button></div>
        </form>
        {filteredPendingServers.length === 0 ? (
          <div className="border border-dashed border-border/70 px-4 py-4 text-sm text-muted-foreground">{tr(locale, "Try changing search text or filters.", "Try changing search text or filters.")}</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">{filteredPendingServers.map((mcpServer) => <article key={mcpServer.id} className="border border-border/60 bg-background/72 p-5 backdrop-blur-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="text-base font-semibold text-foreground">{mcpServer.name}</h3><p className="mt-1 font-mono text-xs text-muted-foreground">/{mcpServer.slug}</p></div><p className="shrink-0 text-xs text-muted-foreground">{tr(locale, "Queued", "Queued")}: {formatQueuedAt(locale, mcpServer.createdAt)}</p></div><div className="mt-3 flex flex-wrap gap-2"><Badge className="bg-primary/10 text-primary">{mcpServer.category}</Badge><Badge variant="secondary">{getAuthTypeLabel(locale, mcpServer.authType)}</Badge></div><p className="mt-4 text-sm leading-7 text-foreground/88">{mcpServer.description}</p><p className="mt-2 truncate text-xs text-muted-foreground">{mcpServer.serverUrl}</p><div className="mt-5 flex gap-2"><form action={moderateServerStatusAction} className="w-full"><input type="hidden" name="returnTo" value={stickyAdminHref} /><input type="hidden" name="serverId" value={mcpServer.id} /><input type="hidden" name="status" value="active" /><Button type="submit" className="w-full">{tr(locale, "Approve", "Approve")}</Button></form><form action={moderateServerStatusAction} className="w-full"><input type="hidden" name="returnTo" value={stickyAdminHref} /><input type="hidden" name="serverId" value={mcpServer.id} /><input type="hidden" name="status" value="rejected" /><Button type="submit" variant="outline" className="w-full">{tr(locale, "Reject", "Reject")}</Button></form></div></article>)}</div>
        )}
      </div>
    </PageSection>
  );
}
