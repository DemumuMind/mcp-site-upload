import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import type { ReactNode } from "react";

type SectionCardProps = {
  children: ReactNode;
};

type SectionLabelProps = {
  children: ReactNode;
  className?: string;
};

type OutlineBadgeProps = {
  children: ReactNode;
  className?: string;
};

type ExternalTextLinkProps = {
  href: string;
  children: ReactNode;
};

export function SectionCard({ children }: SectionCardProps) {
  return <div className="rounded-xl border border-border bg-card/70 p-4">{children}</div>;
}

export function SectionLabel({ children, className = "mb-3" }: SectionLabelProps) {
  return (
    <p className={`${className} text-xs font-medium tracking-wide text-muted-foreground uppercase`}>
      {children}
    </p>
  );
}

export function OutlineBadge({ children, className = "text-muted-foreground" }: OutlineBadgeProps) {
  return (
    <Badge variant="outline" className={`border-border ${className}`}>
      {children}
    </Badge>
  );
}

export function ExternalTextLink({ href, children }: ExternalTextLinkProps) {
  return (
    <Link href={href} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
      {children}
    </Link>
  );
}
