"use client";

import { cn } from "@/lib/utils";

export interface AppHeaderViewProps {
  title: string;
  subtitle?: string;
  leftSlot: React.ReactNode;
  rightSlot: React.ReactNode;
  className?: string;
}

export function AppHeaderView({
  title,
  subtitle,
  leftSlot,
  rightSlot,
  className,
}: AppHeaderViewProps) {
  return (
    <header
      data-testid="app-header"
      className={cn(
        "flex h-14 items-center justify-between border-b border-border bg-background px-4",
        className,
      )}
    >
      <div className="flex w-10 items-center justify-start">{leftSlot}</div>
      <div className="flex min-w-0 flex-1 flex-col items-center">
        <span className="truncate text-sm font-semibold leading-tight">
          {title}
        </span>
        {subtitle !== undefined && (
          <span
            data-testid="app-header-subtitle"
            className="truncate text-xs text-muted-foreground"
          >
            {subtitle}
          </span>
        )}
      </div>
      <div className="flex w-10 items-center justify-end">{rightSlot}</div>
    </header>
  );
}
