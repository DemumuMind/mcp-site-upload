import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PageFrameVariant = "marketing" | "directory" | "form" | "content" | "ops";

const frameClassByVariant: Record<PageFrameVariant, string> = {
  marketing:
    "bg-[linear-gradient(180deg,#030812_0%,#040b17_45%,#04070f_100%)] before:bg-[radial-gradient(circle_at_15%_0%,rgba(56,189,248,0.2),transparent_40%),radial-gradient(circle_at_85%_5%,rgba(59,130,246,0.15),transparent_36%)]",
  directory:
    "bg-[linear-gradient(180deg,#030816_0%,#050b1a_52%,#050913_100%)] before:bg-[radial-gradient(circle_at_12%_4%,rgba(34,211,238,0.2),transparent_42%),radial-gradient(circle_at_88%_0%,rgba(14,165,233,0.16),transparent_38%)]",
  form: "bg-[linear-gradient(180deg,#0a0716_0%,#090a1a_48%,#060814_100%)] before:bg-[radial-gradient(circle_at_20%_0%,rgba(217,70,239,0.2),transparent_42%),radial-gradient(circle_at_78%_5%,rgba(99,102,241,0.16),transparent_40%)]",
  content:
    "bg-[linear-gradient(180deg,#050c1c_0%,#060a16_50%,#040810_100%)] before:bg-[radial-gradient(circle_at_14%_2%,rgba(139,92,246,0.2),transparent_42%),radial-gradient(circle_at_86%_4%,rgba(56,189,248,0.14),transparent_40%)]",
  ops: "bg-[linear-gradient(180deg,#060a14_0%,#070c18_48%,#050913_100%)] before:bg-[radial-gradient(circle_at_18%_3%,rgba(16,185,129,0.2),transparent_42%),radial-gradient(circle_at_82%_2%,rgba(59,130,246,0.14),transparent_36%)]",
};

type PageFrameProps = {
  children: ReactNode;
  className?: string;
  variant?: PageFrameVariant;
};

export function PageFrame({ children, className, variant = "marketing" }: PageFrameProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border-t border-white/10 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:-z-10 before:h-[520px] before:content-['']",
        frameClassByVariant[variant],
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(56,189,248,0.06)_1px,transparent_1px),linear-gradient(rgba(56,189,248,0.05)_1px,transparent_1px)] bg-[size:44px_44px] opacity-30" />
      {children}
    </div>
  );
}

type PageHeroProps = {
  title: string;
  description: string;
  eyebrow?: string;
  badgeTone?: "cyan" | "emerald" | "violet" | "amber";
  actions?: ReactNode;
  metrics?: ReactNode;
  className?: string;
};

const badgeClassByTone: Record<NonNullable<PageHeroProps["badgeTone"]>, string> = {
  cyan: "border-cyan-400/40 bg-cyan-500/10 text-cyan-200",
  emerald: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
  violet: "border-violet-400/40 bg-violet-500/10 text-violet-200",
  amber: "border-amber-400/40 bg-amber-500/10 text-amber-200",
};

export function PageHero({
  title,
  description,
  eyebrow,
  badgeTone = "cyan",
  actions,
  metrics,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-white/10 bg-slate-950/72 px-5 py-6 shadow-[0_0_0_1px_rgba(148,163,184,0.08)] sm:px-8 sm:py-9",
        className,
      )}
    >
      <div className="space-y-4">
        {eyebrow ? <Badge className={badgeClassByTone[badgeTone]}>{eyebrow}</Badge> : null}
        <div className="space-y-3">
          <h1 className="text-4xl leading-[0.98] font-semibold tracking-tight text-slate-100 sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="max-w-4xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
        {metrics ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{metrics}</div> : null}
      </div>
    </section>
  );
}

type PageSectionProps = {
  children: ReactNode;
  className?: string;
};

export function PageSection({ children, className }: PageSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/10 bg-slate-950/70 p-5 shadow-[0_0_0_1px_rgba(148,163,184,0.06)] sm:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}

type PageMetricProps = {
  label: string;
  value: ReactNode;
  valueClassName?: string;
};

export function PageMetric({ label, value, valueClassName }: PageMetricProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3">
      <p className="text-[11px] tracking-[0.14em] text-slate-400 uppercase">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold text-slate-100", valueClassName)}>{value}</p>
    </div>
  );
}
