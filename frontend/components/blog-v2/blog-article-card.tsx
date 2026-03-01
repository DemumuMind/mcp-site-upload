import { Badge } from "@/components/ui/badge";
import { ArticleCardBase } from "@/components/blog/shared/article-card-base";
import { formatBlogDate } from "@/lib/blog/date-format";
import type { BlogV2ListItem } from "@/lib/blog-v2/types";

type BlogArticleCardProps = {
  post: BlogV2ListItem;
};

export function BlogArticleCard({ post }: BlogArticleCardProps) {
  return (
    <ArticleCardBase
      title={post.title}
      excerpt={post.excerpt}
      dateText={formatBlogDate(post.publishedAt)}
      readTimeText={`${post.readingTimeMinutes} min`}
      href={post.url}
      ctaText="Read article"
      tags={
        <div className="flex flex-wrap gap-2">
          {post.topics.map((topic) => (
            <Badge key={topic.slug} variant="outline" className="border-primary/35 bg-primary/10 text-primary">
              {topic.name}
            </Badge>
          ))}
        </div>
      }
      classes={{
        card: "group h-full border-slate-700/70 bg-slate-950/72 shadow-[0_0_0_1px_rgba(35,52,95,0.25),0_22px_64px_rgba(2,8,24,0.56)] transition duration-300 hover:-translate-y-0.5 hover:scale-[1.005] hover:border-primary/35",
        header: "space-y-3 pb-3",
        title: "text-xl leading-tight text-foreground",
        content: "flex h-full flex-col gap-4 text-sm text-slate-300",
        excerpt: "text-base leading-7 text-slate-200/90",
        meta: "mt-auto flex flex-wrap items-center gap-3 text-xs tracking-[0.12em] text-slate-400 uppercase",
        link: "inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition group-hover:translate-x-0.5 hover:text-primary",
      }}
    />
  );
}
