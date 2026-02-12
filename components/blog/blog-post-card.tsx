import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr, type Locale } from "@/lib/i18n";
import { getBlogTagBySlug } from "@/lib/blog/service";
import type { BlogPost } from "@/lib/blog/types";
type BlogPostCardProps = {
    post: BlogPost;
    locale: Locale;
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
export async function BlogPostCard({ post, locale }: BlogPostCardProps) {
    const localized = post.locale[locale];
    const tags = await Promise.all(post.tags.map(async (tagSlug) => ({
        tagSlug,
        tag: await getBlogTagBySlug(tagSlug),
    })));
    return (<Card className="border-white/10 bg-indigo-950/75">
      <CardHeader className="space-y-3 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          {tags.map(({ tagSlug, tag }) => {
            return (<Badge key={tagSlug} variant="outline" className="border-cyan-400/30 bg-cyan-500/10 text-cyan-200">
                {tag ? tag.label[locale] : tagSlug}
              </Badge>);
        })}
        </div>
        <CardTitle className="text-lg text-violet-50">{localized.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-violet-200">
        <p>{localized.excerpt}</p>

        <div className="flex flex-wrap items-center gap-3 text-xs tracking-[0.1em] text-violet-300 uppercase">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5"/>
            {formatDate(post.publishedAt, locale)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5"/>
            {post.readTimeMinutes} {tr(locale, "min", "min")}
          </span>
        </div>

        <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-50 transition hover:text-white">
          {tr(locale, "Read article", "Read article")}
          <ArrowRight className="size-4"/>
        </Link>
      </CardContent>
    </Card>);
}
