import type { Metadata } from "next";
import { BlogListPage } from "@/components/blog-v2/blog-list-page";
import { PageFrame } from "@/components/page-templates";
import { getSectionIndex, getSectionLocaleCopy } from "@/lib/content/section-index";
import { getLocale } from "@/lib/i18n-server";
import { tr } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type BlogPageProps = {
  searchParams: Promise<{
    tag?: string;
    topic?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const sectionCopy = getSectionLocaleCopy(getSectionIndex("blog"), locale);
  const pageTitle = sectionCopy?.title ?? tr(locale, "Blog", "Blog");
  const pageDescription =
    sectionCopy?.description ??
    tr(
      locale,
      "Editorial playbooks, architecture notes, and operations guidance for teams shipping MCP systems.",
      "Editorial playbooks, architecture notes, and operations guidance for teams shipping MCP systems.",
    );

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: "BridgeMind Blog",
      description: "Editorial + Tech Noir blog for production MCP and agentic engineering workflows.",
      type: "website",
      url: "/blog",
    },
    twitter: {
      card: "summary_large_image",
      title: "BridgeMind Blog",
      description: "Editorial + Tech Noir blog for production MCP and agentic engineering workflows.",
    },
  };
}

function normalizeTopic(input: string | undefined): string | null {
  if (!input) {
    return null;
  }
  const normalized = input.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const selectedTopic = normalizeTopic(
    typeof params.topic === "string" ? params.topic : typeof params.tag === "string" ? params.tag : undefined,
  );
  return (
    <PageFrame variant="content">
      <BlogListPage selectedTopic={selectedTopic} />
    </PageFrame>
  );
}
