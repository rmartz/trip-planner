import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InviteLinkCard } from "./InviteLinkCard";

const meta: Meta<typeof InviteLinkCard> = {
  component: InviteLinkCard,
};

export default meta;

type Story = StoryObj<typeof InviteLinkCard>;

export const Normal: Story = {
  args: {
    inviteToken: "x4kPq2abc",
    onRegen: () => undefined,
    isRegenerating: false,
  },
};

export const Regenerating: Story = {
  args: {
    inviteToken: "x4kPq2abc",
    onRegen: () => undefined,
    isRegenerating: true,
  },
};
