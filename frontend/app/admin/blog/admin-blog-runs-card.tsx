import Link from "next/link";
import type { AdminBlogRunRecord, AdminBlogRunStatus } from "@/lib/admin-blog-runs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr, type Locale } from "@/lib/i18n";

type AdminBlogRunsCardProps = { locale: Locale; selectedStatus: AdminBlogRunStatus | undefined; recentRuns: AdminBlogRunRecord[]; };

export function AdminBlogRunsCard({ locale, selectedStatus, recentRuns }: AdminBlogRunsCardProps) {
  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4"><CardTitle className="text-foreground">{tr(locale, "Recent automation runs", "Recent automation runs")}</CardTitle><div className="flex flex-wrap gap-2 text-xs"><Button asChild variant={selectedStatus ? "outline" : "default"}><Link href="/admin/blog">{tr(locale, "All", "All")}</Link></Button><Button asChild variant={selectedStatus === "success" ? "default" : "outline"}><Link href="/admin/blog?status=success">success</Link></Button><Button asChild variant={selectedStatus === "failed" ? "default" : "outline"}><Link href="/admin/blog?status=failed">failed</Link></Button><Button asChild variant={selectedStatus === "started" ? "default" : "outline"}><Link href="/admin/blog?status=started">started</Link></Button></div></CardHeader>
      <CardContent className="pt-5">
        {recentRuns.length > 0 ? <div className="editorial-list border border-border/60">{recentRuns.map((run) => <div key={run.id} className="grid gap-2 px-4 py-3 text-xs md:grid-cols-[150px_90px_1fr_1fr]"><div className="font-mono text-muted-foreground">{new Date(run.createdAt).toLocaleString("en-US")}</div><div><span className={`inline-flex px-2 py-0.5 text-[11px] font-medium ${run.status === "success" ? "bg-primary/12 text-primary" : "bg-muted/40 text-muted-foreground"}`}>{run.status}</span></div><div className="min-w-0 truncate"><p className="truncate text-foreground">{run.topic}</p><p className="truncate text-muted-foreground">{run.slug ? `slug: ${run.slug}` : "slug: -"} - {run.actorSource}</p></div><div className="min-w-0 truncate text-muted-foreground">{run.errorMessage ? run.errorMessage : `packet: ${run.researchPacketId ?? "-"} - sources: ${run.sourceCount ?? "-"}`}</div></div>)}</div> : <p className="text-sm text-muted-foreground">{tr(locale, "No automation runs yet.", "No automation runs yet.")}</p>}
      </CardContent>
    </Card>
  );
}
