import { Sparkles } from "lucide-react";
import { FeaturedArticleCardBase } from "@/components/blog/shared/featured-article-card-base";
import { formatBlogDate } from "@/lib/blog/date-format";
import type { BlogV2ListItem } from "@/lib/blog-v2/types";

type BlogFeaturedCardProps = {
  post: BlogV2ListItem;
};

export function BlogFeaturedCard({ post }: BlogFeaturedCardProps) {
  return (
    <FeaturedArticleCardBase
      badge={
        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-primary uppercase">
          <Sparkles className="size-3" />
          Featured article
        </span>
      }
      title={post.title}
      excerpt={post.excerpt}
      dateText={formatBlogDate(post.publishedAt)}
      readTimeText={`${post.readingTimeMinutes} min`}
      href={post.url}
      ctaText="Open article"
      classes={{
        card: "border-primary/30 bg-[linear-gradient(140deg,rgba(13,30,56,0.88),rgba(5,10,24,0.95))] shadow-[0_0_0_1px_rgba(35,72,110,0.35),0_24px_90px_rgba(2,8,24,0.7)]",
        header: "pb-3",
        title: "mt-4 text-2xl leading-tight text-foreground sm:text-3xl",
        content: "space-y-5 text-sm text-slate-200",
        excerpt: "max-w-4xl text-base leading-8 text-slate-200/95",
        meta: "flex flex-wrap items-center gap-3 text-xs tracking-[0.12em] text-slate-400 uppercase",
        button: "bg-primary text-primary-foreground hover:brightness-105",
      }}
    />
  );
}
