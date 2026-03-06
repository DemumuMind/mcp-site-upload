import { CalendarDays, FileCheck2, FolderGit2 } from "lucide-react";
import Link from "next/link";
import { formatDate, getAuthLabel, getStatusClass, getStatusLabel, type AccountSubmissionRow } from "@/app/account/account-view-model";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr, type Locale } from "@/lib/i18n";

type AccountSubmissionsCardProps = { locale: Locale; submissions: AccountSubmissionRow[]; hasSubmissionError: boolean; };

export function AccountSubmissionsCard({ locale, submissions, hasSubmissionError }: AccountSubmissionsCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-2 border-b border-border/60 pb-4">
        <CardTitle className="flex items-center gap-2 text-xl text-foreground"><FolderGit2 className="size-5 text-primary" />{tr(locale, "My submissions", "My submissions")}</CardTitle>
        <p className="text-sm leading-7 text-muted-foreground">{tr(locale, "Track your MCP servers and moderation status.", "Track your MCP servers and moderation status.")}</p>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        {hasSubmissionError ? <div className="border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{tr(locale, "Could not load your submissions right now.", "Could not load your submissions right now.")}</div> : null}
        {!hasSubmissionError && submissions.length === 0 ? <div className="border border-dashed border-border/70 px-4 py-3 text-sm text-muted-foreground">{tr(locale, 'No submissions yet. Use "Submit Your Server" to send your first MCP server for moderation.', 'No submissions yet. Use "Submit Your Server" to send your first MCP server for moderation.')}</div> : null}
        <div className="editorial-list border border-border/60">
          {submissions.map((submission) => {
            const hasPublicPage = Boolean(submission.slug) && submission.status !== "pending" && submission.status !== "rejected";
            return (
              <article key={submission.id} className="px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{submission.name ?? tr(locale, "Untitled server", "Untitled server")}</h3>
                  <Badge className={getStatusClass(submission.status)}><FileCheck2 className="size-3" />{getStatusLabel(locale, submission.status)}</Badge>
                  <Badge variant="secondary">{getAuthLabel(locale, submission.auth_type)}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{submission.category ?? tr(locale, "Other", "Other")}</span>
                  <span>-</span>
                  {hasPublicPage && submission.slug ? <Link href={`/server/${submission.slug}`} className="font-medium text-primary transition hover:text-primary/80">/server/{submission.slug}</Link> : <span>{submission.slug ?? "-"}</span>}
                  <span>-</span>
                  <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />{formatDate(submission.created_at, locale)}</span>
                </div>
              </article>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
