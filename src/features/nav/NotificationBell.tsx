"use client";

import { BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NOTIFICATION_BELL_COPY } from "./NotificationBell.copy";

export interface NotificationBellProps {
  unreadCount: number;
  onClick?: () => void;
}

export function NotificationBell({
  unreadCount,
  onClick,
}: NotificationBellProps) {
  const badgeText =
    unreadCount > 99
      ? "99+"
      : unreadCount > 0
        ? String(unreadCount)
        : undefined;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={NOTIFICATION_BELL_COPY.label}
      onClick={onClick}
      className="relative"
    >
      <BellIcon />
      {badgeText !== undefined && (
        <span
          data-testid="notification-badge"
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[10px] font-medium text-destructive-foreground"
        >
          {badgeText}
        </span>
      )}
    </Button>
  );
}
