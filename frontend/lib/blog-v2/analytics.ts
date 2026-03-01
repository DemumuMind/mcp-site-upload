export const BLOG_PROGRESS_MILESTONES = [25, 50, 75, 100] as const;

export type BlogProgressMilestone = (typeof BLOG_PROGRESS_MILESTONES)[number];

export type BlogTrackingContext = {
  slug: string;
  title: string;
  tag: string;
};

export function toPrimaryTag(tags: string[]): string {
  return tags[0] ?? "general";
}
