"use client";

import { useState } from "react";
import { MenuIcon, ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { AppHeaderView } from "./AppHeaderView";
import { AppDrawerView, type AppDrawerViewProps } from "./AppDrawerView";
import { APP_HEADER_COPY } from "./AppHeader.copy";
import { NotificationBell } from "./NotificationBell";

interface AppHeaderHomeProps {
  variant: "home";
  title: string;
  subtitle?: string;
  unreadCount?: number;
  drawerProps: AppDrawerViewProps;
}

interface AppHeaderDrilledProps {
  variant: "drilled";
  title: string;
  subtitle?: string;
  onBack: () => void;
  rightSlot?: React.ReactNode;
}

export type AppHeaderProps = AppHeaderHomeProps | AppHeaderDrilledProps;

export function AppHeader(props: AppHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (props.variant === "drilled") {
    const { title, subtitle, onBack, rightSlot } = props;
    return (
      <AppHeaderView
        title={title}
        subtitle={subtitle}
        leftSlot={
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onBack}
            aria-label={APP_HEADER_COPY.ariaLabelGoBack}
          >
            <ArrowLeftIcon />
          </Button>
        }
        rightSlot={rightSlot}
      />
    );
  }

  const { title, subtitle, unreadCount = 0, drawerProps } = props;
  return (
    <>
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" showCloseButton={false}>
          <SheetTitle className="sr-only">{APP_HEADER_COPY.navigationSheetTitle}</SheetTitle>
          <AppDrawerView {...drawerProps} />
        </SheetContent>
      </Sheet>
      <AppHeaderView
        title={title}
        subtitle={subtitle}
        leftSlot={
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setDrawerOpen(true);
            }}
            aria-label={APP_HEADER_COPY.ariaLabelOpenMenu}
          >
            <MenuIcon />
          </Button>
        }
        rightSlot={<NotificationBell unreadCount={unreadCount} />}
      />
    </>
  );
}
