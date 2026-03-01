import { useId } from "react";
import { cn } from "@/lib/utils";
type BrandMarkProps = {
    className?: string;
    decorative?: boolean;
};
export function BrandMark({ className, decorative = true }: BrandMarkProps) {
    const gradientId = useId();
    const glowId = useId();

    return (
        <svg
            viewBox="0 0 64 64"
            className={cn("size-6", className)}
            aria-hidden={decorative}
            role={decorative ? undefined : "img"}
            aria-label={decorative ? undefined : "DemumuMind logo"}
            focusable="false"
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F6A623" />
                    <stop offset="100%" stopColor="#FFCC4D" />
                </linearGradient>
                <filter id={glowId}>
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Forged Outer Chamber */}
            <rect x="4" y="4" width="56" height="56" rx="10" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" />
            <rect x="8" y="8" width="48" height="48" rx="6" fill="currentColor" opacity="0.03" />

            {/* Abstract Hexagonal Core - No Letters */}
            <path
                d="M32 14L48 24V40L32 50L16 40V24L32 14Z"
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="3.5"
                strokeLinejoin="round"
                filter={`url(#${glowId})`}
            />

            {/* Internal Integration Matrix */}
            <path
                d="M24 24L40 40M40 24L24 40"
                stroke={`url(#${gradientId})`}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeOpacity="0.5"
            />

            {/* Symmetry technical nodes (Cyan) */}
            <circle cx="32" cy="14" r="2.5" fill="#00E5FF" fillOpacity="0.9">
                <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="32" cy="50" r="2.5" fill="#00E5FF" fillOpacity="0.9" />

            {/* Detail Accents */}
            <path d="M48 12L52 8M12 52L8 48" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" strokeLinecap="round" />
        </svg>
    );
}
