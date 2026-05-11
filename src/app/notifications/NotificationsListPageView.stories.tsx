import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import {
  NotificationsListPageView,
  NotificationType,
  type NotificationListItem,
} from "./NotificationsListPageView";

const NOW = new Date("2026-05-11T10:00:00Z");

const NOTIFICATIONS: NotificationListItem[] = [
  {
    body: "Reed invited you to plan the Iceland Ring Road trip.",
    notificationId: "n-1",
    occurredAt: new Date(NOW.getTime() - 5 * 60 * 1000),
    read: false,
    title: "Invited to Iceland Ring Road",
    type: NotificationType.TripInvitation,
  },
  {
    body: "Alex made their lakeside cabin available for the Tahoe trip.",
    notificationId: "n-2",
    occurredAt: new Date(NOW.getTime() - 2 * 60 * 60 * 1000),
    read: false,
    title: "New lodging offer",
    type: NotificationType.LodgingOffer,
  },
  {
    body: "Jamie published the schedule for the Paris stop.",
    notificationId: "n-3",
    occurredAt: new Date(NOW.getTime() - 1 * 24 * 60 * 60 * 1000),
    read: true,
    title: "Schedule published",
    type: NotificationType.ActivityScheduled,
  },
];

const meta: Meta<typeof NotificationsListPageView> = {
  component: NotificationsListPageView,
  args: {
    notifications: NOTIFICATIONS,
    isLoading: false,
    isError: false,
    onMarkAllRead: fn(),
    onNotificationClick: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof NotificationsListPageView>;

export const Loaded: Story = {};

export const AllRead: Story = {
  args: {
    notifications: NOTIFICATIONS.map((n) => ({ ...n, read: true })),
  },
};

export const Empty: Story = {
  args: {
    notifications: [],
  },
};

export const Loading: Story = {
  args: {
    notifications: [],
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    notifications: [],
    isError: true,
  },
};
