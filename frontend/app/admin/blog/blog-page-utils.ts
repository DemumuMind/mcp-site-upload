import type { AdminBlogRunStatus } from "@/lib/admin-blog-runs";

export type AdminBlogPageSearchParams = {
  success?: string;
  error?: string;
  slug?: string;
  research?: string;
  sources?: string;
  status?: string;
  from?: string;
};

export function formatError(error?: string) {
  if (!error) {
    return null;
  }
  if (error === "missing_required_fields") {
    return "Please fill all required fields before running automation.";
  }
  return error;
}

export function toStatusFilter(value: string | undefined): AdminBlogRunStatus | undefined {
  if (value === "started" || value === "success" || value === "failed") {
    return value;
  }
  return undefined;
}
