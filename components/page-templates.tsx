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
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden border-t border-blacksmith bg-[radial-gradient(120%_90%_at_100%_-10%,rgba(91,151,255,0.12)_0%,rgba(9,10,13,0)_52%),linear-gradient(180deg,rgba(12,13,17,0.96)_0%,rgba(8,9,12,0.98)_100%)] text-foreground before:pointer-events-none before:absolute before:inset-y-0 before:left-4 before:w-px before:bg-gradient-to-b before:from-transparent before:via-slate-400/25 before:to-transparent after:pointer-events-none after:absolute after:inset-y-0 after:right-4 after:w-px after:bg-gradient-to-b after:from-transparent after:via-slate-400/20 after:to-transparent",
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
  cyan: "border-primary/40 bg-primary/10 text-primary",
  emerald: "border-primary/40 bg-primary/10 text-primary",
  amber: "border-primary/40 bg-primary/10 text-primary",
  violet: "border-primary/40 bg-primary/10 text-primary",
};

const heroSurfaceClassName: Record<NonNullable<PageHeroProps["surface"]>, string> = {
  steel:
    "border-blacksmith bg-[linear-gradient(160deg,rgba(20,24,32,0.95)_0%,rgba(12,14,19,0.98)_100%)] before:bg-gradient-to-b before:via-slate-400/30 after:bg-white/12",
  mesh:
    "border-blue-400/25 bg-[radial-gradient(circle_at_12%_18%,rgba(56,189,248,0.18),transparent_35%),linear-gradient(155deg,rgba(13,18,28,0.95)_0%,rgba(9,12,20,0.98)_100%)] before:bg-gradient-to-b before:via-blue-300/40 after:bg-blue-200/20",
  rail:
    "border-violet-300/30 bg-[linear-gradient(132deg,rgba(26,20,44,0.88)_0%,rgba(12,14,24,0.97)_52%,rgba(8,9,15,0.99)_100%)] before:bg-gradient-to-b before:via-violet-300/40 after:bg-violet-200/18",
  plain:
    "border-blacksmith/80 bg-[linear-gradient(180deg,rgba(15,17,22,0.95)_0%,rgba(10,11,15,0.98)_100%)] before:bg-gradient-to-b before:via-slate-500/20 after:bg-white/8",
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
        "relative space-y-5 overflow-hidden rounded-3xl border p-6 shadow-[0_30px_60px_-40px_rgba(4,10,21,0.95)] before:pointer-events-none before:absolute before:inset-y-0 before:left-5 before:w-px before:from-transparent before:to-transparent after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-px sm:p-8",
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
  steel:
    "border-blacksmith bg-[linear-gradient(180deg,rgba(18,21,27,0.95)_0%,rgba(11,13,18,0.97)_100%)] before:bg-gradient-to-b before:via-slate-400/30",
  mesh:
    "border-cyan-300/25 bg-[radial-gradient(circle_at_14%_12%,rgba(56,189,248,0.16),transparent_40%),linear-gradient(180deg,rgba(13,18,24,0.95)_0%,rgba(10,12,18,0.97)_100%)] before:bg-gradient-to-b before:via-cyan-200/35",
  rail:
    "border-violet-300/25 bg-[linear-gradient(180deg,rgba(22,17,36,0.9)_0%,rgba(11,12,20,0.97)_100%)] before:bg-gradient-to-b before:via-violet-200/35",
  plain:
    "border-blacksmith/80 bg-[linear-gradient(180deg,rgba(15,16,21,0.92)_0%,rgba(10,11,16,0.96)_100%)] before:bg-gradient-to-b before:via-slate-500/20",
};

export function PageMetric({ label, value, valueClassName, surface = "steel", className, animated = true }: PageMetricProps) {
  return (
    <div
      data-anime={animated ? "reveal" : undefined}
      data-anime-delay={animated ? "90" : undefined}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 transition-transform duration-300 hover:-translate-y-0.5 before:pointer-events-none before:absolute before:inset-y-0 before:left-3 before:w-px before:from-transparent before:to-transparent",
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
  steel:
    "border-blacksmith bg-[linear-gradient(180deg,rgba(17,20,26,0.94)_0%,rgba(10,12,17,0.97)_100%)] before:bg-white/12",
  mesh:
    "border-blue-400/25 bg-[radial-gradient(circle_at_86%_18%,rgba(56,189,248,0.14),transparent_42%),linear-gradient(180deg,rgba(13,18,27,0.94)_0%,rgba(9,12,19,0.97)_100%)] before:bg-blue-200/22",
  rail:
    "border-violet-300/25 bg-[linear-gradient(180deg,rgba(20,16,34,0.92)_0%,rgba(10,11,19,0.97)_100%)] before:bg-violet-200/20",
  plain:
    "border-blacksmith/80 bg-[linear-gradient(180deg,rgba(15,17,22,0.92)_0%,rgba(10,11,16,0.96)_100%)] before:bg-white/8",
};

export function PageSection({ children, surface = "steel", className }: PageSectionProps) {
  return (
    <section
      data-anime="reveal"
      data-anime-delay="120"
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px sm:p-6",
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
  return <section className={cn("rounded-2xl border border-primary/30 bg-primary/10 p-4 sm:p-5", className)}>{children}</section>;
}


