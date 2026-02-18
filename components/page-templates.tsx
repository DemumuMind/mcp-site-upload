import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageVariant = "default" | "directory" | "ops" | "content" | "marketing";

type PageFrameProps = {
  children: ReactNode;
  variant?: PageVariant;
  className?: string;
};

const frameVariantClassName: Record<PageVariant, string> = {
  default: "",
  directory: "",
  ops: "",
  content: "",
  marketing: "",
};

export function PageFrame({ children, variant = "default", className }: PageFrameProps) {
  return (
    <div
      className={cn(
        "min-h-screen border-t bg-background text-foreground",
        frameVariantClassName[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}

type PageHeroProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  metrics?: ReactNode;
  badgeTone?: "cyan" | "emerald" | "amber" | "violet";
  surface?: "steel" | "mesh" | "rail" | "plain";
  className?: string;
  animated?: boolean;
};

const badgeToneClassName: Record<NonNullable<PageHeroProps["badgeTone"]>, string> = {
  cyan: "border-border bg-muted text-foreground",
  emerald: "border-border bg-muted text-foreground",
  amber: "border-border bg-muted text-foreground",
  violet: "border-border bg-muted text-foreground",
};

const heroSurfaceClassName: Record<NonNullable<PageHeroProps["surface"]>, string> = {
  steel: "border-border bg-card",
  mesh: "border-border bg-card",
  rail: "border-border bg-card",
  plain: "border-border bg-card",
};

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  metrics,
  badgeTone = "cyan",
  surface = "steel",
  className,
  animated = true,
}: PageHeroProps) {
  return (
    <section
      data-anime={animated ? "reveal" : undefined}
      data-anime-delay={animated ? "40" : undefined}
      className={cn(
        "space-y-5 rounded-xl border p-6 sm:p-8",
        heroSurfaceClassName[surface],
        className,
      )}
    >
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
  surface?: "steel" | "mesh" | "rail" | "plain";
  className?: string;
  animated?: boolean;
};

const metricSurfaceClassName: Record<NonNullable<PageMetricProps["surface"]>, string> = {
  steel: "border-border bg-card",
  mesh: "border-border bg-card",
  rail: "border-border bg-card",
  plain: "border-border bg-card",
};

export function PageMetric({ label, value, valueClassName, surface = "steel", className, animated = true }: PageMetricProps) {
  return (
    <div
      data-anime={animated ? "reveal" : undefined}
      data-anime-delay={animated ? "90" : undefined}
      className={cn(
        "rounded-lg border p-4",
        metricSurfaceClassName[surface],
        className,
      )}
    >
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className={cn("mt-1 text-2xl font-semibold text-foreground", valueClassName)}>{value}</p>
    </div>
  );
}

type PageSectionProps = {
  children: ReactNode;
  surface?: "steel" | "mesh" | "rail" | "plain";
  className?: string;
};

const sectionSurfaceClassName: Record<NonNullable<PageSectionProps["surface"]>, string> = {
  steel: "border-border bg-card",
  mesh: "border-border bg-card",
  rail: "border-border bg-card",
  plain: "border-border bg-card",
};

export function PageSection({ children, surface = "steel", className }: PageSectionProps) {
  return (
    <section
      data-anime="reveal"
      data-anime-delay="120"
      className={cn(
        "rounded-lg border p-5 sm:p-6",
        sectionSurfaceClassName[surface],
        className,
      )}
    >
      {children}
    </section>
  );
}

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return <div className={cn("section-shell mx-auto flex w-full max-w-7xl flex-col gap-6 py-10 sm:py-14", className)}>{children}</div>;
}

type PageActionZoneProps = {
  children: ReactNode;
  className?: string;
};

export function PageActionZone({ children, className }: PageActionZoneProps) {
  return <section className={cn("rounded-lg border border-border bg-card p-4 sm:p-5", className)}>{children}</section>;
}


