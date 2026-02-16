import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { BlogArticleCard } from "@/components/blog-v2/blog-article-card";
import { BlogFeaturedCard } from "@/components/blog-v2/blog-featured-card";
import { BlogTrackedLink } from "@/components/blog-v2/blog-tracked-link";
import { BlogTopicFilter } from "@/components/blog-v2/blog-topic-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAllBlogV2ListItems,
  getBlogV2TagsWithCounts,
  getFeaturedBlogV2Post,
} from "@/lib/blog-v2/contentlayer";

type BlogListPageProps = {
  selectedTopic: string | null;
};

function normalizeTopic(topic: string | null): string | null {
  if (!topic) {
    return null;
  }
  const normalized = topic.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

export function BlogListPage({ selectedTopic }: BlogListPageProps) {
  const normalizedTopic = normalizeTopic(selectedTopic);
  const posts = getAllBlogV2ListItems();
  const topics = getBlogV2TagsWithCounts();
  const featured = getFeaturedBlogV2Post(normalizedTopic ?? undefined);

  const filtered = normalizedTopic
    ? posts.filter((post) => post.tags.some((tag) => tag.trim().toLowerCase() === normalizedTopic))
    : posts;

  const withoutFeatured = featured ? filtered.filter((post) => post.slug !== featured.slug) : filtered;
  const selectedTopicMeta = normalizedTopic
    ? topics.find((topic) => topic.slug.trim().toLowerCase() === normalizedTopic)
    : null;

  return (
    <div className="relative overflow-hidden border-t border-slate-700/55">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#040b17_0%,#050a15_45%,#03070f_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_14%_4%,rgba(56,189,248,0.24),transparent_42%),radial-gradient(circle_at_86%_4%,rgba(59,130,246,0.16),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(56,189,248,0.05)_1px,transparent_1px),linear-gradient(rgba(56,189,248,0.04)_1px,transparent_1px)] bg-[size:46px_46px] opacity-30" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <section className="rounded-3xl border border-slate-700/70 bg-[linear-gradient(145deg,rgba(10,18,33,0.92),rgba(6,12,24,0.9))] p-6 shadow-[0_0_0_1px_rgba(35,52,95,0.2),0_24px_90px_rgba(2,8,24,0.62)] sm:p-8">
          <span className="inline-flex rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-primary uppercase">
            Resources
          </span>
          <h1 className="mt-4 max-w-5xl text-4xl leading-[1.03] font-semibold tracking-tight text-foreground sm:text-6xl">
            BridgeMind Blog
          </h1>
          <p className="mt-4 max-w-4xl text-base leading-8 text-slate-200/92">
            Editorial playbooks, architecture narratives, and operational checklists for teams building agentic
            products in production.
          </p>
        </section>

        <BlogTopicFilter
          selectedTopic={normalizedTopic}
          topics={topics.map((topic) => ({
            slug: topic.slug,
            name: topic.name,
            count: topic.count,
          }))}
        />

        {selectedTopicMeta ? (
          <Card className="border-primary/30 bg-primary/8">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-primary">Topic: {selectedTopicMeta.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm text-primary/90">
              <p>{selectedTopicMeta.description}</p>
              <Button asChild variant="outline" className="border-primary/30 bg-slate-900/65 text-primary hover:bg-slate-900">
                <Link href="/blog">Reset topic</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {featured ? <BlogFeaturedCard post={featured} /> : null}

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Latest from BridgeMind</h2>
          </div>

          {withoutFeatured.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {withoutFeatured.map((post) => (
                <BlogArticleCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <Card className="border-slate-700/70 bg-slate-950/70">
              <CardContent className="py-8 text-center text-sm text-slate-300">
                No articles match this topic yet. Try another filter.
              </CardContent>
            </Card>
          )}
        </section>

        <section className="rounded-3xl border border-primary/30 bg-[linear-gradient(120deg,rgba(9,30,52,0.75),rgba(4,10,20,0.95))] p-6 shadow-[0_0_0_1px_rgba(35,72,110,0.3),0_28px_90px_rgba(2,8,24,0.64)] sm:p-8">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Suggest an article or benchmark scenario</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
            Share your production challenge, architecture question, or model comparison request. We review incoming
            ideas in the editorial queue every week.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="bg-primary text-primary-foreground hover:brightness-105">
              <BlogTrackedLink
                href="/contact"
                eventName="blog_cta_click"
                payload={{ location: "list_bottom", action: "contact_editorial_team" }}
              >
                Contact editorial team
                <ArrowRight className="size-4" />
              </BlogTrackedLink>
            </Button>
            <Button asChild variant="outline" className="border-slate-500/65 bg-slate-900/70 text-slate-100 hover:bg-slate-900">
              <BlogTrackedLink
                href="/discord"
                eventName="blog_cta_click"
                payload={{ location: "list_bottom", action: "discuss_in_discord" }}
              >
                <Newspaper className="size-4" />
                Discuss in Discord
              </BlogTrackedLink>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

