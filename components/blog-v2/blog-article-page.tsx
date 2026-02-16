import { ArrowLeft, ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import Link from "next/link";
import { BlogArticleMdx } from "@/components/blog-v2/blog-article-mdx";
import { BlogEngagementTracker } from "@/components/blog-v2/blog-engagement-tracker";
import { BlogReadingProgress } from "@/components/blog-v2/blog-reading-progress";
import { BlogTrackedLink } from "@/components/blog-v2/blog-tracked-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRelatedBlogV2Posts } from "@/lib/blog-v2/contentlayer";
import type { BlogV2Post } from "@/lib/blog-v2/types";

type BlogArticlePageProps = {
  post: BlogV2Post;
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export function BlogArticlePage({ post }: BlogArticlePageProps) {
  const related = getRelatedBlogV2Posts(post.slug, 3);
  const primaryTag = post.tags[0] ?? "general";

  return (
    <div className="relative overflow-hidden border-t border-slate-700/55">
      <BlogReadingProgress />
      <BlogEngagementTracker slug={post.slug} title={post.title} tags={post.tags} />

      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#040b17_0%,#050a15_45%,#03070f_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(circle_at_15%_0%,rgba(56,189,248,0.22),transparent_44%),radial-gradient(circle_at_85%_0%,rgba(99,102,241,0.18),transparent_40%)]" />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to blog
        </Link>

        <article className="rounded-3xl border border-slate-700/70 bg-slate-950/72 p-6 shadow-[0_0_0_1px_rgba(35,52,95,0.25),0_30px_90px_rgba(2,8,24,0.65)] sm:p-8">
          <header className="space-y-5 border-b border-slate-700/65 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              {post.topics.map((topic) => (
                <Badge key={topic.slug} variant="outline" className="border-primary/35 bg-primary/10 text-primary">
                  {topic.name}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl">{post.title}</h1>
            <p className="max-w-4xl text-base leading-8 text-slate-200/92">{post.excerpt}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs tracking-[0.12em] text-slate-400 uppercase">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {formatDate(post.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5" />
                {post.readingTimeMinutes} min read
              </span>
              {post.updatedAt ? <span>Updated: {formatDate(post.updatedAt)}</span> : null}
            </div>
          </header>

          <div className="mt-8 space-y-6">
            <BlogArticleMdx code={post.bodyCode} />
          </div>
        </article>

        {related.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Related reading</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <Card key={item.slug} className="border-slate-700/70 bg-slate-950/70">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg leading-tight text-foreground">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-300">
                    <p className="line-clamp-3">{item.excerpt}</p>
                    <BlogTrackedLink
                      href={item.url}
                      eventName="blog_related_click"
                      payload={{
                        from_slug: post.slug,
                        from_topic: primaryTag,
                        to_slug: item.slug,
                      }}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:text-cyan-50"
                    >
                      Read article
                      <ArrowRight className="size-4" />
                    </BlogTrackedLink>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-primary/30 bg-[linear-gradient(120deg,rgba(9,30,52,0.75),rgba(4,10,20,0.95))] p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Continue the conversation</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
            Bring your production lessons and open questions to our weekly editorial queue.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <BlogTrackedLink
              href="/contact"
              eventName="blog_cta_click"
              payload={{ location: "article_bottom", action: "contact_editorial_team", slug: post.slug }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Contact editorial team
            </BlogTrackedLink>
            <BlogTrackedLink
              href="/discord"
              eventName="blog_cta_click"
              payload={{ location: "article_bottom", action: "discuss_in_discord", slug: post.slug }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-500/65 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-900"
            >
              Discuss in Discord
            </BlogTrackedLink>
          </div>
        </section>
      </div>
    </div>
  );
}

