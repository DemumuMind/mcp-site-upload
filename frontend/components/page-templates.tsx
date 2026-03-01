import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/ui/border-beam";
import { BlurFade } from "@/components/ui/blur-fade";

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
      data-page-variant={variant}
      className={cn(
        "min-h-screen bg-background text-foreground",
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
  cyan: "border-primary/40 bg-primary/12 text-primary",
  emerald: "border-primary/30 bg-primary/10 text-primary",
  amber: "border-accent/45 bg-accent/12 text-accent",
  violet: "border-accent/35 bg-accent/10 text-accent",
};

const heroSurfaceClassName: Record<NonNullable<PageHeroProps["surface"]>, string> = {
  steel:
    "border-border/80 bg-card/85 shadow-[0_24px_64px_-36px_hsl(var(--foreground)/0.55)] before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(100deg,hsl(var(--background)/0.03),transparent_38%,hsl(var(--primary)/0.08)_70%,transparent)]",
  mesh:
    "border-border/80 bg-card/80 shadow-[0_24px_64px_-36px_hsl(var(--foreground)/0.45)] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_20%_15%,hsl(var(--primary)/0.16),transparent_48%),linear-gradient(0deg,hsl(var(--foreground)/0.02),hsl(var(--foreground)/0.02)),linear-gradient(90deg,transparent_0,transparent_48%,hsl(var(--border)/0.45)_48.5%,transparent_49%,transparent_100%)] before:bg-[size:auto,auto,24px_24px]",
  rail:
    "border-border/80 bg-card/85 shadow-[0_24px_64px_-36px_hsl(var(--foreground)/0.55)] before:pointer-events-none before:absolute before:inset-0 before:bg-[repeating-linear-gradient(90deg,transparent_0,transparent_18px,hsl(var(--border)/0.7)_18px,hsl(var(--border)/0.7)_19px)]",
  plain: "border-border/80 bg-card/90 shadow-[0_24px_64px_-36px_hsl(var(--foreground)/0.48)]",
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
  const content = (
    <section
      data-hero-surface={surface}
      className={cn(
        "relative isolate overflow-hidden space-y-6 rounded-2xl border p-7 sm:space-y-7 sm:p-11",
        heroSurfaceClassName[surface],
        "transition-transform duration-500 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none",
        className,
      )}
    >
      <div className="motion-reduce:hidden">
        <BorderBeam size={300} duration={12} delay={0} />
      </div>

      {eyebrow ? (
        <div
          className={cn(
            "inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase",
            badgeToneClassName[badgeTone],
          )}
        >
          {eyebrow}
        </div>
      ) : null}

      <div className="space-y-4 sm:space-y-5">
        <h1 className="text-balance text-4xl leading-[0.98] font-semibold tracking-[-0.02em] text-foreground sm:text-6xl">{title}</h1>
        {description ? <p className="max-w-4xl text-base leading-relaxed text-muted-foreground/95 sm:text-lg">{description}</p> : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-3.5 pt-2">{actions}</div> : null}
      {metrics ? <div className="grid gap-4 pt-5 sm:grid-cols-2 xl:grid-cols-4">{metrics}</div> : null}
    </section>
  );

  if (animated) {
    return <BlurFade delay={0.1}>{content}</BlurFade>;
  }

  return content;
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
  steel: "border-border/80 bg-background/80 shadow-[inset_0_1px_0_hsl(var(--background)/0.5)]",
  mesh:
    "border-border/80 bg-background/75 shadow-[inset_0_1px_0_hsl(var(--background)/0.5)] before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(90deg,transparent_0,transparent_50%,hsl(var(--border)/0.35)_50.5%,transparent_51%,transparent_100%)] before:bg-[size:18px_18px]",
  rail:
    "border-border/80 bg-background/78 shadow-[inset_0_1px_0_hsl(var(--background)/0.5)] before:pointer-events-none before:absolute before:inset-0 before:bg-[repeating-linear-gradient(0deg,transparent_0,transparent_20px,hsl(var(--border)/0.42)_20px,hsl(var(--border)/0.42)_21px)]",
  plain: "border-border/80 bg-background/82 shadow-[inset_0_1px_0_hsl(var(--background)/0.5)]",
};

export function PageMetric({ label, value, valueClassName, surface = "steel", className }: PageMetricProps) {
  const formatted = typeof value === "number" ? value.toLocaleString("en-US") : value;
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-xl border p-5 transition-all duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:bg-muted/20 motion-safe:hover:shadow-[0_16px_30px_-24px_hsl(var(--foreground)/0.6)] motion-reduce:transition-none",
        metricSurfaceClassName[surface],
        className,
      )}
    >
      <p className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">{label}</p>
      <p className={cn("mt-2.5 text-3xl leading-tight font-semibold tracking-[-0.01em] text-foreground", valueClassName)}>{formatted}</p>
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
    "border-border/80 bg-card/86 shadow-[0_18px_44px_-32px_hsl(var(--foreground)/0.55)] before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(145deg,hsl(var(--background)/0.04),transparent_42%)]",
  mesh:
    "border-border/80 bg-card/84 shadow-[0_18px_44px_-32px_hsl(var(--foreground)/0.5)] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_10%_0%,hsl(var(--primary)/0.14),transparent_46%),linear-gradient(90deg,transparent_0,transparent_54%,hsl(var(--border)/0.4)_54.5%,transparent_55%,transparent_100%)] before:bg-[size:auto,26px_26px]",
  rail:
    "border-border/80 bg-card/85 shadow-[0_18px_44px_-32px_hsl(var(--foreground)/0.55)] before:pointer-events-none before:absolute before:inset-0 before:bg-[repeating-linear-gradient(90deg,transparent_0,transparent_22px,hsl(var(--border)/0.6)_22px,hsl(var(--border)/0.6)_23px)]",
  plain: "border-border/80 bg-card/88 shadow-[0_18px_44px_-32px_hsl(var(--foreground)/0.52)]",
};

export function PageSection({ children, surface = "steel", className }: PageSectionProps) {
  return (
    <BlurFade delay={0.15}>
      <section
        className={cn(
          "relative isolate overflow-hidden rounded-2xl border p-6 sm:p-9",
          sectionSurfaceClassName[surface],
          "transition-transform duration-300 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none",
          className,
        )}
      >
        {children}
      </section>
    </BlurFade>
  );
}

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div
      className={cn(
        "section-shell mx-auto flex w-full max-w-7xl flex-col gap-9 px-4 py-12 sm:gap-10 sm:px-6 sm:py-16 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

type PageActionZoneProps = {
  children: ReactNode;
  className?: string;
};

export function PageActionZone({ children, className }: PageActionZoneProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-border/80 bg-card/86 p-6 shadow-[0_18px_44px_-32px_hsl(var(--foreground)/0.5)] before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(120deg,hsl(var(--accent)/0.08),transparent_42%,hsl(var(--primary)/0.1)_78%,transparent)] sm:p-8",
        "transition-all duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_24px_52px_-34px_hsl(var(--foreground)/0.58)] motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </section>
  );
}

