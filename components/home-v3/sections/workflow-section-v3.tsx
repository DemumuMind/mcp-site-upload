import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/home-v3/primitives/section-label";
import type { HomeContent } from "@/lib/home/content";

type WorkflowSectionV3Props = {
  content: HomeContent["workflows"];
};

export function WorkflowSectionV3({ content }: WorkflowSectionV3Props) {
  return (
    <section className="border-b border-blacksmith bg-background">
      <div className="section-shell space-y-7 py-14">
        <header className="space-y-3">
          <SectionLabel>Workflow</SectionLabel>
          <h2 className="font-serif text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl">{content.heading}</h2>
          <p className="max-w-3xl text-muted-foreground">{content.description}</p>
        </header>

        <ol className="grid gap-4 lg:grid-cols-2" aria-label="Delivery workflow steps">
          {content.cards.map((item, index) => (
            <li key={item.title} className="rounded-md border border-blacksmith bg-card p-5">
              <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Step {index + 1}</p>
              <h3 className="mt-2 text-xl font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              <Link href={item.href} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                {item.cta}
                <ArrowRight className="size-4" />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

