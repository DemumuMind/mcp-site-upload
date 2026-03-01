import Link from "next/link";
import type { AdminBlogRunRecord, AdminBlogRunStatus } from "@/lib/admin-blog-runs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr, type Locale } from "@/lib/i18n";

type AdminBlogRunsCardProps = {
  locale: Locale;
  selectedStatus: AdminBlogRunStatus | undefined;
  recentRuns: AdminBlogRunRecord[];
};

export function AdminBlogRunsCard({ locale, selectedStatus, recentRuns }: AdminBlogRunsCardProps) {
  return (
    <Card className="mt-4 border-border bg-card">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle className="text-foreground">{tr(locale, "Recent automation runs", "Recent automation runs")}</CardTitle>
        <div className="flex flex-wrap gap-2 text-xs">
          <Button
            asChild
            variant={selectedStatus ? "outline" : "default"}
            className={!selectedStatus ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
          >
            <Link href="/admin/blog">{tr(locale, "All", "All")}</Link>
          </Button>
          <Button
            asChild
            variant={selectedStatus === "success" ? "default" : "outline"}
            className={selectedStatus === "success" ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
          >
            <Link href="/admin/blog?status=success">success</Link>
          </Button>
          <Button
            asChild
            variant={selectedStatus === "failed" ? "default" : "outline"}
            className={selectedStatus === "failed" ? "bg-muted text-primary-foreground hover:bg-muted/90" : ""}
          >
            <Link href="/admin/blog?status=failed">failed</Link>
          </Button>
          <Button
            asChild
            variant={selectedStatus === "started" ? "default" : "outline"}
            className={selectedStatus === "started" ? "bg-muted text-primary-foreground hover:bg-muted/90" : ""}
          >
            <Link href="/admin/blog?status=started">started</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {recentRuns.length > 0 ? (
          recentRuns.map((run) => (
            <div
              key={run.id}
              className="grid gap-1 rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground md:grid-cols-[140px_100px_1fr_1fr]"
            >
              <div className="font-mono text-muted-foreground">{new Date(run.createdAt).toLocaleString("en-US")}</div>
              <div>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    run.status === "success"
                      ? "bg-accent/30 text-accent-foreground"
                      : run.status === "failed"
                        ? "bg-muted/70 text-muted-foreground"
                        : "bg-muted/70 text-muted-foreground"
                  }`}
                >
                  {run.status}
                </span>
              </div>
              <div className="min-w-0 truncate">
                <p className="truncate">{run.topic}</p>
                <p className="truncate text-muted-foreground">
                  {run.slug ? `slug: ${run.slug}` : "slug: -"} - {run.actorSource}
                </p>
              </div>
              <div className="min-w-0 truncate text-muted-foreground">
                {run.errorMessage
                  ? run.errorMessage
                  : `packet: ${run.researchPacketId ?? "-"} - sources: ${run.sourceCount ?? "-"}`}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{tr(locale, "No automation runs yet.", "No automation runs yet.")}</p>
        )}
      </CardContent>
    </Card>
  );
}


