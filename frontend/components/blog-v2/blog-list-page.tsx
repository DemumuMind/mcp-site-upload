import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { PageHero } from "@/components/page-templates";
import { BlogArticleCard } from "@/components/blog-v2/blog-article-card";
import { BlogFeaturedCard } from "@/components/blog-v2/blog-featured-card";
import { BlogTrackedLink } from "@/components/blog-v2/blog-tracked-link";
import { BlogTopicFilter } from "@/components/blog-v2/blog-topic-filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAllBlogV2ListItemsHybrid,
  getBlogV2TagsWithCountsHybrid,
  getFeaturedBlogV2PostHybrid,
} from "@/lib/blog-v2/hybrid";

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

export async function BlogListPage({ selectedTopic }: BlogListPageProps) {
  const normalizedTopic = normalizeTopic(selectedTopic);
  const posts = await getAllBlogV2ListItemsHybrid();
  const topics = await getBlogV2TagsWithCountsHybrid();
  const featured = await getFeaturedBlogV2PostHybrid(normalizedTopic ?? undefined);

  const filtered = normalizedTopic
    ? posts.filter((post) => post.tags.some((tag) => tag.trim().toLowerCase() === normalizedTopic))
    : posts;

  const withoutFeatured = featured ? filtered.filter((post) => post.slug !== featured.slug) : filtered;
  const selectedTopicMeta = normalizedTopic
    ? topics.find((topic) => topic.slug.trim().toLowerCase() === normalizedTopic)
    : null;

  return (
    <div className="relative overflow-hidden">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <PageHero
          eyebrow="Resources"
          title="DemumuMind Blog"
          description="Editorial playbooks, architecture narratives, and operational checklists for teams building agentic products in production."
          badgeTone="cyan"
        />

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
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Latest from DemumuMind</h2>
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

