import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticlePage } from "@/components/blog-v2/blog-article-page";
import { PageFrame } from "@/components/page-templates";
import {
  getAllBlogV2SlugsHybrid,
  getBlogV2PostBySlugHybrid,
  getRelatedBlogV2PostsHybrid,
} from "@/lib/blog-v2/hybrid";

export const dynamic = "force-dynamic";

type BlogArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const slugs = await getAllBlogV2SlugsHybrid();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogV2PostBySlugHybrid(slug);

  if (!post) {
    return {
      title: "Article not found",
      description: "The requested article does not exist.",
    };
  }

  const metaImages = post.coverImage ? [post.coverImage] : ["/demumumind-og.png"];
  return {
    title: post.seoTitle,
    description: post.seoDescription,
    openGraph: {
      type: "article",
      title: post.seoTitle,
      description: post.seoDescription,
      url: post.url,
      images: metaImages,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle,
      description: post.seoDescription,
      images: metaImages,
    },
    alternates: post.canonicalUrl ? { canonical: post.canonicalUrl } : undefined,
  };
}

export default async function BlogArticleRoute({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const post = await getBlogV2PostBySlugHybrid(slug);
  if (!post) {
    notFound();
  }
  const relatedPosts = await getRelatedBlogV2PostsHybrid(post.slug, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    inLanguage: "en-US",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": post.canonicalUrl ?? post.url,
    },
    keywords: post.tags.join(", "),
    author: post.author
      ? {
          "@type": "Person",
          name: post.author.name,
        }
      : undefined,
  };

  return (
    <PageFrame variant="content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogArticlePage post={post} relatedPosts={relatedPosts} />
    </PageFrame>
  );
}
