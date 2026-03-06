import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { BlogArticleCard } from "@/components/blog-v2/blog-article-card";
import { BlogFeaturedCard } from "@/components/blog-v2/blog-featured-card";
import { BlogTrackedLink } from "@/components/blog-v2/blog-tracked-link";
import { BlogTopicFilter } from "@/components/blog-v2/blog-topic-filter";
import { Button } from "@/components/ui/button";
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
    <main className="bg-background text-foreground">
      <section className="relative isolate overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.18),transparent_24%),radial-gradient(circle_at_84%_16%,hsl(var(--accent)/0.16),transparent_20%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_68%)]" />
        <div className="section-shell flex min-h-[72vh] flex-col justify-center py-16 sm:py-20 lg:py-24">
          <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">DemumuMind Journal</p>
          <p className="mt-5 font-serif text-[clamp(3.2rem,10vw,7rem)] leading-none tracking-[-0.06em] text-foreground">DemumuMind</p>
          <h1 className="mt-4 max-w-5xl text-balance text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
            Editorial field notes for teams shipping MCP systems in production.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Architecture narratives, evaluation playbooks, and operating guidance from the edge between experiments and dependable delivery.
          </p>
        </div>
      </section>

      <section className="border-b border-border/60">
        <div className="section-shell py-6 sm:py-7">
          <BlogTopicFilter
            selectedTopic={normalizedTopic}
            topics={topics.map((topic) => ({
              slug: topic.slug,
              name: topic.name,
              count: topic.count,
            }))}
          />
        </div>
      </section>

      {selectedTopicMeta ? (
        <section className="border-b border-border/60">
          <div className="section-shell grid gap-4 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div>
              <p className="text-[11px] tracking-[0.22em] text-primary uppercase">Focused topic</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{selectedTopicMeta.name}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{selectedTopicMeta.description}</p>
            </div>
            <Button asChild variant="outline" className="h-11 rounded-none border-border/80 bg-transparent px-6">
              <Link href="/blog">Reset topic</Link>
            </Button>
          </div>
        </section>
      ) : null}

      {featured ? (
        <section className="border-b border-border/60">
          <div className="section-shell py-10 sm:py-14">
            <div className="mb-6 max-w-2xl">
              <p className="text-[11px] tracking-[0.22em] text-primary uppercase">Featured dispatch</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">Start with the clearest current signal.</h2>
            </div>
            <BlogFeaturedCard post={featured} />
          </div>
        </section>
      ) : null}

      <section className="border-b border-border/60">
        <div className="section-shell py-10 sm:py-14">
          <div className="mb-6 max-w-2xl">
            <p className="text-[11px] tracking-[0.22em] text-primary uppercase">Latest posts</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">Latest from DemumuMind</h2>
          </div>

          {withoutFeatured.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {withoutFeatured.map((post) => (
                <BlogArticleCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border/70 px-6 py-10 text-center text-sm text-muted-foreground">
              No articles match this topic yet. Try another filter.
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="section-shell py-12 sm:py-16">
          <div className="border border-border/60 px-6 py-8 sm:px-8 sm:py-10">
            <p className="text-[11px] tracking-[0.22em] text-primary uppercase">Editorial queue</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
              Suggest an article or benchmark scenario.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              Share your production challenge, architecture question, or model comparison request. We review incoming ideas in the editorial queue every week.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 rounded-none px-6">
                <BlogTrackedLink
                  href="/contact"
                  eventName="blog_cta_click"
                  payload={{ location: "list_bottom", action: "contact_editorial_team" }}
                >
                  Contact editorial team
                  <ArrowRight className="size-4" />
                </BlogTrackedLink>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-none border-border/80 bg-transparent px-6">
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
          </div>
        </div>
      </section>
    </main>
  );
}
