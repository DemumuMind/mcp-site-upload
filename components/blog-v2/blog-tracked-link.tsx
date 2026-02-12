"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { trackConsented } from "@/lib/analytics/track-consented";

type BlogTrackedLinkProps = {
  href: string;
  className?: string;
  eventName: string;
  payload: Record<string, string | number | boolean>;
  children: ReactNode;
};

export function BlogTrackedLink({
  href,
  className,
  eventName,
  payload,
  children,
}: BlogTrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackConsented(eventName, payload);
      }}
    >
      {children}
    </Link>
  );
}
