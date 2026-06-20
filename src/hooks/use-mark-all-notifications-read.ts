"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

async function markAllNotificationsRead(): Promise<void> {
  const response = await fetch("/api/notifications/mark-all-read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to mark all notifications as read");
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
