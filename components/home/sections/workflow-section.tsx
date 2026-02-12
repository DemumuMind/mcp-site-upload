import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HomeContent } from "@/lib/home/content";

type WorkflowSectionProps = {
  content: HomeContent["workflows"];
};

export function WorkflowSection({ content }: WorkflowSectionProps) {
  return (
    <section className="border-y border-white/10 bg-[linear-gradient(180deg,rgba(5,12,28,0.86),rgba(3,8,20,0.95))]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-20 sm:px-6 lg:px-8">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-violet-50 sm:text-5xl">{content.heading}</h2>
          <p className="mx-auto max-w-3xl text-violet-200">{content.description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {content.cards.map((item) => (
            <Card
              key={item.title}
              className="group border-white/10 bg-indigo-950/65 transition hover:border-white/25 hover:bg-indigo-950/85"
            >
              <CardHeader className="space-y-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-white/10 bg-indigo-900/80 p-2.5">
                    <item.icon className={`size-4 ${item.accentClass}`} />
                  </div>
                  <CardTitle className="text-xl text-violet-50">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-violet-200">
                <p>{item.description}</p>
                <Link
                  href={item.href}
                  className={`inline-flex items-center gap-2 text-sm font-medium ${item.accentClass} transition group-hover:translate-x-0.5`}
                >
                  {item.cta}
                  <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
