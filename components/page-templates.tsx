import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
type PageVariant = "default" | "directory" | "ops" | "content" | "marketing";
type PageFrameProps = {
    children: ReactNode;
    variant?: PageVariant;
    className?: string;
};
const frameVariantClassName: Record<PageVariant, string> = {
    default: "bg-[linear-gradient(180deg,#040812_0%,#050a16_100%)]",
    directory: "bg-[linear-gradient(180deg,#040812_0%,#050a16_100%)]",
    ops: "bg-[linear-gradient(180deg,#050814_0%,#060b18_100%)]",
    content: "bg-[linear-gradient(180deg,#030811_0%,#040a16_100%)]",
    marketing: "bg-[linear-gradient(180deg,#040811_0%,#050a16_100%)]",
};
export function PageFrame({ children, variant = "default", className }: PageFrameProps) {
    return (<div className={cn("relative min-h-screen border-t border-white/10 text-violet-50", frameVariantClassName[variant], className)}>
      {children}
    </div>);
}
type PageHeroProps = {
    eyebrow?: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    metrics?: ReactNode;
    badgeTone?: "cyan" | "emerald" | "amber" | "violet";
    className?: string;
};
const badgeToneClassName: Record<NonNullable<PageHeroProps["badgeTone"]>, string> = {
    cyan: "border-cyan-400/35 bg-cyan-500/10 text-cyan-200",
    emerald: "border-emerald-400/35 bg-emerald-500/10 text-emerald-200",
    amber: "border-amber-400/35 bg-amber-500/10 text-amber-200",
    violet: "border-violet-400/35 bg-violet-500/10 text-violet-200",
};
export function PageHero({ eyebrow, title, description, actions, metrics, badgeTone = "cyan", className, }: PageHeroProps) {
    return (<section className={cn("space-y-5 rounded-3xl border border-white/12 bg-indigo-950/72 p-6 sm:p-8", className)}>
      {eyebrow ? (<div className={cn("inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase", badgeToneClassName[badgeTone])}>
          {eyebrow}
        </div>) : null}

      <div className="space-y-3">
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-violet-50 sm:text-5xl">{title}</h1>
        {description ? <p className="max-w-4xl text-sm leading-7 text-violet-200 sm:text-base">{description}</p> : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}

      {metrics ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics}</div> : null}
    </section>);
}
type PageMetricProps = {
    label: ReactNode;
    value: ReactNode;
    valueClassName?: string;
    className?: string;
};
export function PageMetric({ label, value, valueClassName, className }: PageMetricProps) {
    return (<div className={cn("rounded-2xl border border-white/12 bg-indigo-900/70 p-4", className)}>
      <p className="text-xs tracking-wide text-violet-300 uppercase">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold text-violet-50", valueClassName)}>{value}</p>
    </div>);
}
type PageSectionProps = {
    children: ReactNode;
    className?: string;
};
export function PageSection({ children, className }: PageSectionProps) {
    return <section className={cn("rounded-2xl border border-white/10 bg-indigo-900/55 p-5 sm:p-6", className)}>{children}</section>;
}
