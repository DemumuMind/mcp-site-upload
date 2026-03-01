import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { BlogFeaturedPost } from "@/components/blog/blog-featured-post";
import { BlogFilterBar } from "@/components/blog/blog-filter-bar";
import { BlogHero } from "@/components/blog/blog-hero";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAllBlogPosts,
  getAllBlogTags,
  getBlogTagBySlug,
  getFeaturedPost,
} from "@/lib/blog/service";
import { getSectionIndex, getSectionLocaleCopy } from "@/lib/content/section-index";
import { tr } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

type LegacyBlogPageProps = {
  searchParams: Promise<{
    tag?: string;
  }>;
};

function normalizeTag(tag: string | undefined): string | null {
  if (!tag) {
    return null;
  }
  const normalized = tag.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

export async function generateLegacyBlogMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const sectionCopy = getSectionLocaleCopy(getSectionIndex("blog"), locale);
  const pageTitle = sectionCopy?.title ?? tr(locale, "Blog", "Blog");
  const pageDescription =
    sectionCopy?.description ??
    tr(
      locale,
      "Articles on vibe coding, agentic coding, prompt engineering, and AI development best practices.",
      "Articles on vibe coding, agentic coding, prompt engineering, and AI development best practices.",
    );
  const heroTitle = sectionCopy?.heroTitle ?? tr(locale, "DemumuMind Blog", "DemumuMind Blog");
  const heroDescription =
    sectionCopy?.heroDescription ??
    tr(
      locale,
      "Playbooks, architecture notes, and operational guides for agentic engineering teams.",
      "Playbooks, architecture notes, and operational guides for agentic engineering teams.",
    );

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: heroTitle,
      description: heroDescription,
      type: "website",
      url: "/blog",
    },
    twitter: {
      card: "summary_large_image",
      title: heroTitle,
      description: heroDescription,
    },
  };
}

export async function LegacyBlogPage({ searchParams }: LegacyBlogPageProps) {
  const locale = await getLocale();
  const sectionCopy = getSectionLocaleCopy(getSectionIndex("blog"), locale);
  const { tag } = await searchParams;
  const normalizedTag = normalizeTag(typeof tag === "string" ? tag : undefined);
  const allPosts = await getAllBlogPosts();
  const selectedTag = normalizedTag ? await getBlogTagBySlug(normalizedTag) : null;

  const posts = selectedTag
    ? allPosts.filter((post) =>
        post.tags.some(
          (postTag) => postTag.trim().toLowerCase() === selectedTag.slug.trim().toLowerCase(),
        ),
      )
    : allPosts;

  const featuredPost = await getFeaturedPost(selectedTag?.slug);
  const remainingPosts = featuredPost ? posts.filter((post) => post.slug !== featuredPost.slug) : posts;
  const allTags = await getAllBlogTags();

  const tagCountMap = new Map<string, number>();
  for (const post of allPosts) {
    for (const tagSlug of post.tags) {
      const normalizedTagSlug = tagSlug.trim().toLowerCase();
      tagCountMap.set(normalizedTagSlug, (tagCountMap.get(normalizedTagSlug) ?? 0) + 1);
    }
  }

  const tagsWithCounts = allTags
    .map((blogTag) => ({
      slug: blogTag.slug,
      label: blogTag.label[locale],
      count: tagCountMap.get(blogTag.slug.trim().toLowerCase()) ?? 0,
    }))
    .filter((tagItem) => tagItem.count > 0);

  return (
    <div className="relative overflow-hidden border-t border-blacksmith">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#050d1b_0%,#060b16_45%,#040811_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(circle_at_15%_5%,rgba(139,92,246,0.2),transparent_38%),radial-gradient(circle_at_82%_5%,rgba(56,189,248,0.14),transparent_38%)]" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <BlogHero locale={locale} copy={sectionCopy} />

        <BlogFilterBar locale={locale} selectedTag={selectedTag?.slug ?? null} tags={tagsWithCounts} />

        {selectedTag ? (
          <Card className="border-blacksmith bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-foreground">
                {tr(locale, "Filtered by", "Filtered by")}: {selectedTag.label[locale]}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
              <p>{selectedTag.description[locale]}</p>
              <Button
                asChild
                variant="outline"
                className="border-blacksmith bg-card text-foreground hover:bg-accent"
              >
                <Link href="/blog">{tr(locale, "Reset filter", "Reset filter")}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {featuredPost ? <BlogFeaturedPost post={featuredPost} locale={locale} /> : null}

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {tr(locale, "Latest from DemumuMind", "Latest from DemumuMind")}
            </h2>
          </div>

          {remainingPosts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {remainingPosts.map((post) => (
                <BlogPostCard key={post.slug} post={post} locale={locale} />
              ))}
            </div>
          ) : (
            <Card className="border-blacksmith bg-card">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                {tr(
                  locale,
                  "No posts match this filter yet. Try another topic.",
                  "No posts match this filter yet. Try another topic.",
                )}
              </CardContent>
            </Card>
          )}
        </section>

        <section className="rounded-3xl border border-primary/30 bg-[linear-gradient(120deg,rgba(11,30,50,0.85),rgba(6,12,24,0.95))] p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {tr(
              locale,
              "Want to suggest an article or benchmark scenario?",
              "Want to suggest an article or benchmark scenario?",
            )}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            {tr(
              locale,
              "Send us your topic idea, production challenge, or model comparison request and we will include it in the editorial queue.",
              "Send us your topic idea, production challenge, or model comparison request and we will include it in the editorial queue.",
            )}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="bg-blue-500 hover:bg-blue-400">
              <Link href="/contact">
                {tr(locale, "Contact editorial team", "Contact editorial team")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-blacksmith bg-card text-foreground hover:bg-accent"
            >
              <Link href="/discord">
                <Newspaper className="size-4" />
                {tr(locale, "Discuss in Discord", "Discuss in Discord")}
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}


