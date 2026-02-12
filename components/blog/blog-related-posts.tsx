import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tr, type Locale } from "@/lib/i18n";
import type { BlogPost } from "@/lib/blog/types";
type BlogRelatedPostsProps = {
    posts: BlogPost[];
    locale: Locale;
};
export function BlogRelatedPosts({ posts, locale }: BlogRelatedPostsProps) {
    if (posts.length === 0) {
        return null;
    }
    return (<section className="space-y-3">
      <h2 className="text-2xl font-semibold tracking-tight text-violet-50">
        {tr(locale, "Related reads", "Related reads")}
      </h2>
      <div className="grid gap-3 md:grid-cols-3">
        {posts.map((post) => {
            const localized = post.locale[locale];
            return (<Card key={post.slug} className="border-white/10 bg-indigo-950/75">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-violet-50">{localized.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-violet-200">
                <p>{localized.excerpt}</p>
                <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-50 transition hover:text-white">
                  {tr(locale, "Read article", "Read article")}
                  <ArrowRight className="size-4"/>
                </Link>
              </CardContent>
            </Card>);
        })}
      </div>
    </section>);
}
