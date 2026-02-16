import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr, type Locale } from "@/lib/i18n";
import { getBlogTagBySlug } from "@/lib/blog/service";
import type { BlogPost } from "@/lib/blog/types";
type BlogFeaturedPostProps = {
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
export async function BlogFeaturedPost({ post, locale }: BlogFeaturedPostProps) {
    const localized = post.locale[locale];
    const tags = await Promise.all(post.tags.map(async (tagSlug) => ({
        tagSlug,
        tag: await getBlogTagBySlug(tagSlug),
    })));
    return (<Card className="border-primary/30 bg-[linear-gradient(130deg,rgba(53,30,96,0.45),rgba(10,18,35,0.85))]">
      <CardHeader className="pb-2">
        <Badge className="w-fit border-violet-300/40 bg-primary0/15 text-foreground">
          <Sparkles className="size-3"/>
          {tr(locale, "Featured article", "Featured article")}
        </Badge>
        <CardTitle className="mt-3 text-2xl text-foreground sm:text-3xl">{localized.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>{localized.excerpt}</p>

        <div className="flex flex-wrap items-center gap-2">
          {tags.map(({ tagSlug, tag }) => {
            return (<Badge key={tagSlug} variant="outline" className="border-violet-300/40 bg-primary0/15 text-foreground">
                {tag ? tag.label[locale] : tagSlug}
              </Badge>);
        })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs tracking-[0.1em] text-muted-foreground uppercase">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5"/>
              {formatDate(post.publishedAt, locale)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="size-3.5"/>
              {post.readTimeMinutes} {tr(locale, "min", "min")}
            </span>
          </div>

          <Button asChild className="bg-blue-500 hover:bg-blue-400">
            <Link href={`/blog/${post.slug}`}>
              {tr(locale, "Open article", "Open article")}
              <ArrowRight className="size-4"/>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>);
}

