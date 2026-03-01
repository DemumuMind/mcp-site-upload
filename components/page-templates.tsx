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
  cyan: "border-primary/35 bg-primary/10 text-primary",
  emerald: "border-emerald-500/35 bg-emerald-500/10 text-emerald-400",
  amber: "border-accent/35 bg-accent/10 text-accent",
  violet: "border-violet-500/35 bg-violet-500/10 text-violet-400",
};

const heroSurfaceClassName: Record<NonNullable<PageHeroProps["surface"]>, string> = {
  steel: "border-blacksmith bg-card/40 backdrop-blur-sm shadow-2xl shadow-primary/5",
  mesh: "border-blacksmith bg-card/40 backdrop-blur-sm shadow-2xl shadow-primary/5",
  rail: "border-blacksmith bg-card/40 backdrop-blur-sm shadow-2xl shadow-primary/5",
  plain: "border-blacksmith bg-card/40 backdrop-blur-sm shadow-2xl shadow-primary/5",
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
        "relative overflow-hidden space-y-5 rounded-2xl border p-6 sm:p-10",
        heroSurfaceClassName[surface],
        className,
      )}
    >
      <BorderBeam size={300} duration={12} delay={0} />

      {eyebrow ? (
        <div className={cn("inline-flex w-fit items-center rounded-full border px-3 py-1 text-[10px] font-bold tracking-[0.14em] uppercase", badgeToneClassName[badgeTone])}>
          {eyebrow}
        </div>
      ) : null}

      <div className="space-y-4">
        <h1 className="font-serif text-4xl leading-tight font-semibold tracking-tight text-foreground sm:text-6xl">{title}</h1>
        {description ? <p className="max-w-4xl text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p> : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-3 pt-2">{actions}</div> : null}
      {metrics ? <div className="grid gap-4 pt-4 sm:grid-cols-2 xl:grid-cols-4">{metrics}</div> : null}
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
  steel: "border-blacksmith bg-background/50",
  mesh: "border-blacksmith bg-background/50",
  rail: "border-blacksmith bg-background/50",
  plain: "border-blacksmith bg-background/50",
};

export function PageMetric({ label, value, valueClassName, surface = "steel", className }: PageMetricProps) {
  const formatted = typeof value === "number" ? value.toLocaleString("en-US") : value;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-5 transition-colors hover:bg-muted/30",
        metricSurfaceClassName[surface],
        className,
      )}
    >
      <p className="text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase">{label}</p>
      <p className={cn("mt-2 text-3xl font-semibold text-foreground", valueClassName)}>{formatted}</p>
    </div>
  );
}

type PageSectionProps = {
  children: ReactNode;
  surface?: "steel" | "mesh" | "rail" | "plain";
  className?: string;
};

const sectionSurfaceClassName: Record<NonNullable<PageSectionProps["surface"]>, string> = {
  steel: "border-blacksmith bg-card/40 backdrop-blur-sm",
  mesh: "border-blacksmith bg-card/40 backdrop-blur-sm",
  rail: "border-blacksmith bg-card/40 backdrop-blur-sm",
  plain: "border-blacksmith bg-card/40 backdrop-blur-sm",
};

export function PageSection({ children, surface = "steel", className }: PageSectionProps) {
  return (
    <BlurFade delay={0.15}>
      <section
        className={cn(
          "rounded-2xl border p-6 sm:p-8",
          sectionSurfaceClassName[surface],
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
  return <div className={cn("section-shell mx-auto flex w-full max-w-7xl flex-col gap-8 py-10 sm:py-16", className)}>{children}</div>;
}

type PageActionZoneProps = {
  children: ReactNode;
  className?: string;
};

export function PageActionZone({ children, className }: PageActionZoneProps) {
  return <section className={cn("rounded-2xl border border-blacksmith bg-card/40 backdrop-blur-sm p-5 sm:p-7", className)}>{children}</section>;
}

