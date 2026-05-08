import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { AddRangeModalView } from "./AddRangeModal";

const meta: Meta<typeof AddRangeModalView> = {
  component: AddRangeModalView,
  args: {
    open: false,
    onOpenChange: fn(),
    isPending: false,
    onSubmit: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof AddRangeModalView>;

export const Closed: Story = {};

export const Open: Story = {
  args: {
    open: true,
  },
};

export const OpenPending: Story = {
  args: {
    open: true,
    isPending: true,
  },
};
