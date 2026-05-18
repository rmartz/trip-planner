import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Trip } from "@/lib/types/trip";
import { TripOverviewPageView } from "./TripOverviewPageView";

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    tripId: "trip-1",
    name: "Iceland Ring Road",
    startDate: new Date("2026-08-01T00:00:00"),
    endDate: new Date("2026-08-14T00:00:00"),
    createdAt: new Date("2026-01-15T00:00:00"),
    createdBy: "uid-1",
    memberUids: ["uid-1", "uid-2", "uid-3"],
    inviteToken: "tok-1",
    ...overrides,
  };
}

const meta: Meta<typeof TripOverviewPageView> = {
  component: TripOverviewPageView,
  args: {
    trip: makeTrip(),
    isLoading: false,
    isError: false,
  },
};

export default meta;

type Story = StoryObj<typeof TripOverviewPageView>;

export const Loaded: Story = {};

export const Loading: Story = {
  args: {
    trip: undefined,
    isLoading: true,
    isError: false,
  },
};

export const Error: Story = {
  args: {
    trip: undefined,
    isLoading: false,
    isError: true,
  },
};

export const NotFound: Story = {
  args: {
    trip: undefined,
    isLoading: false,
    isError: false,
  },
};

export const PastTrip: Story = {
  args: {
    trip: makeTrip({
      name: "Tokyo 2024",
      startDate: new Date("2024-04-10T00:00:00"),
      endDate: new Date("2024-04-22T00:00:00"),
    }),
  },
};

export const WithLodgingGap: Story = {
  args: {
    lodgingGapCount: 2,
  },
};

export const WithTransportGap: Story = {
  args: {
    transportGapCount: 3,
  },
};

export const WithBothGaps: Story = {
  args: {
    lodgingGapCount: 1,
    transportGapCount: 2,
  },
};
