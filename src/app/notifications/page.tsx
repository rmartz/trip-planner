"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import {
  NotificationsListPageView,
  NotificationType,
  type NotificationListItem,
} from "./NotificationsListPageView";
import { NOTIFICATIONS_LIST_PAGE_COPY } from "./NotificationsListPageView.copy";

const STUB_NOTIFICATIONS: NotificationListItem[] = [
  {
    body: "Reed invited you to plan the Iceland Ring Road trip.",
    notificationId: "stub-1",
    occurredAt: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    title: "Invited to Iceland Ring Road",
    type: NotificationType.TripInvitation,
  },
  {
    body: "Alex made their lakeside cabin available for the Tahoe trip.",
    notificationId: "stub-2",
    occurredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    title: "New lodging offer",
    type: NotificationType.LodgingOffer,
  },
  {
    body: "Jamie published the schedule for the Paris stop.",
    notificationId: "stub-3",
    occurredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    read: true,
    title: "Schedule published",
    type: NotificationType.ActivityScheduled,
  },
  {
    body: "Sam removed the Lyon → Marseille leg.",
    notificationId: "stub-4",
    occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
    title: "Leg removed",
    type: NotificationType.LegRemoved,
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(STUB_NOTIFICATIONS);

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: NOTIFICATIONS_LIST_PAGE_COPY.pageTitle,
        onBack: () => {
          router.push("/");
        },
      }}
    >
      <NotificationsListPageView
        notifications={notifications}
        isLoading={false}
        isError={false}
        onMarkAllRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onNotificationClick={(notificationId) => {
          setNotifications((prev) =>
            prev.map((n) =>
              n.notificationId === notificationId ? { ...n, read: true } : n,
            ),
          );
        }}
      />
    </AppShell>
  );
}
