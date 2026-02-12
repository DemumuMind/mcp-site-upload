import { cn } from "@/lib/utils";
type BrandMarkProps = {
    className?: string;
    decorative?: boolean;
};
export function BrandMark({ className, decorative = true }: BrandMarkProps) {
    return (<svg viewBox="0 0 64 64" className={cn("size-6", className)} aria-hidden={decorative} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : "DemumuMind logo"} focusable="false">
      <rect x="4" y="4" width="56" height="56" rx="16" fill="#030914" stroke="#1e3a8a" strokeWidth="2.6"/>
      <rect x="9" y="9" width="46" height="46" rx="12" fill="none" stroke="#0ea5e9" strokeOpacity="0.35"/>
      <path d="M20 18V46H30C40 46 46 40 46 32C46 24 40 18 30 18H20Z" fill="none" stroke="#3b82f6" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24 39L31.5 27L37 34L44 24" fill="none" stroke="#22d3ee" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="24" cy="39" r="2.1" fill="#60a5fa"/>
      <circle cx="44" cy="24" r="2.3" fill="#22d3ee"/>
      <path d="M45.6 16.8V19M45.6 22.8V25M42.8 20.8H44.8M46.4 20.8H48.4" stroke="#67e8f9" strokeWidth="1.1"/>
    </svg>);
}
