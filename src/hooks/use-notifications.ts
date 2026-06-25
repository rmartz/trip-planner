"use client";

import { useQuery } from "@tanstack/react-query";
import type { Notification } from "@/lib/types/notification";

type SerializedNotification = Omit<Notification, "createdAt"> & {
  createdAt: string;
};

async function fetchNotifications(): Promise<Notification[]> {
  const response = await fetch("/api/notifications");
  if (!response.ok) throw new Error("Failed to fetch notifications");
  const data = (await response.json()) as SerializedNotification[];
  return data.map((notification) => ({
    ...notification,
    createdAt: new Date(notification.createdAt),
  }));
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });
}
