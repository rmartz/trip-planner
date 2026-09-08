import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { LodgingHostGuestPickerView } from "./LodgingHostGuestPickerView";

const GUESTS = [
  { uid: "uid-1", displayName: "Alice" },
  { uid: "uid-2", displayName: "Bob" },
  { uid: "uid-3", displayName: "Carol" },
];

const meta: Meta<typeof LodgingHostGuestPickerView> = {
  component: LodgingHostGuestPickerView,
  args: {
    guests: GUESTS,
    selectedUids: new Set(["uid-1"]),
    onToggleGuest: fn(),
    onSave: fn(),
    isSubmitting: false,
  },
};

export default meta;

type Story = StoryObj<typeof LodgingHostGuestPickerView>;

export const Default: Story = {};

export const NoneSelected: Story = {
  args: {
    selectedUids: new Set(),
  },
};

export const AllSelected: Story = {
  args: {
    selectedUids: new Set(GUESTS.map((g) => g.uid)),
  },
};

export const NoGuests: Story = {
  args: {
    guests: [],
    selectedUids: new Set(),
  },
};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
};
