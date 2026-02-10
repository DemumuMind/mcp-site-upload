"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, CircleDot, Filter, Megaphone, Trash2 } from "lucide-react";

import { tr, type Locale } from "@/lib/i18n";
import type { SiteNotificationItem } from "@/lib/notifications/types";
import { cn } from "@/lib/utils";

const READ_NOTIFICATIONS_STORAGE_KEY = "demumumind.notifications.read.v1";
const DISMISSED_NOTIFICATIONS_STORAGE_KEY = "demumumind.notifications.dismissed.v1";

type SiteNotificationCenterProps = {
  locale: Locale;
  notifications: SiteNotificationItem[];
};

function loadStoredNotificationIds(key: string): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

function formatNotificationDate(value: string, locale: Locale): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export function SiteNotificationCenter({ locale, notifications }: SiteNotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(() =>
    typeof window === "undefined" ? [] : loadStoredNotificationIds(READ_NOTIFICATIONS_STORAGE_KEY),
  );
  const [dismissedIds, setDismissedIds] = useState<string[]>(() =>
    typeof window === "undefined" ? [] : loadStoredNotificationIds(DISMISSED_NOTIFICATIONS_STORAGE_KEY),
  );
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(READ_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(readIds));
  }, [readIds]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(DISMISSED_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(dismissedIds));
  }, [dismissedIds]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleDocumentClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (rootRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const readIdSet = useMemo(() => new Set(readIds), [readIds]);
  const dismissedIdSet = useMemo(() => new Set(dismissedIds), [dismissedIds]);

  const availableNotifications = useMemo(
    () => notifications.filter((notification) => !dismissedIdSet.has(notification.id)),
    [notifications, dismissedIdSet],
  );

  const visibleNotifications = useMemo(
    () =>
      showOnlyUnread
        ? availableNotifications.filter((notification) => !readIdSet.has(notification.id))
        : availableNotifications,
    [availableNotifications, showOnlyUnread, readIdSet],
  );

  const unreadCount = useMemo(
    () => availableNotifications.reduce((count, item) => count + (readIdSet.has(item.id) ? 0 : 1), 0),
    [availableNotifications, readIdSet],
  );

  function markAsRead(notificationId: string) {
    setReadIds((current) => {
      if (current.includes(notificationId)) {
        return current;
      }

      return [...current, notificationId];
    });
  }

  function markAllAsRead() {
    const notificationIds = availableNotifications.map((notification) => notification.id);
    setReadIds((current) => [...new Set([...current, ...notificationIds])]);
  }

  function clearVisibleNotifications() {
    const notificationIds = visibleNotifications.map((notification) => notification.id);

    if (notificationIds.length === 0) {
      return;
    }

    setDismissedIds((current) => [...new Set([...current, ...notificationIds])]);
  }

  const panelLabel = tr(locale, "Notifications", "Уведомления");
  const emptyStateLabel = showOnlyUnread
    ? tr(locale, "No unread notifications.", "Непрочитанных уведомлений нет.")
    : tr(locale, "No notifications yet.", "Пока уведомлений нет.");
  const markAllLabel = tr(locale, "Mark all read", "Прочитать всё");
  const clearLabel = tr(locale, "Clear visible", "Очистить видимые");
  const filterLabel = showOnlyUnread
    ? tr(locale, "Show all", "Показать все")
    : tr(locale, "Unread only", "Только непрочитанные");

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={cn(
          "inline-flex h-11 min-w-11 items-center justify-center rounded-full border px-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:h-10",
          unreadCount > 0
            ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-100 hover:bg-cyan-400/20"
            : "border-white/15 bg-slate-900/70 text-slate-300 hover:bg-slate-900 hover:text-white",
        )}
        onClick={() => {
          setIsOpen((current) => !current);
        }}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={panelLabel}
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 inline-flex min-w-[1.05rem] items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-semibold leading-4 text-white">
            {Math.min(unreadCount, 99)}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <section
          role="dialog"
          aria-label={panelLabel}
          className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-[min(92vw,24rem)] overflow-hidden rounded-xl border border-white/15 bg-slate-950/95 shadow-2xl backdrop-blur-2xl"
        >
          <header className="space-y-2 border-b border-white/10 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-100">{panelLabel}</p>
              <button
                type="button"
                onClick={() => {
                  setShowOnlyUnread((current) => !current);
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-slate-300 transition hover:bg-white/[0.08] hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                aria-pressed={showOnlyUnread}
              >
                <Filter className="size-3.5" />
                {filterLabel}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-slate-300 transition hover:bg-white/[0.08] hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={unreadCount === 0}
              >
                <CheckCheck className="size-3.5" />
                {markAllLabel}
              </button>

              <button
                type="button"
                onClick={clearVisibleNotifications}
                className="inline-flex items-center gap-1.5 rounded-md border border-rose-300/25 bg-rose-500/10 px-2.5 py-1 text-xs text-rose-200 transition hover:bg-rose-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={visibleNotifications.length === 0}
              >
                <Trash2 className="size-3.5" />
                {clearLabel}
              </button>
            </div>
          </header>

          <div className="max-h-[22rem] space-y-2 overflow-auto px-3 py-3">
            {visibleNotifications.length > 0 ? (
              visibleNotifications.map((notification) => {
                const isUnread = !readIdSet.has(notification.id);

                const content = (
                  <article
                    className={cn(
                      "rounded-lg border px-3 py-2.5 transition",
                      isUnread
                        ? "border-cyan-400/35 bg-cyan-500/10"
                        : "border-white/10 bg-white/[0.02]",
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={cn(
                          "mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border",
                          notification.kind === "blog"
                            ? "border-blue-400/40 bg-blue-500/15 text-blue-200"
                            : "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
                        )}
                      >
                        {notification.kind === "blog" ? (
                          <CircleDot className="size-3.5" />
                        ) : (
                          <Megaphone className="size-3.5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-100">{notification.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-300">{notification.description}</p>
                        <p className="mt-1.5 text-[11px] text-slate-500">
                          {formatNotificationDate(notification.createdAt, locale)}
                        </p>
                      </div>
                    </div>
                  </article>
                );

                if (!notification.href) {
                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => {
                        markAsRead(notification.id);
                      }}
                      className="block w-full text-left"
                    >
                      {content}
                    </button>
                  );
                }

                return (
                  <Link
                    key={notification.id}
                    href={notification.href}
                    onClick={() => {
                      markAsRead(notification.id);
                      setIsOpen(false);
                    }}
                    className="block"
                  >
                    {content}
                  </Link>
                );
              })
            ) : (
              <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-4 text-xs text-slate-400">
                {emptyStateLabel}
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
