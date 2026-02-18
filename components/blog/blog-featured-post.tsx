import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FeaturedArticleCardBase } from "@/components/blog/shared/featured-article-card-base";
import { formatBlogDate } from "@/lib/blog/date-format";
import { tr, type Locale } from "@/lib/i18n";
import { getBlogTagBySlug } from "@/lib/blog/service";
import type { BlogPost } from "@/lib/blog/types";

type BlogFeaturedPostProps = {
  post: BlogPost;
  locale: Locale;
};

export async function BlogFeaturedPost({ post, locale }: BlogFeaturedPostProps) {
  const localized = post.locale[locale];
  const tags = await Promise.all(
    post.tags.map(async (tagSlug) => ({
      tagSlug,
      tag: await getBlogTagBySlug(tagSlug),
    })),
  );

  return (
    <FeaturedArticleCardBase
      badge={
        <Badge className="w-fit border-violet-300/40 bg-primary0/15 text-foreground">
          <Sparkles className="size-3" />
          {tr(locale, "Featured article", "Featured article")}
        </Badge>
      }
      title={localized.title}
      excerpt={
        <>
          {localized.excerpt}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {tags.map(({ tagSlug, tag }) => (
              <Badge key={tagSlug} variant="outline" className="border-violet-300/40 bg-primary0/15 text-foreground">
                {tag ? tag.label[locale] : tagSlug}
              </Badge>
            ))}
          </div>
        </>
      }
      dateText={formatBlogDate(post.publishedAt)}
      readTimeText={`${post.readTimeMinutes} ${tr(locale, "min", "min")}`}
      href={`/blog/${post.slug}`}
      ctaText={tr(locale, "Open article", "Open article")}
      classes={{
        card: "border-primary/30 bg-[linear-gradient(130deg,rgba(53,30,96,0.45),rgba(10,18,35,0.85))]",
        header: "pb-2",
        title: "mt-3 text-2xl text-foreground sm:text-3xl",
        content: "space-y-4 text-sm text-muted-foreground",
        excerpt: "",
        meta: "flex flex-wrap items-center gap-3 text-xs tracking-[0.1em] text-muted-foreground uppercase",
        button: "bg-blue-500 hover:bg-blue-400",
      }}
    />
  );
}
