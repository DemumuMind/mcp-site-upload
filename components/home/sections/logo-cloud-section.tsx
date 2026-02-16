import { Badge } from "@/components/ui/badge";
import type { HomeContent } from "@/lib/home/content";

type LogoCloudSectionProps = {
  content: HomeContent["logoCloud"];
};

export function LogoCloudSection({ content }: LogoCloudSectionProps) {
  return (
    <section className="border-y border-blacksmith bg-black/30">
      <div className="section-shell py-10">
        <p className="mb-4 text-center text-xs tracking-[0.18em] text-muted-foreground uppercase">{content.label}</p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {content.brands.map((brand) => (
            <Badge key={brand} variant="secondary" className="px-3 py-1.5 text-[11px] tracking-wide uppercase">
              {brand}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
