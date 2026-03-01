import { tr, type Locale } from "@/lib/i18n";
import type { AccountProfileInput } from "@/lib/account-profile-schema";

export type AccountSubmissionRow = {
  id: string;
  created_at: string | null;
  name: string | null;
  slug: string | null;
  category: string | null;
  auth_type: string | null;
  status: string | null;
};

export type AccountAuthEventRow = {
  id: string;
  created_at: string | null;
  event_type: string;
  ip_address: string | null;
};

const ACCOUNT_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function getStatusLabel(locale: Locale, status: string | null): string {
  if (status === "pending") return tr(locale, "Pending", "Pending");
  if (status === "rejected") return tr(locale, "Rejected", "Rejected");
  return tr(locale, "Active", "Active");
}

export function getStatusClass(status: string | null): string {
  if (status === "pending") return "border-amber-400/35 bg-amber-500/10 text-amber-200";
  if (status === "rejected") return "border-rose-400/35 bg-rose-500/10 text-rose-200";
  return "border-emerald-400/35 bg-emerald-500/10 text-emerald-200";
}

export function getAuthLabel(locale: Locale, authType: string | null): string {
  if (authType === "oauth") return "OAuth";
  if (authType === "api_key") return "API Key";
  return tr(locale, "Open / No Auth", "Open / No Auth");
}

export function formatDate(dateValue: string | null, locale: Locale): string {
  if (!dateValue) return tr(locale, "Unknown date", "Unknown date");
  return ACCOUNT_DATE_FORMATTER.format(new Date(dateValue));
}

function getMetadataString(metadata: unknown, key: string): string {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return "";
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

export function normalizeAvatarUrl(value: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function getDisplayName(locale: Locale, profile: AccountProfileInput, email: string | null): string {
  if (profile.fullName) return profile.fullName;
  if (profile.username) return profile.username;
  if (email) return email.split("@")[0] || email;
  return tr(locale, "User", "User");
}

function getInitials(displayName: string): string {
  const words = displayName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "U";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

export function getShortUserId(userId: string): string {
  if (userId.length <= 12) return userId;
  return `${userId.slice(0, 8)}...${userId.slice(-4)}`;
}

type UserInput = {
  id: string;
  email?: string | null;
  created_at: string | null;
  last_sign_in_at?: string | null;
  email_confirmed_at?: string | null;
  user_metadata?: unknown;
};

export function buildAccountViewModel(
  locale: Locale,
  user: UserInput,
  submissions: AccountSubmissionRow[],
  authEvents: AccountAuthEventRow[],
) {
  const pendingCount = submissions.filter(submission => submission.status === "pending").length;
  const rejectedCount = submissions.filter(submission => submission.status === "rejected").length;
  const activeCount = submissions.length - pendingCount - rejectedCount;

  const initialProfile: AccountProfileInput = {
    fullName: getMetadataString(user.user_metadata, "full_name"),
    username: getMetadataString(user.user_metadata, "username"),
    avatarUrl: getMetadataString(user.user_metadata, "avatar_url"),
    website: getMetadataString(user.user_metadata, "website"),
    bio: getMetadataString(user.user_metadata, "bio"),
  };

  const displayName = getDisplayName(locale, initialProfile, user.email ?? null);
  const initials = getInitials(displayName);
  const avatarUrl = normalizeAvatarUrl(initialProfile.avatarUrl);
  const isEmailVerified = Boolean(user.email_confirmed_at);

  return {
    pendingCount,
    rejectedCount,
    activeCount,
    initialProfile,
    displayName,
    initials,
    avatarUrl,
    isEmailVerified,
    submissions,
    authEvents,
  };
}
