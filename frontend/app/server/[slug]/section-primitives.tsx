import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";

type SectionCardProps = { children: ReactNode };
type SectionLabelProps = { children: ReactNode; className?: string };
type OutlineBadgeProps = { children: ReactNode; className?: string };
type ExternalTextLinkProps = { href: string; children: ReactNode };

export function SectionCard({ children }: SectionCardProps) { return <div className="border border-border/60 bg-background/72 p-4 backdrop-blur-sm sm:p-5">{children}</div>; }
export function SectionLabel({ children, className = "mb-3" }: SectionLabelProps) { return <p className={`${className} text-[11px] tracking-[0.22em] text-muted-foreground uppercase`}>{children}</p>; }
export function OutlineBadge({ children, className = "text-muted-foreground" }: OutlineBadgeProps) { return <Badge variant="outline" className={`border-border/70 bg-transparent ${className}`}>{children}</Badge>; }
export function ExternalTextLink({ href, children }: ExternalTextLinkProps) { return <Link href={href} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">{children}</Link>; }
