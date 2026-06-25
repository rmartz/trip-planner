"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { useMarkAllNotificationsRead } from "@/hooks/use-mark-all-notifications-read";
import { useMarkNotificationRead } from "@/hooks/use-mark-notification-read";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationsListPageView } from "./NotificationsListPageView";
import { NOTIFICATIONS_LIST_PAGE_COPY } from "./NotificationsListPageView.copy";
import {
  notificationLinkPath,
  notificationToListItem,
} from "./notification-display";

export default function NotificationsPage() {
  const router = useRouter();
  const { data, isError, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data ?? [];

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: NOTIFICATIONS_LIST_PAGE_COPY.pageTitle,
        onBack: () => {
          router.back();
        },
      }}
    >
      <NotificationsListPageView
        notifications={notifications.map(notificationToListItem)}
        isLoading={isLoading}
        isError={isError}
        onMarkAllRead={() => {
          markAllRead.mutate();
        }}
        onNotificationClick={(notificationId) => {
          const notification = notifications.find(
            (n) => n.notificationId === notificationId,
          );
          markRead.mutate(notificationId);
          const path =
            notification !== undefined
              ? notificationLinkPath(notification)
              : undefined;
          if (path !== undefined) {
            router.push(path);
          }
        }}
      />
    </AppShell>
  );
}
