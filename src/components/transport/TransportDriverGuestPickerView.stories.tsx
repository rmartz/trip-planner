import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  TransportDriverGuestPickerView,
  type TransportGuestCandidate,
} from "./TransportDriverGuestPickerView";

function makeGuest(
  overrides: Partial<TransportGuestCandidate> = {},
): TransportGuestCandidate {
  return {
    uid: "uid-1",
    displayName: "Alice",
    ...overrides,
  };
}

const meta: Meta<typeof TransportDriverGuestPickerView> = {
  component: TransportDriverGuestPickerView,
  args: {
    guests: [
      makeGuest({ uid: "uid-1", displayName: "Alice" }),
      makeGuest({ uid: "uid-2", displayName: "Bob" }),
      makeGuest({ uid: "uid-3", displayName: "Carol" }),
    ],
    selectedUids: new Set(["uid-1"]),
    isSubmitting: false,
    onToggleGuest: () => undefined,
    onSave: () => undefined,
  },
};

export default meta;

type Story = StoryObj<typeof TransportDriverGuestPickerView>;

export const Default: Story = {};

export const NoneSelected: Story = {
  args: {
    selectedUids: new Set(),
  },
};

export const AllSelected: Story = {
  args: {
    selectedUids: new Set(["uid-1", "uid-2", "uid-3"]),
  },
};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
};

export const NoGuests: Story = {
  args: {
    guests: [],
    selectedUids: new Set(),
  },
};
