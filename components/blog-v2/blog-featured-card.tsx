import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlogV2ListItem } from "@/lib/blog-v2/types";

type BlogFeaturedCardProps = {
  post: BlogV2ListItem;
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export function BlogFeaturedCard({ post }: BlogFeaturedCardProps) {
  return (
    <Card className="border-primary/30 bg-[linear-gradient(140deg,rgba(13,30,56,0.88),rgba(5,10,24,0.95))] shadow-[0_0_0_1px_rgba(35,72,110,0.35),0_24px_90px_rgba(2,8,24,0.7)]">
      <CardHeader className="pb-3">
        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-cyan-400/40 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
          <Sparkles className="size-3" />
          Featured article
        </span>
        <CardTitle className="mt-4 text-2xl leading-tight text-foreground sm:text-3xl">{post.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-sm text-slate-200">
        <p className="max-w-4xl text-base leading-8 text-slate-200/95">{post.excerpt}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs tracking-[0.12em] text-slate-400 uppercase">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {formatDate(post.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5" />
            {post.readingTimeMinutes} min
          </span>
        </div>
        <Button asChild className="bg-primary text-slate-950 hover:bg-cyan-400">
          <Link href={post.url}>
            Open article
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

