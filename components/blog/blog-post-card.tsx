import { Badge } from "@/components/ui/badge";
import { ArticleCardBase } from "@/components/blog/shared/article-card-base";
import { formatBlogDate } from "@/lib/blog/date-format";
import { tr, type Locale } from "@/lib/i18n";
import { getBlogTagBySlug } from "@/lib/blog/service";
import type { BlogPost } from "@/lib/blog/types";

type BlogPostCardProps = {
  post: BlogPost;
  locale: Locale;
};

export async function BlogPostCard({ post, locale }: BlogPostCardProps) {
  const localized = post.locale[locale];
  const tags = await Promise.all(
    post.tags.map(async (tagSlug) => ({
      tagSlug,
      tag: await getBlogTagBySlug(tagSlug),
    })),
  );

  return (
    <ArticleCardBase
      title={localized.title}
      excerpt={localized.excerpt}
      dateText={formatBlogDate(post.publishedAt)}
      readTimeText={`${post.readTimeMinutes} ${tr(locale, "min", "min")}`}
      href={`/blog/${post.slug}`}
      ctaText={tr(locale, "Read article", "Read article")}
      tags={
        <div className="flex flex-wrap items-center gap-2">
          {tags.map(({ tagSlug, tag }) => (
            <Badge key={tagSlug} variant="outline" className="border-primary/30 bg-primary/10 text-primary">
              {tag ? tag.label[locale] : tagSlug}
            </Badge>
          ))}
        </div>
      }
      classes={{
        card: "border-blacksmith bg-card",
        header: "space-y-3 pb-2",
        title: "text-lg text-foreground",
        content: "space-y-4 text-sm text-muted-foreground",
        meta: "flex flex-wrap items-center gap-3 text-xs tracking-[0.1em] text-muted-foreground uppercase",
        link: "inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition hover:text-foreground",
      }}
    />
  );
}
