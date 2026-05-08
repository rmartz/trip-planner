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

  return props.variant === "drilled" ? (
    <AppHeaderView
      title={props.title}
      subtitle={props.subtitle}
      leftSlot={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={props.onBack}
          aria-label={APP_HEADER_COPY.ariaLabelGoBack}
        >
          <ArrowLeftIcon />
        </Button>
      }
      rightSlot={props.rightSlot}
    />
  ) : (
    <>
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" showCloseButton={false}>
          <SheetTitle className="sr-only">
            {APP_HEADER_COPY.navigationSheetTitle}
          </SheetTitle>
          <AppDrawerView {...props.drawerProps} />
        </SheetContent>
      </Sheet>
      <AppHeaderView
        title={props.title}
        subtitle={props.subtitle}
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
        rightSlot={<NotificationBell unreadCount={props.unreadCount ?? 0} />}
      />
    </>
  );
}
