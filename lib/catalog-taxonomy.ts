import type { McpServer } from "@/lib/types";

export const CATALOG_CATEGORY_OPTIONS = [
  "All Categories",
  "Browser Automation",
  "Finance & Fintech",
  "Communication",
  "Developer Tools",
  "Search",
  "Marketing",
  "Databases",
  "Art & Culture",
  "Cloud Platforms",
  "Monitoring",
  "Customer Data Platforms",
  "Vector Databases",
  "Data Science Tools",
  "Security",
  "Command Line",
  "Content Management Systems",
  "Smart Home",
  "Gaming",
  "Blockchain",
  "Sports",
  "Knowledge & Memory",
  "Travel & Transportation",
  "Version Control",
  "File Systems",
  "Location Services",
  "News & Information",
  "Document Conversion",
  "Education",
  "Video Platforms",
  "Health & Fitness",
  "Social Media",
  "Message Queues",
  "Music",
  "Calendar & Productivity",
  "Healthcare",
  "Other Tools and Integrations",
  "News & Media",
  "Space & Astronomy",
  "Entertainment",
  "Video & Media",
] as const;

export const CATALOG_LANGUAGE_OPTIONS = [
  "All Languages",
  "Python",
  "JavaScript",
  "TypeScript",
  "Go",
  "Rust",
  "Java, Python",
  "C#",
  "Markdown",
  "Other",
  "Java",
  "Swift",
  "C++",
  "Scala",
] as const;

export const CATALOG_VISIBLE_TAG_LIMIT = 24;

const TAG_DOT_CLASSES = [
  "bg-sky-400",
  "bg-emerald-400",
  "bg-violet-400",
  "bg-fuchsia-400",
  "bg-amber-400",
  "bg-rose-400",
] as const;

const SERVER_LANGUAGE_BY_SLUG: Record<string, string> = {
  linear: "TypeScript",
  "google-drive": "Python",
  "brave-search": "JavaScript",
  apify: "TypeScript",
  weatherkit: "Swift",
  slack: "JavaScript",
  github: "TypeScript",
  notion: "JavaScript",
  airtable: "JavaScript",
  stripe: "Go",
  gitlab: "Other",
  asana: "JavaScript",
  jira: "Java",
  postgres: "Other",
  shopify: "TypeScript",
  hubspot: "JavaScript",
  trello: "JavaScript",
  discord: "JavaScript",
  figma: "TypeScript",
  sentry: "Python",
};

export function getTagDotClass(tag: string): string {
  let hash = 0;

  for (let index = 0; index < tag.length; index += 1) {
    hash = (hash + tag.charCodeAt(index) * 17) % 10_000;
  }

  return TAG_DOT_CLASSES[hash % TAG_DOT_CLASSES.length];
}

export function inferServerLanguage(mcpServer: McpServer): string {
  return SERVER_LANGUAGE_BY_SLUG[mcpServer.slug] || "Other";
}
