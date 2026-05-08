import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { RemoveLegConfirmModalView } from "./RemoveLegConfirmModalView";

const meta: Meta<typeof RemoveLegConfirmModalView> = {
  component: RemoveLegConfirmModalView,
  args: {
    legName: "London to Paris",
    affectedGuestUids: [],
    isRemoving: false,
    onConfirm: fn(),
    onCancel: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof RemoveLegConfirmModalView>;

export const NoAffectedGuests: Story = {};

export const WithAffectedGuests: Story = {
  args: {
    affectedGuestUids: ["uid-alice", "uid-bob", "uid-carol"],
  },
};

export const Removing: Story = {
  args: {
    isRemoving: true,
  },
};
