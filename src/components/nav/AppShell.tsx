"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { signOut } from "@/services/auth";
import { AppHeader } from "./AppHeader";
import type { AppHeaderProps } from "./AppHeader";

interface AppShellHomeProps {
  variant: "home";
  title: string;
  subtitle?: string;
  unreadCount?: number;
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
          unreadCount: header.unreadCount,
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
