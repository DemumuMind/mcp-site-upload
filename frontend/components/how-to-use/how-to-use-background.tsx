"use client";

import { GridPattern } from "@/components/ui/grid-pattern";
import { Particles } from "@/components/ui/particles";
import { cn } from "@/lib/utils";

export function HowToUseBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Particles
        className="absolute inset-0"
        quantity={100}
        staticity={20}
        color="#F6A623"
        size={0.8}
      />
      <GridPattern
        width={40}
        height={40}
        x={-1}
        y={-1}
        className={cn(
          "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
          "opacity-[0.03]"
        )}
      />
      <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 size-[600px] rounded-full bg-accent/10 blur-[120px]" />
      <div className="absolute top-1/3 right-0 translate-x-1/4 size-[500px] rounded-full bg-primary/5 blur-[100px]" />
    </div>
  );
}
