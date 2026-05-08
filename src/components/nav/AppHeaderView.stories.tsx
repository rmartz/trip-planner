import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { AppHeaderView } from "./AppHeaderView";
import { NotificationBell } from "./NotificationBell";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, MenuIcon } from "lucide-react";

const meta: Meta<typeof AppHeaderView> = {
  component: AppHeaderView,
  args: {
    title: "My Trips",
    leftSlot: undefined,
    rightSlot: undefined,
  },
};

export default meta;

type Story = StoryObj<typeof AppHeaderView>;

export const Default: Story = {
  args: {
    leftSlot: (
      <Button variant="ghost" size="icon-sm" aria-label="Open menu">
        <MenuIcon />
      </Button>
    ),
    rightSlot: <NotificationBell unreadCount={0} />,
  },
};

export const WithSubtitle: Story = {
  args: {
    title: "Trip Overview",
    subtitle: "Paris 2025",
    leftSlot: (
      <Button variant="ghost" size="icon-sm" aria-label="Open menu">
        <MenuIcon />
      </Button>
    ),
    rightSlot: <NotificationBell unreadCount={0} />,
  },
};

export const Drilled: Story = {
  args: {
    title: "Plan structure",
    leftSlot: (
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={fn()}
        aria-label="Go back"
      >
        <ArrowLeftIcon />
      </Button>
    ),
    rightSlot: undefined,
  },
};

export const DrilledWithRightAction: Story = {
  args: {
    title: "Members",
    leftSlot: (
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={fn()}
        aria-label="Go back"
      >
        <ArrowLeftIcon />
      </Button>
    ),
    rightSlot: (
      <Button variant="ghost" size="sm">
        + Invite
      </Button>
    ),
  },
};

export const WithUnreadNotifications: Story = {
  args: {
    leftSlot: (
      <Button variant="ghost" size="icon-sm" aria-label="Open menu">
        <MenuIcon />
      </Button>
    ),
    rightSlot: <NotificationBell unreadCount={5} />,
  },
};
