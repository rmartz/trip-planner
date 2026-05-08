import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NotificationBell } from "./NotificationBell";

const meta: Meta<typeof NotificationBell> = {
  component: NotificationBell,
  args: {
    unreadCount: 0,
  },
};

export default meta;

type Story = StoryObj<typeof NotificationBell>;

export const NoUnread: Story = {};

export const WithUnread: Story = {
  args: {
    unreadCount: 3,
  },
};

export const ManyUnread: Story = {
  args: {
    unreadCount: 150,
  },
};
