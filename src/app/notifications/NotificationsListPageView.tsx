"use client";

import {
  CalendarIcon,
  CarIcon,
  DollarSignIcon,
  HomeIcon,
  MailIcon,
  PlaneIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NOTIFICATIONS_LIST_PAGE_COPY } from "./NotificationsListPageView.copy";

const COPY = NOTIFICATIONS_LIST_PAGE_COPY;

export enum NotificationType {
  ActivityScheduled = "activity_scheduled",
  ExpenseAdded = "expense_added",
  LegRemoved = "leg_removed",
  LodgingOffer = "lodging_offer",
  TransportOffer = "transport_offer",
  TripInvitation = "trip_invitation",
}

export interface NotificationListItem {
  body: string;
  notificationId: string;
  occurredAt: Date;
  read: boolean;
  title: string;
  tripId?: string;
  type: NotificationType;
}

export interface NotificationsListPageViewProps {
  isError: boolean;
  isLoading: boolean;
  notifications: NotificationListItem[];
  now?: Date;
  onMarkAllRead: () => void;
  onNotificationClick: (notificationId: string) => void;
}

function formatRelativeTime(occurredAt: Date, now: Date): string {
  const diffMs = Math.max(0, now.getTime() - occurredAt.getTime());
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${String(diffMinutes)}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${String(diffHours)}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${String(diffDays)}d ago`;
}

const NOTIFICATION_TYPE_ICON: Record<NotificationType, LucideIcon> = {
  [NotificationType.ActivityScheduled]: CalendarIcon,
  [NotificationType.ExpenseAdded]: DollarSignIcon,
  [NotificationType.LegRemoved]: PlaneIcon,
  [NotificationType.LodgingOffer]: HomeIcon,
  [NotificationType.TransportOffer]: CarIcon,
  [NotificationType.TripInvitation]: MailIcon,
};

interface NotificationRowProps {
  notification: NotificationListItem;
  now: Date;
  onClick: (notificationId: string) => void;
}

function NotificationRow({ notification, now, onClick }: NotificationRowProps) {
  const Icon = NOTIFICATION_TYPE_ICON[notification.type];
  return (
    <li data-testid="notification-row" data-read={String(notification.read)}>
      <button
        type="button"
        onClick={() => {
          onClick(notification.notificationId);
        }}
        className={`flex w-full flex-col gap-1 rounded-lg border p-4 text-left ${notification.read ? "border-zinc-200 dark:border-zinc-800" : "border-blue-300 bg-blue-50/40 dark:border-blue-700 dark:bg-blue-950/20"}`}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="flex items-center gap-2 text-sm font-medium">
            <span aria-hidden>
              <Icon className="h-4 w-4" />
            </span>
            {notification.title}
            {!notification.read && (
              <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-xs font-medium text-white">
                {COPY.unreadBadge}
              </span>
            )}
          </span>
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {formatRelativeTime(notification.occurredAt, now)}
          </span>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {notification.body}
        </p>
      </button>
    </li>
  );
}

export function NotificationsListPageView({
  isError,
  isLoading,
  notifications,
  now,
  onMarkAllRead,
  onNotificationClick,
}: NotificationsListPageViewProps) {
  const showList = !isLoading && !isError && notifications.length > 0;
  const showEmpty = !isLoading && !isError && notifications.length === 0;
  const hasUnread =
    !isLoading && !isError && notifications.some((n) => !n.read);
  const effectiveNow = now ?? new Date();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-semibold">{COPY.heading}</h1>
          <p className="font-mono text-xs text-muted-foreground">
            {COPY.headingSubtext}
          </p>
        </div>
        {hasUnread && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onMarkAllRead}
            data-testid="mark-all-read-button"
          >
            {COPY.markAllReadButton}
          </Button>
        )}
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4">
        {isLoading && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {COPY.loadingText}
          </p>
        )}
        {!isLoading && isError && (
          <p className="text-sm text-red-500 dark:text-red-400">
            {COPY.errorText}
          </p>
        )}
        {showEmpty && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {COPY.emptyText}
          </p>
        )}
        {showList && (
          <ul data-testid="notification-list" className="flex flex-col gap-2">
            {notifications.map((notification) => (
              <NotificationRow
                key={notification.notificationId}
                notification={notification}
                now={effectiveNow}
                onClick={onNotificationClick}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
