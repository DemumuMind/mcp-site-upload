import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageVariant = "default" | "directory" | "ops" | "content" | "marketing";

type PageFrameProps = {
  children: ReactNode;
  variant?: PageVariant;
  className?: string;
};

const frameVariantClassName: Record<PageVariant, string> = {
  default: "bg-transparent",
  directory: "bg-transparent",
  ops: "bg-transparent",
  content: "bg-transparent",
  marketing: "bg-transparent",
};

export function PageFrame({ children, variant = "default", className }: PageFrameProps) {
  return <div className={cn("relative min-h-screen border-t border-blacksmith text-foreground", frameVariantClassName[variant], className)}>{children}</div>;
}

type PageHeroProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  metrics?: ReactNode;
  badgeTone?: "cyan" | "emerald" | "amber" | "violet";
  className?: string;
  animated?: boolean;
};

const badgeToneClassName: Record<NonNullable<PageHeroProps["badgeTone"]>, string> = {
  cyan: "border-primary/40 bg-primary/10 text-primary",
  emerald: "border-primary/40 bg-primary/10 text-primary",
  amber: "border-primary/40 bg-primary/10 text-primary",
  violet: "border-primary/40 bg-primary/10 text-primary",
};

export function PageHero({ eyebrow, title, description, actions, metrics, badgeTone = "cyan", className, animated = true }: PageHeroProps) {
  return (
    <section data-anime={animated ? "reveal" : undefined} data-anime-delay={animated ? "40" : undefined} className={cn("space-y-5 rounded-3xl border border-blacksmith bg-black/35 p-6 sm:p-8", className)}>
      {eyebrow ? (
        <div className={cn("inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase", badgeToneClassName[badgeTone])}>
          {eyebrow}
        </div>
      ) : null}

      <div className="space-y-3">
        <h1 className="text-3xl leading-tight font-semibold tracking-tight text-foreground sm:text-5xl">{title}</h1>
        {description ? <p className="max-w-4xl text-sm leading-7 text-muted-foreground sm:text-base">{description}</p> : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      {metrics ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics}</div> : null}
    </section>
  );
}

type PageMetricProps = {
  label: ReactNode;
  value: ReactNode;
  valueClassName?: string;
  className?: string;
  animated?: boolean;
};

export function PageMetric({ label, value, valueClassName, className, animated = true }: PageMetricProps) {
  return (
    <div data-anime={animated ? "reveal" : undefined} data-anime-delay={animated ? "90" : undefined} className={cn("rounded-2xl border border-blacksmith bg-card p-4 transition-transform duration-300 hover:-translate-y-0.5", className)}>
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold text-foreground", valueClassName)}>{value}</p>
    </div>
  );
}

type PageSectionProps = {
  children: ReactNode;
  className?: string;
};

export function PageSection({ children, className }: PageSectionProps) {
  return <section data-anime="reveal" data-anime-delay="120" className={cn("rounded-2xl border border-blacksmith bg-card/90 p-5 sm:p-6", className)}>{children}</section>;
}


