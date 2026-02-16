import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BlogV2ListItem } from "@/lib/blog-v2/types";

type BlogArticleCardProps = {
  post: BlogV2ListItem;
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export function BlogArticleCard({ post }: BlogArticleCardProps) {
  return (
    <Card className="group h-full border-slate-700/70 bg-slate-950/72 shadow-[0_0_0_1px_rgba(35,52,95,0.25),0_22px_64px_rgba(2,8,24,0.56)] transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-primary/35">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-wrap gap-2">
          {post.topics.map((topic) => (
            <Badge key={topic.slug} variant="outline" className="border-primary/35 bg-primary/10 text-primary">
              {topic.name}
            </Badge>
          ))}
        </div>
        <CardTitle className="text-xl leading-tight text-foreground">{post.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex h-full flex-col gap-4 text-sm text-slate-300">
        <p className="text-base leading-7 text-slate-200/90">{post.excerpt}</p>
        <div className="mt-auto flex flex-wrap items-center gap-3 text-xs tracking-[0.12em] text-slate-400 uppercase">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {formatDate(post.publishedAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5" />
            {post.readingTimeMinutes} min
          </span>
        </div>

        <Link href={post.url} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition group-hover:translate-x-0.5 hover:text-primary">
          Read article
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

