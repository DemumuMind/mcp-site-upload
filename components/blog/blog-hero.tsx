import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { tr, type Locale } from "@/lib/i18n";

type BlogHeroProps = {
  locale: Locale;
};

export function BlogHero({ locale }: BlogHeroProps) {
  return (
    <section className="rounded-3xl border border-violet-400/20 bg-slate-950/72 p-6 sm:p-8">
      <Badge className="mb-4 w-fit border-violet-400/35 bg-violet-500/10 text-violet-200">
        <Sparkles className="size-3" />
        {tr(locale, "Resources", "Ресурсы")}
      </Badge>
      <h1 className="text-4xl leading-tight font-semibold tracking-tight text-slate-100 sm:text-6xl">
        {tr(locale, "BridgeMind Blog", "Блог BridgeMind")}
      </h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
        {tr(
          locale,
          "Editorial notes, benchmarks, and implementation playbooks for teams shipping agentic coding workflows.",
          "Редакционные материалы, разборы и практические руководства для команд, которые внедряют агентные процессы разработки.",
        )}
      </p>
    </section>
  );
}
