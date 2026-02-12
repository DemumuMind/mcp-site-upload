import { getAllBlogPosts } from "@/lib/blog/service";
import { tr, type Locale } from "@/lib/i18n";
import type { SiteNotificationItem } from "@/lib/notifications/types";

const DEFAULT_NOTIFICATIONS_LIMIT = 5;

const systemNotificationDate = "2026-02-10T09:00:00.000Z";

function clampLimit(limit?: number): number {
  if (!limit || !Number.isFinite(limit)) {
    return DEFAULT_NOTIFICATIONS_LIMIT;
  }

  return Math.max(1, Math.min(Math.floor(limit), 20));
}

function parseTimestamp(value: string): number {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function createSystemNotification(locale: Locale): SiteNotificationItem {
  return {
    id: "system:automation-ready",
    kind: "system",
    tone: "success",
    title: tr(locale, "Automation mode is active", "Автоматизация активна"),
    description: tr(
      locale,
      "Blog pipeline now runs with deep research and multi-step verification before publishing.",
      "Перед публикацией блог проходит deep research и многоэтапную верификацию.",
    ),
    href: "/admin/blog",
    createdAt: systemNotificationDate,
  };
}

function toBlogNotification(post: Awaited<ReturnType<typeof getAllBlogPosts>>[number], locale: Locale): SiteNotificationItem {
  const localizedTitle = post.locale[locale]?.title || post.locale.en.title;
  const localizedExcerpt = post.locale[locale]?.excerpt || post.locale.en.excerpt;

  return {
    id: `blog:${post.slug}`,
    kind: "blog",
    tone: "info",
    title: tr(locale, "New blog article", "Новая статья в блоге"),
    description: `${localizedTitle} — ${localizedExcerpt}`,
    href: `/blog/${post.slug}`,
    createdAt: post.publishedAt,
  };
}

export async function getHeaderNotifications(
  locale: Locale,
  options?: { limit?: number },
): Promise<SiteNotificationItem[]> {
  const limit = clampLimit(options?.limit);

  try {
    const posts = await getAllBlogPosts();
    const blogNotifications = posts.slice(0, 4).map((post) => toBlogNotification(post, locale));
    const notifications = [createSystemNotification(locale), ...blogNotifications]
      .sort((left, right) => parseTimestamp(right.createdAt) - parseTimestamp(left.createdAt))
      .slice(0, limit);

    return notifications;
  } catch {
    return [createSystemNotification(locale)].slice(0, limit);
  }
}
