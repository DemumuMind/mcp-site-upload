import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BlogTopicFilterItem = {
  slug: string;
  name: string;
  count: number;
};

type BlogTopicFilterProps = {
  selectedTopic: string | null;
  topics: BlogTopicFilterItem[];
};

function normalizeSlug(value: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

export function BlogTopicFilter({ selectedTopic, topics }: BlogTopicFilterProps) {
  const normalizedSelected = normalizeSlug(selectedTopic);

  return (
    <section className="rounded-2xl border border-slate-700/70 bg-slate-950/70 p-4 shadow-[0_0_0_1px_rgba(35,52,95,0.25),0_24px_80px_rgba(2,8,24,0.6)]">
      <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">Filter by topic</p>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/blog"
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition",
            normalizedSelected
              ? "border-slate-600/80 bg-slate-900/70 text-slate-300 hover:border-slate-500 hover:text-slate-100"
              : "border-cyan-300/50 bg-cyan-500/12 text-cyan-100",
          )}
        >
          All
        </Link>

        {topics.map((topic) => {
          const isActive = normalizedSelected === normalizeSlug(topic.slug);

          return (
            <Link
              key={topic.slug}
              href={`/blog?topic=${encodeURIComponent(topic.slug)}`}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                isActive
                  ? "border-cyan-300/50 bg-cyan-500/12 text-cyan-100"
                  : "border-slate-600/80 bg-slate-900/70 text-slate-300 hover:border-slate-500 hover:text-slate-100",
              )}
            >
              <span>{topic.name}</span>
              <Badge
                variant="outline"
                className={cn(
                  "h-4 border px-1.5 text-[10px]",
                  isActive
                    ? "border-cyan-300/55 bg-cyan-500/15 text-cyan-100"
                    : "border-slate-500/80 bg-slate-800/70 text-slate-300",
                )}
              >
                {topic.count}
              </Badge>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
