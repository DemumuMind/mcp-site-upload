import { Sparkles } from "lucide-react";
import { FeaturedArticleCardBase } from "@/components/blog/shared/featured-article-card-base";
import { formatBlogDate } from "@/lib/blog/date-format";
import type { BlogV2ListItem } from "@/lib/blog-v2/types";

type BlogFeaturedCardProps = { post: BlogV2ListItem; };

export function BlogFeaturedCard({ post }: BlogFeaturedCardProps) {
  return (
    <FeaturedArticleCardBase
      badge={<span className="inline-flex w-fit items-center gap-1 border border-primary/35 bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase"><Sparkles className="size-3" />Featured article</span>}
      title={post.title}
      excerpt={post.excerpt}
      dateText={formatBlogDate(post.publishedAt)}
      readTimeText={`${post.readingTimeMinutes} min`}
      href={post.url}
      ctaText="Open article"
      classes={{
        card: "border-border/60 bg-background/76 backdrop-blur-sm",
        header: "border-b border-border/60 pb-4",
        title: "mt-4 text-2xl leading-tight text-foreground sm:text-3xl",
        content: "space-y-5 pt-5 text-sm text-muted-foreground",
        excerpt: "max-w-4xl text-base leading-8 text-foreground/92",
        meta: "flex flex-wrap items-center gap-3 text-xs tracking-[0.12em] text-muted-foreground uppercase",
        button: "px-6",
      }}
    />
  );
}
