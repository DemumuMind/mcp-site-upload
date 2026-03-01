import Link from "next/link";
import { moderateServerStatusAction } from "@/app/admin/actions";
import { PageSection } from "@/components/page-templates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { tr } from "@/lib/i18n";
import type { AdminPageSectionsProps } from "@/app/admin/_components/types";
import { formatQueuedAt, getAuthTypeLabel } from "@/app/admin/_components/utils";

type Props = Pick<
  AdminPageSectionsProps,
  | "locale"
  | "pendingCount"
  | "filteredCount"
  | "query"
  | "selectedCategory"
  | "selectedAuth"
  | "categoryOptions"
  | "authOptions"
  | "filteredPendingServers"
  | "stickyAdminHref"
>;

export function ModerationQueueSection({
  locale,
  pendingCount,
  filteredCount,
  query,
  selectedCategory,
  selectedAuth,
  categoryOptions,
  authOptions,
  filteredPendingServers,
  stickyAdminHref,
}: Props) {
  return (
    <PageSection surface="mesh">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-foreground">
            {tr(locale, "Moderation queue", "Moderation queue")}
          </h2>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary" className="bg-muted/60 text-foreground">
              {tr(locale, "Total", "Total")}: {pendingCount}
            </Badge>
            <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
              {tr(locale, "Showing", "Showing")}: {filteredCount}
            </Badge>
          </div>
        </div>
        <form method="get" className="grid gap-3 rounded-lg border border-border bg-card p-3 lg:grid-cols-[minmax(0,1fr)_220px_200px_auto]">
          <Input name="q" defaultValue={query} placeholder={tr(locale, "Search by name, slug, description, or URL", "Search by name, slug, description, or URL")} className="border-border bg-background text-foreground" />
          <select name="category" defaultValue={selectedCategory} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">
            <option value="all">{tr(locale, "All categories", "All categories")}</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select name="auth" defaultValue={selectedAuth} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground">
            <option value="all">{tr(locale, "All auth types", "All auth types")}</option>
            {authOptions.map((authType) => (
              <option key={authType} value={authType}>{getAuthTypeLabel(locale, authType)}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <Button type="submit" variant="outline" className="border-border bg-card hover:bg-muted/60">
              {tr(locale, "Apply", "Apply")}
            </Button>
            <Button asChild variant="ghost" className="text-foreground hover:bg-muted">
              <Link href="/admin">{tr(locale, "Reset", "Reset")}</Link>
            </Button>
          </div>
        </form>
        {filteredPendingServers.length === 0 ? (
          <Card className="border-border bg-card">
            <CardHeader><CardTitle className="text-foreground">{tr(locale, "No results", "No results")}</CardTitle></CardHeader>
            <CardContent className="text-sm text-foreground">{tr(locale, "Try changing search text or filters.", "Try changing search text or filters.")}</CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredPendingServers.map((mcpServer) => (
              <Card key={mcpServer.id} className="border-border bg-card">
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base text-foreground">{mcpServer.name}</CardTitle>
                    <p className="shrink-0 text-xs text-muted-foreground">{tr(locale, "Queued", "Queued")}: {formatQueuedAt(locale, mcpServer.createdAt)}</p>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">/{mcpServer.slug}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-accent/20 text-accent-foreground">{mcpServer.category}</Badge>
                    <Badge variant="secondary" className="bg-muted/60 text-foreground">{getAuthTypeLabel(locale, mcpServer.authType)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-foreground">{mcpServer.description}</p>
                  <p className="truncate text-xs text-muted-foreground">{mcpServer.serverUrl}</p>
                  <div className="flex gap-2">
                    <form action={moderateServerStatusAction} className="w-full">
                      <input type="hidden" name="returnTo" value={stickyAdminHref} />
                      <input type="hidden" name="serverId" value={mcpServer.id} />
                      <input type="hidden" name="status" value="active" />
                      <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-accent">{tr(locale, "Approve", "Approve")}</Button>
                    </form>
                    <form action={moderateServerStatusAction} className="w-full">
                      <input type="hidden" name="returnTo" value={stickyAdminHref} />
                      <input type="hidden" name="serverId" value={mcpServer.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <Button type="submit" variant="outline" className="w-full border-border bg-muted/60 text-foreground hover:bg-muted/70">{tr(locale, "Reject", "Reject")}</Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageSection>
  );
}
