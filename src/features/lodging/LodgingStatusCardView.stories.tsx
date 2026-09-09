import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { LodgingStatusCardView } from "./LodgingStatusCardView";
import { LodgingStatus } from "@/lib/types/lodging";
import type { Stop } from "@/lib/types/trip";

const mockStop: Stop = {
  stopId: "stop-1",
  tripId: "trip-1",
  name: "Austin",
  startDate: new Date("2025-06-06T00:00:00Z"),
  endDate: new Date("2025-06-07T00:00:00Z"),
  order: 1,
  memberUids: ["user-1"],
};

const meta: Meta<typeof LodgingStatusCardView> = {
  component: LodgingStatusCardView,
  args: {
    stop: mockStop,
    currentStatus: undefined,
    onStatusChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof LodgingStatusCardView>;

export const NoStatusSet: Story = {};

export const NeedLodging: Story = {
  args: {
    currentStatus: LodgingStatus.NeedLodging,
  },
};

export const SecuredPrivate: Story = {
  args: {
    currentStatus: LodgingStatus.SecuredPrivate,
  },
};

export const SharingWith: Story = {
  args: {
    currentStatus: LodgingStatus.SharingWith,
  },
};

export const SecuredCapacity: Story = {
  args: {
    currentStatus: LodgingStatus.SecuredCapacity,
  },
};
