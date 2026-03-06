import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BlurFade } from "@/components/ui/blur-fade";

type PageVariant = "default" | "directory" | "ops" | "content" | "marketing";

type PageFrameProps = {
  children: ReactNode;
  variant?: PageVariant;
  className?: string;
};

export function PageFrame({ children, variant = "default", className }: PageFrameProps) {
  return (
    <div data-page-variant={variant} className={cn("min-h-screen bg-background text-foreground", className)}>
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
  cyan: "text-primary",
  emerald: "text-primary",
  amber: "text-accent",
  violet: "text-accent",
};

const heroSurfaceClassName: Record<NonNullable<PageHeroProps["surface"]>, string> = {
  steel: "border-b border-border/60 bg-[linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_72%)]",
  mesh: "border-b border-border/60 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_24%),radial-gradient(circle_at_82%_16%,hsl(var(--accent)/0.12),transparent_18%),linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_72%)]",
  rail: "border-b border-border/60 bg-[linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_72%)]",
  plain: "border-b border-border/60 bg-[linear-gradient(180deg,hsl(var(--surface-1)),hsl(var(--background))_72%)]",
};

export function PageHero({ eyebrow, title, description, actions, metrics, badgeTone = "cyan", surface = "steel", className, animated = true }: PageHeroProps) {
  const content = (
    <section data-hero-surface={surface} className={cn("relative isolate overflow-hidden", heroSurfaceClassName[surface], className)}>
      <div className="section-shell hero-space">
        {eyebrow ? <div className={cn("type-eyebrow", badgeToneClassName[badgeTone])}>{eyebrow}</div> : null}
        <div className="max-w-5xl space-y-4">
          <h1 className="type-hero-title text-foreground">{title}</h1>
          {description ? <p className="max-w-3xl type-body-lg text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div> : null}
        {metrics ? <div className="mt-8 grid gap-px border-y border-border/60 bg-border/60 sm:grid-cols-2 xl:grid-cols-4">{metrics}</div> : null}
      </div>
    </section>
  );

  return animated ? <BlurFade delay={0.08}>{content}</BlurFade> : content;
}

type PageMetricProps = {
  label: ReactNode;
  value: ReactNode;
  valueClassName?: string;
  surface?: "steel" | "mesh" | "rail" | "plain";
  className?: string;
};

export function PageMetric({ label, value, valueClassName, className }: PageMetricProps) {
  const formatted = typeof value === "number" ? value.toLocaleString("en-US") : value;
  return (
    <div className={cn("bg-background px-5 py-5 sm:px-6", className)}>
      <p className="text-[11px] tracking-[0.22em] text-muted-foreground uppercase">{label}</p>
      <p className={cn("mt-3 text-4xl font-semibold tracking-[-0.04em] text-foreground", valueClassName)}>{formatted}</p>
    </div>
  );
}

type PageSectionProps = {
  children: ReactNode;
  surface?: "steel" | "mesh" | "rail" | "plain";
  className?: string;
};

export function PageSection({ children, className }: PageSectionProps) {
  return (
    <BlurFade delay={0.12}>
      <section className={cn("editorial-panel", className)}>{children}</section>
    </BlurFade>
  );
}

type PageShellProps = { children: ReactNode; className?: string; };
export function PageShell({ children, className }: PageShellProps) {
  return <div className={cn("section-shell page-stack section-space", className)}>{children}</div>;
}

type PageActionZoneProps = { children: ReactNode; className?: string; };
export function PageActionZone({ children, className }: PageActionZoneProps) {
  return <section className={cn("editorial-panel", className)}>{children}</section>;
}
