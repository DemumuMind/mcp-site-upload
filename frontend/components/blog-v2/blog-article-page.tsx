import { ArrowLeft, ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import Link from "next/link";
import { BlogArticleMdx } from "@/components/blog-v2/blog-article-mdx";
import { BlogEngagementTracker } from "@/components/blog-v2/blog-engagement-tracker";
import { BlogReadingProgress } from "@/components/blog-v2/blog-reading-progress";
import { BlogTrackedLink } from "@/components/blog-v2/blog-tracked-link";
import { Badge } from "@/components/ui/badge";
import { formatBlogDate } from "@/lib/blog/date-format";
import { getRelatedBlogV2Posts } from "@/lib/blog-v2/contentlayer";
import type { BlogV2ListItem, BlogV2Post } from "@/lib/blog-v2/types";

type BlogArticlePageProps = {
  post: BlogV2Post;
  relatedPosts?: BlogV2ListItem[];
};

export function BlogArticlePage({ post, relatedPosts }: BlogArticlePageProps) {
  const related = relatedPosts ?? getRelatedBlogV2Posts(post.slug, 3);
  const primaryTag = post.tags[0] ?? "general";

  return (
    <main className="bg-background text-foreground">
      <BlogReadingProgress />
      <BlogEngagementTracker slug={post.slug} title={post.title} tags={post.tags} />

      <section className="relative isolate overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_24%),radial-gradient(circle_at_84%_14%,hsl(var(--accent)/0.16),transparent_18%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_72%)]" />
        <div className="section-shell py-10 sm:py-14 lg:py-18">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to blog
          </Link>

          <div className="mt-8 max-w-4xl">
            <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">DemumuMind Journal</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {post.topics.map((topic) => (
                <Badge key={topic.slug} variant="outline" className="rounded-none border-border/80 bg-transparent text-foreground">
                  {topic.name}
                </Badge>
              ))}
            </div>
            <h1 className="mt-5 text-balance font-serif text-[clamp(2.8rem,8vw,5.8rem)] leading-[0.95] tracking-[-0.05em] text-foreground">
              {post.title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">{post.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs tracking-[0.14em] text-muted-foreground uppercase">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {formatBlogDate(post.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5" />
                {post.readingTimeMinutes} min read
              </span>
              {post.updatedAt ? <span>Updated {formatBlogDate(post.updatedAt)}</span> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/60">
        <div className="section-shell py-10 sm:py-14">
          <article className="mx-auto max-w-3xl">
            {post.bodyCode.trim().length > 0 ? (
              <BlogArticleMdx code={post.bodyCode} />
            ) : post.bodyBlocks && post.bodyBlocks.length > 0 ? (
              <div className="space-y-8">
                {post.bodyBlocks.map((block) => (
                  <section key={block.heading} className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">{block.heading}</h2>
                    {block.paragraphs.map((paragraph, index) => (
                      <p key={`${block.heading}-p-${index}`} className="text-base leading-8 text-foreground/90">
                        {paragraph}
                      </p>
                    ))}
                    {block.bullets && block.bullets.length > 0 ? (
                      <ul className="list-disc space-y-2 pl-6 text-base leading-8 text-foreground/90">
                        {block.bullets.map((bullet, index) => (
                          <li key={`${block.heading}-b-${index}`}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
              </div>
            ) : (
              <p className="text-base leading-8 text-foreground/90">{post.excerpt}</p>
            )}
          </article>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="border-b border-border/60">
          <div className="section-shell py-10 sm:py-14">
            <div className="mb-6 max-w-2xl">
              <p className="text-[11px] tracking-[0.22em] text-primary uppercase">Related reading</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">Continue from this thread.</h2>
            </div>
            <div className="grid gap-px border border-border/60 bg-border/60 md:grid-cols-3">
              {related.map((item) => (
                <article key={item.slug} className="bg-background px-5 py-6 sm:px-6">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">{item.title}</h3>
                  <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{item.excerpt}</p>
                  <BlogTrackedLink
                    href={item.url}
                    eventName="blog_related_click"
                    payload={{
                      from_slug: post.slug,
                      from_topic: primaryTag,
                      to_slug: item.slug,
                    }}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:text-primary"
                  >
                    Read article
                    <ArrowRight className="size-4" />
                  </BlogTrackedLink>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section>
        <div className="section-shell py-12 sm:py-16">
          <div className="border border-border/60 px-6 py-8 sm:px-8 sm:py-10">
            <p className="text-[11px] tracking-[0.22em] text-primary uppercase">Continue the conversation</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              Bring your production lessons and open questions to the editorial queue.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              We use reader questions to shape the next round of field notes, evaluations, and implementation breakdowns.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <BlogTrackedLink
                href="/contact"
                eventName="blog_cta_click"
                payload={{ location: "article_bottom", action: "contact_editorial_team", slug: post.slug }}
                className="inline-flex h-11 items-center justify-center gap-2 border border-primary bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-105"
              >
                Contact editorial team
              </BlogTrackedLink>
              <BlogTrackedLink
                href="/discord"
                eventName="blog_cta_click"
                payload={{ location: "article_bottom", action: "discuss_in_discord", slug: post.slug }}
                className="inline-flex h-11 items-center justify-center gap-2 border border-border/80 px-6 text-sm font-semibold text-foreground transition hover:bg-accent"
              >
                Discuss in Discord
              </BlogTrackedLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
