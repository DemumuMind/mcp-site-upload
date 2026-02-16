import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SectionLocaleCopy } from "@/lib/content/section-index";
import { tr, type Locale } from "@/lib/i18n";
type BlogHeroProps = {
    locale: Locale;
    copy?: SectionLocaleCopy | null;
};
export function BlogHero({ locale, copy }: BlogHeroProps) {
    const eyebrow = copy?.eyebrow ?? tr(locale, "Resources", "Resources");
    const title = copy?.heroTitle ?? tr(locale, "BridgeMind Blog", "BridgeMind Blog");
    const description = copy?.heroDescription ??
        tr(locale, "Editorial notes, benchmarks, and implementation playbooks for teams shipping agentic coding workflows.", "Editorial notes, benchmarks, and implementation playbooks for teams shipping agentic coding workflows.");
    return (<section className="rounded-3xl border border-violet-400/20 bg-card p-6 sm:p-8">
      <Badge className="mb-4 w-fit border-violet-400/35 bg-violet-500/10 text-muted-foreground">
        <Sparkles className="size-3"/>
        {eyebrow}
      </Badge>
      <h1 className="text-4xl leading-tight font-semibold tracking-tight text-foreground sm:text-6xl">
        {title}
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
    </section>);
}

