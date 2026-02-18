import type { ReactNode } from "react";

type SectionLabelProps = {
  children: ReactNode;
};

export function SectionLabel({ children }: SectionLabelProps) {
  return <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">{children}</p>;
}

