import type { Locale } from "@/lib/i18n";

export type SiteNotificationKind = "blog" | "system";

export type SiteNotificationTone = "info" | "success";

export type SiteNotificationItem = {
  id: string;
  kind: SiteNotificationKind;
  tone: SiteNotificationTone;
  title: string;
  description: string;
  href?: string;
  createdAt: string;
};

export type NotificationLocaleDictionary = Record<Locale, string>;
