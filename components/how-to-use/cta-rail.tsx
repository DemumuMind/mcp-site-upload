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
    <div className="rounded-3xl border border-cyan-400/25 bg-[linear-gradient(90deg,rgba(10,25,47,0.92),rgba(4,47,70,0.88))] p-6 sm:p-10">
      <h3 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">{title}</h3>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">{description}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {actions.map((action) => (
          <Button
            key={action.id}
            asChild
            variant={action.variant === "primary" ? "default" : "outline"}
            className={cn(
              "h-11 rounded-xl",
              action.variant === "primary"
                ? "bg-blue-500 px-6 text-white hover:bg-blue-400"
                : "border-white/20 bg-slate-950/65 px-6 text-slate-100 hover:bg-slate-900",
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
