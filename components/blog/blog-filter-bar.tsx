import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { tr, type Locale } from "@/lib/i18n";
type FilterTagItem = {
    slug: string;
    label: string;
    count: number;
};
type BlogFilterBarProps = {
    locale: Locale;
    selectedTag: string | null;
    tags: FilterTagItem[];
};
function normalizeTag(tag: string | null): string {
    return (tag ?? "").trim().toLowerCase();
}
export function BlogFilterBar({ locale, selectedTag, tags }: BlogFilterBarProps) {
    const normalizedSelectedTag = normalizeTag(selectedTag);
    return (<section className="rounded-2xl border border-white/10 bg-indigo-950/75 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <p className="text-xs font-medium tracking-[0.14em] text-violet-300 uppercase">
          {tr(locale, "Filter by topic", "Filter by topic")}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href="/blog" className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs transition ${!normalizedSelectedTag
            ? "border-violet-300/45 bg-violet-500/15 text-violet-100"
            : "border-white/15 bg-indigo-900/80 text-violet-200 hover:border-white/25 hover:text-violet-50"}`}>
          {tr(locale, "All", "All")}
        </Link>

        {tags.map((tag) => {
            const isActive = normalizeTag(tag.slug) === normalizedSelectedTag;
            return (<Link key={tag.slug} href={`/blog?tag=${encodeURIComponent(tag.slug)}`} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${isActive
                    ? "border-violet-300/45 bg-violet-500/15 text-violet-100"
                    : "border-white/15 bg-indigo-900/80 text-violet-200 hover:border-white/25 hover:text-violet-50"}`}>
              <span>{tag.label}</span>
              <Badge variant="outline" className={`h-4 border px-1.5 text-[10px] ${isActive
                    ? "border-violet-300/50 bg-violet-500/20 text-violet-100"
                    : "border-white/20 bg-indigo-900 text-violet-200"}`}>
                {tag.count}
              </Badge>
            </Link>);
        })}
      </div>
    </section>);
}
