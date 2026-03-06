import { Badge } from "@/components/ui/badge";
import { ArticleCardBase } from "@/components/blog/shared/article-card-base";
import { formatBlogDate } from "@/lib/blog/date-format";
import type { BlogV2ListItem } from "@/lib/blog-v2/types";

type BlogArticleCardProps = { post: BlogV2ListItem; };

export function BlogArticleCard({ post }: BlogArticleCardProps) {
  return (
    <ArticleCardBase
      title={post.title}
      excerpt={post.excerpt}
      dateText={formatBlogDate(post.publishedAt)}
      readTimeText={`${post.readingTimeMinutes} min`}
      href={post.url}
      ctaText="Read article"
      tags={<div className="flex flex-wrap gap-2">{post.topics.map((topic) => <Badge key={topic.slug} variant="outline" className="border-primary/35 bg-primary/10 text-primary">{topic.name}</Badge>)}</div>}
      classes={{
        card: "group h-full border-border/60 bg-background/72 backdrop-blur-sm hover:bg-background/82 transition-colors",
        header: "space-y-3 border-b border-border/60 pb-4",
        title: "text-xl leading-tight text-foreground",
        content: "flex h-full flex-col gap-4 pt-4 text-sm text-muted-foreground",
        excerpt: "text-base leading-7 text-foreground/88",
        meta: "mt-auto flex flex-wrap items-center gap-3 text-xs tracking-[0.12em] text-muted-foreground uppercase",
        link: "inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition group-hover:translate-x-0.5 hover:text-primary",
      }}
    />
  );
}
