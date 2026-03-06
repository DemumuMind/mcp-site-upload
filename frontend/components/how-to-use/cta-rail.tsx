"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HowToUseLocaleAction } from "@/lib/content/how-to-use";
import { cn } from "@/lib/utils";

type CtaRailProps = {
  title: string;
  description: string;
  actions: HowToUseLocaleAction[];
  onActionClick: (action: HowToUseLocaleAction) => void;
};

export function CtaRail({ title, description, actions, onActionClick }: CtaRailProps) {
  return (
    <div className="border border-border/60 px-6 py-8 sm:px-8 sm:py-10">
      <p className="text-[11px] tracking-[0.22em] text-primary uppercase">Next step</p>
      <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">{title}</h3>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {actions.map((action) => (
          <Button
            key={action.id}
            asChild
            variant={action.variant === "primary" ? "default" : "outline"}
            className={cn(
              "h-11 rounded-none px-6",
              action.variant === "primary" ? "" : "border-border/80 bg-transparent",
            )}
          >
            <Link href={action.href} onClick={() => onActionClick(action)}>
              {action.label}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
