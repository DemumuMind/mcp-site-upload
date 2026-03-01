"use client";

import { useEffect, useRef } from "react";
import { BLOG_PROGRESS_MILESTONES, toPrimaryTag } from "@/lib/blog-v2/analytics";
import { trackConsented } from "@/lib/analytics/track-consented";

type BlogEngagementTrackerProps = {
  slug: string;
  title: string;
  tags: string[];
};

function getProgressPercent(): number {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return 0;
  }

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const viewportHeight = window.innerHeight || 0;
  const docHeight = document.documentElement.scrollHeight || 0;
  const scrollable = Math.max(1, docHeight - viewportHeight);
  return Math.max(0, Math.min(100, (scrollTop / scrollable) * 100));
}

export function BlogEngagementTracker({ slug, title, tags }: BlogEngagementTrackerProps) {
  const milestoneSetRef = useRef(new Set<number>());
  const completeTrackedRef = useRef(false);
  const primaryTag = toPrimaryTag(tags);

  useEffect(() => {
    function onScroll() {
      const progress = getProgressPercent();

      for (const milestone of BLOG_PROGRESS_MILESTONES) {
        if (progress >= milestone && !milestoneSetRef.current.has(milestone)) {
          milestoneSetRef.current.add(milestone);
          trackConsented("blog_read_progress", {
            slug,
            title,
            topic: primaryTag,
            milestone,
          });
        }
      }

      if (!completeTrackedRef.current && progress >= 98) {
        completeTrackedRef.current = true;
        trackConsented("blog_read_complete", {
          slug,
          title,
          topic: primaryTag,
        });
      }
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [slug, title, primaryTag]);

  return null;
}
