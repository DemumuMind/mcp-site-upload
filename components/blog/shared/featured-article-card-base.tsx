import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FeaturedArticleCardBaseClasses = {
  card?: string;
  header?: string;
  title?: string;
  content?: string;
  excerpt?: string;
  meta?: string;
  button?: string;
};

type FeaturedArticleCardBaseProps = {
  badge: ReactNode;
  title: string;
  excerpt: ReactNode;
  dateText: string;
  readTimeText: string;
  href: string;
  ctaText: string;
  classes?: FeaturedArticleCardBaseClasses;
};

export function FeaturedArticleCardBase({
  badge,
  title,
  excerpt,
  dateText,
  readTimeText,
  href,
  ctaText,
  classes,
}: FeaturedArticleCardBaseProps) {
  return (
    <Card className={classes?.card}>
      <CardHeader className={classes?.header}>
        {badge}
        <CardTitle className={classes?.title}>{title}</CardTitle>
      </CardHeader>
      <CardContent className={classes?.content}>
        <div className={classes?.excerpt}>{excerpt}</div>

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

        <Button asChild className={classes?.button}>
          <Link href={href}>
            {ctaText}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
