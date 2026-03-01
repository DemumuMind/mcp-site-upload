"use client";

import { Particles } from "@/components/ui/particles";

export function AmbientParticles() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden mix-blend-screen">
      <span className="ambient-stars ambient-stars--a" />
      <span className="ambient-stars ambient-stars--b" />
      <Particles className="absolute inset-0 opacity-78" quantity={120} staticity={22} size={0.8} color="#F6A623" vx={0.016} vy={-0.009} />
      <Particles className="absolute inset-0 opacity-48" quantity={85} staticity={30} size={0.64} color="#56CCF2" vx={-0.01} vy={0.006} />
    </div>
  );
}
