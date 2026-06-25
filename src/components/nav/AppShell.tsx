"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { signOut } from "@/services/auth";
import { AppHeader } from "./AppHeader";
import type { AppHeaderProps } from "./AppHeader";

interface AppShellHomeProps {
  variant: "home";
  title: string;
  subtitle?: string;
}

interface AppShellDrilledProps {
  variant: "drilled";
  title: string;
  subtitle?: string;
  onBack: () => void;
  rightSlot?: React.ReactNode;
}

type AppShellHeaderProps = AppShellHomeProps | AppShellDrilledProps;

export interface AppShellProps {
  children: React.ReactNode;
  header: AppShellHeaderProps;
}

export function AppShell({ children, header }: AppShellProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  const unreadCount = useUnreadCount(user?.uid);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.push("/sign-in");
  }, [router]);

  const headerProps: AppHeaderProps =
    header.variant === "home"
      ? {
          variant: "home",
          title: header.title,
          subtitle: header.subtitle,
          unreadCount,
          drawerProps: {
            scope: "user",
            userEmail: user?.email ?? "",
            recentTrips: [],
            onSignOut: () => void handleSignOut(),
          },
        }
      : header;

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader {...headerProps} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
