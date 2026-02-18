import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ArticleCardBaseClasses = {
  card?: string;
  header?: string;
  title?: string;
  content?: string;
  excerpt?: string;
  meta?: string;
  link?: string;
};

type ArticleCardBaseProps = {
  title: string;
  excerpt: ReactNode;
  dateText: string;
  readTimeText: string;
  href: string;
  ctaText: string;
  tags?: ReactNode;
  classes?: ArticleCardBaseClasses;
};

export function ArticleCardBase({ title, excerpt, dateText, readTimeText, href, ctaText, tags, classes }: ArticleCardBaseProps) {
  return (
    <Card data-anime-hover="card" className={classes?.card}>
      <CardHeader className={classes?.header}>
        {tags}
        <CardTitle className={classes?.title}>{title}</CardTitle>
      </CardHeader>
      <CardContent className={classes?.content}>
        <p className={classes?.excerpt}>{excerpt}</p>

        <div className={classes?.meta}>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {dateText}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5" />
            {readTimeText}
          </span>
        </div>

        <Link href={href} className={classes?.link}>
          {ctaText}
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
