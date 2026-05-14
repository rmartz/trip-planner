import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { AttachDestinationPickerView } from "./AttachDestinationPickerView";
import type { Destination } from "@/lib/types/destination";
import type { Stop, Trip } from "@/lib/types/trip";

const sampleDestination: Destination = {
  destinationId: "dest-1",
  uid: "user-1",
  name: "Paris",
  seasonality: "best in spring",
  tripIds: [],
};

const sampleTrips: Trip[] = [
  {
    tripId: "trip-1",
    name: "Iceland Spring 2026",
    startDate: new Date("2026-04-01"),
    endDate: new Date("2026-04-10"),
    createdAt: new Date("2026-01-01"),
    createdBy: "user-1",
    memberUids: ["user-1"],
    inviteToken: "token-1",
  },
  {
    tripId: "trip-2",
    name: "Japan Cherry Blossoms",
    startDate: new Date("2026-03-25"),
    endDate: new Date("2026-04-05"),
    createdAt: new Date("2026-01-15"),
    createdBy: "user-1",
    memberUids: ["user-1"],
    inviteToken: "token-2",
  },
];

const sampleStopsForTrip: Record<string, Stop[]> = {
  "trip-1": [
    {
      stopId: "stop-1a",
      tripId: "trip-1",
      name: "Reykjavik",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-04-04"),
      order: 0,
      memberUids: ["user-1"],
    },
    {
      stopId: "stop-1b",
      tripId: "trip-1",
      name: "Vik",
      startDate: new Date("2026-04-05"),
      endDate: new Date("2026-04-08"),
      order: 1,
      memberUids: ["user-1"],
    },
  ],
  "trip-2": [
    {
      stopId: "stop-2a",
      tripId: "trip-2",
      name: "Tokyo",
      startDate: new Date("2026-03-25"),
      endDate: new Date("2026-03-30"),
      order: 0,
      memberUids: ["user-1"],
    },
  ],
};

const meta: Meta<typeof AttachDestinationPickerView> = {
  component: AttachDestinationPickerView,
  args: {
    destination: sampleDestination,
    trips: sampleTrips,
    stopsForTrip: sampleStopsForTrip,
    isLoading: false,
    isSubmitting: false,
    isError: false,
    onSelectStop: fn(),
    onCancel: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof AttachDestinationPickerView>;

export const Populated: Story = {};

export const Loading: Story = {
  args: {
    trips: [],
    stopsForTrip: {},
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    trips: [],
    stopsForTrip: {},
  },
};

export const Submitting: Story = {
  args: {
    isSubmitting: true,
  },
};

export const Error: Story = {
  args: {
    isError: true,
  },
};
