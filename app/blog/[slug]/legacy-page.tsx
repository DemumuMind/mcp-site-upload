import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { BlogArticleBody } from "@/components/blog/blog-article-body";
import { BlogRelatedPosts } from "@/components/blog/blog-related-posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getAllBlogSlugs,
  getBlogPostBySlug,
  getBlogTagBySlug,
  getRelatedBlogPosts,
} from "@/lib/blog/service";
import { tr, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

type LegacyBlogArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(value: string, locale: Locale): string {
  void locale;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export async function generateLegacyStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateLegacyArticleMetadata({
  params,
}: LegacyBlogArticlePageProps): Promise<Metadata> {
  const locale = await getLocale();
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: tr(locale, "Article not found", "Article not found"),
      description: tr(
        locale,
        "The requested blog article does not exist.",
        "The requested blog article does not exist.",
      ),
    };
  }

  const localized = post.locale[locale];
  return {
    title: localized.seoTitle,
    description: localized.seoDescription,
    openGraph: {
      type: "article",
      title: localized.seoTitle,
      description: localized.seoDescription,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: localized.seoTitle,
      description: localized.seoDescription,
    },
  };
}

export async function LegacyBlogArticlePage({ params }: LegacyBlogArticlePageProps) {
  const locale = await getLocale();
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const localized = post.locale[locale];
  const relatedPosts = await getRelatedBlogPosts(post.slug, 3);
  const tagEntries = await Promise.all(
    post.tags.map(async (tagSlug) => ({
      slug: tagSlug,
      tag: await getBlogTagBySlug(tagSlug),
    })),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: localized.title,
    description: localized.seoDescription,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    inLanguage: "en-US",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `/blog/${post.slug}`,
    },
    keywords: tagEntries
      .map(({ slug: tagSlug, tag }) => (tag ? tag.label[locale] : tagSlug))
      .join(", "),
  };

  return (
    <div className="relative overflow-hidden border-t border-white/10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#050d1b_0%,#060b16_45%,#040811_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(circle_at_20%_0%,rgba(56,189,248,0.16),transparent_45%),radial-gradient(circle_at_85%_5%,rgba(139,92,246,0.18),transparent_45%)]" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" className="px-0 text-violet-200 hover:text-white">
            <Link href="/blog">
              <ArrowLeft className="size-4" />
              {tr(locale, "Back to blog", "Back to blog")}
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {tagEntries.map(({ slug: tagSlug, tag }) => (
            <Badge key={tagSlug} variant="outline" className="border-primary/30 bg-cyan-500/10 text-cyan-200">
              {tag ? tag.label[locale] : tagSlug}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs tracking-[0.1em] text-violet-300 uppercase">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {formatDate(post.publishedAt, locale)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5" />
            {post.readTimeMinutes} {tr(locale, "min read", "min read")}
          </span>
          {post.updatedAt ? (
            <span>
              {tr(locale, "Updated", "Updated")}: {formatDate(post.updatedAt, locale)}
            </span>
          ) : null}
        </div>

        <BlogArticleBody post={post} locale={locale} />

        <BlogRelatedPosts posts={relatedPosts} locale={locale} />
      </div>
    </div>
  );
}
