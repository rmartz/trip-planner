import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DebugUserSwitcherView } from "./DebugUserSwitcherView";

const PROFILES = [
  {
    uid: "synthetic:planner",
    displayName: "Pat Planner",
    email: "pat.planner@synthetic.test",
  },
  {
    uid: "synthetic:guest",
    displayName: "Gabby Guest",
    email: "gabby.guest@synthetic.test",
  },
];

const meta: Meta<typeof DebugUserSwitcherView> = {
  component: DebugUserSwitcherView,
  args: {
    profiles: PROFILES,
    onSelect: () => undefined,
  },
};

export default meta;

type Story = StoryObj<typeof DebugUserSwitcherView>;

export const Default: Story = {};

export const SigningIn: Story = {
  args: {
    pendingUid: "synthetic:planner",
  },
};

export const WithError: Story = {
  args: {
    error: "Failed to impersonate profile",
  },
};
