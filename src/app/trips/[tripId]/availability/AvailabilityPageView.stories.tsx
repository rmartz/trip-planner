import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AvailabilityPageView } from "./AvailabilityPageView";
import type { Trip } from "@/lib/types/trip";
import type { UnavailableRange } from "@/lib/types/unavailable-range";

const sampleTrip: Trip = {
  tripId: "trip-1",
  name: "Paris Trip",
  startDate: new Date("2025-06-10T00:00:00"),
  endDate: new Date("2025-06-20T00:00:00"),
  createdAt: new Date("2025-01-01T00:00:00"),
  createdBy: "uid-1",
  memberUids: ["uid-1", "uid-2", "uid-3", "uid-4"],
  inviteToken: "tok-1",
};

const sampleRange: UnavailableRange = {
  rangeId: "range-1",
  uid: "uid-1",
  startDate: new Date("2025-06-12T00:00:00"),
  endDate: new Date("2025-06-14T00:00:00"),
  note: "doctor",
};

const meta: Meta<typeof AvailabilityPageView> = {
  component: AvailabilityPageView,
  args: {
    trip: sampleTrip,
    currentUserTrips: [],
    currentUserRanges: [],
    isLoading: false,
    isError: false,
  },
};

export default meta;

type Story = StoryObj<typeof AvailabilityPageView>;

export const Loaded: Story = {};

export const Loading: Story = {
  args: { isLoading: true },
};

export const Error: Story = {
  args: { isError: true },
};

export const NotFound: Story = {
  args: { trip: undefined },
};

export const WithCurrentUserBlock: Story = {
  args: {
    currentUserTrips: [sampleTrip],
    currentUserRanges: [sampleRange],
  },
};
