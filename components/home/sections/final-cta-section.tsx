import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HomeContent } from "@/lib/home/content";

type FinalCtaSectionProps = {
  content: HomeContent["finalCta"];
};

export function FinalCtaSection({ content }: FinalCtaSectionProps) {
  return (
    <section className="relative border-y border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.22),transparent_45%),linear-gradient(180deg,#071228_0%,#050d1f_100%)]">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6">
        <Badge className="border border-emerald-400/35 bg-emerald-500/12 text-emerald-200">{content.badge}</Badge>
        <h3 className="text-4xl leading-tight font-semibold tracking-tight text-violet-50 sm:text-6xl">
          {content.titleLead}
          <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-blue-500 bg-clip-text text-transparent">
            {content.titleAccent}
          </span>
        </h3>
        <p className="max-w-2xl text-lg text-violet-200">{content.description}</p>
        <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button asChild size="lg" className="h-12 w-full rounded-xl bg-white px-8 text-indigo-900 hover:bg-violet-100 sm:w-auto">
            <Link href="/catalog">{content.primaryCta}</Link>
          </Button>
          <Link
            href="/how-to-use"
            className="text-center text-base text-violet-100 underline decoration-violet-400 underline-offset-4 transition hover:text-white sm:text-left"
          >
            {content.secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
