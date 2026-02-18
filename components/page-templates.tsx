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
    <section
      data-anime={animated ? "reveal" : undefined}
      data-anime-delay={animated ? "40" : undefined}
      className={cn(
        "relative space-y-5 overflow-hidden rounded-3xl border border-blacksmith bg-[linear-gradient(160deg,rgba(20,24,32,0.95)_0%,rgba(12,14,19,0.98)_100%)] p-6 shadow-[0_30px_60px_-40px_rgba(4,10,21,0.95)] before:pointer-events-none before:absolute before:inset-y-0 before:left-5 before:w-px before:bg-gradient-to-b before:from-transparent before:via-slate-400/30 before:to-transparent after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-white/12 sm:p-8",
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
  className?: string;
  animated?: boolean;
};

export function PageMetric({ label, value, valueClassName, className, animated = true }: PageMetricProps) {
  return (
    <div
      data-anime={animated ? "reveal" : undefined}
      data-anime-delay={animated ? "90" : undefined}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-blacksmith bg-[linear-gradient(180deg,rgba(18,21,27,0.95)_0%,rgba(11,13,18,0.97)_100%)] p-4 transition-transform duration-300 hover:-translate-y-0.5 before:pointer-events-none before:absolute before:inset-y-0 before:left-3 before:w-px before:bg-gradient-to-b before:from-transparent before:via-slate-400/30 before:to-transparent",
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
  className?: string;
};

export function PageSection({ children, className }: PageSectionProps) {
  return (
    <section
      data-anime="reveal"
      data-anime-delay="120"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-blacksmith bg-[linear-gradient(180deg,rgba(17,20,26,0.94)_0%,rgba(10,12,17,0.97)_100%)] p-5 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/12 sm:p-6",
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


