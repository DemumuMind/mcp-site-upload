import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BlogTopicFilterItem = { slug: string; name: string; count: number; };
type BlogTopicFilterProps = { selectedTopic: string | null; topics: BlogTopicFilterItem[]; };
function normalizeSlug(value: string | null): string { return (value ?? "").trim().toLowerCase(); }

export function BlogTopicFilter({ selectedTopic, topics }: BlogTopicFilterProps) {
  const normalizedSelected = normalizeSlug(selectedTopic);
  return (
    <section className="border-y border-border/60 py-4 sm:py-5">
      <p className="mb-3 text-[11px] tracking-[0.22em] text-muted-foreground uppercase">Filter by topic</p>
      <div className="flex flex-wrap gap-2">
        <Link href="/blog" className={cn("inline-flex items-center border px-3 py-2 text-xs font-medium transition rounded-none", normalizedSelected ? "border-border/70 bg-transparent text-muted-foreground hover:bg-accent/10 hover:text-foreground" : "border-primary/40 bg-primary/10 text-primary")}>
          All
        </Link>
        {topics.map((topic) => {
          const isActive = normalizedSelected === normalizeSlug(topic.slug);
          return (
            <Link key={topic.slug} href={`/blog?topic=${encodeURIComponent(topic.slug)}`} className={cn("inline-flex items-center gap-2 border px-3 py-2 text-xs font-medium transition rounded-none", isActive ? "border-primary/40 bg-primary/10 text-primary" : "border-border/70 bg-transparent text-muted-foreground hover:bg-accent/10 hover:text-foreground")}>
              <span>{topic.name}</span>
              <Badge variant="outline" className={cn("px-1.5 py-0.5 text-[10px]", isActive ? "border-primary/45 bg-primary/12 text-primary" : "border-border/70 bg-transparent text-muted-foreground")}>{topic.count}</Badge>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
