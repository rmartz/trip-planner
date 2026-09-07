import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ScreenDestinationsTripView } from "./ScreenDestinationsTripView";
import type { TripDestination } from "@/lib/types/destination";

const sampleDestinations: TripDestination[] = [
  {
    destinationId: "dest-1",
    catalogUid: "user-1",
    name: "Eiffel Tower",
    stopId: "stop-1",
    stopName: "Paris",
    tripId: "trip-1",
  },
  {
    destinationId: "dest-2",
    catalogUid: "user-1",
    name: "Louvre Museum",
    stopId: "stop-1",
    stopName: "Paris",
    tripId: "trip-1",
  },
  {
    destinationId: "dest-3",
    catalogUid: "user-1",
    name: "Mount Fuji",
    stopId: "stop-2",
    stopName: "Tokyo",
    tripId: "trip-1",
  },
];

const meta: Meta<typeof ScreenDestinationsTripView> = {
  component: ScreenDestinationsTripView,
  args: {
    tripId: "trip-1",
    destinations: sampleDestinations,
    isLoading: false,
    isError: false,
    onBack: fn(),
    onAdd: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof ScreenDestinationsTripView>;

export const Populated: Story = {};

export const Loading: Story = {
  args: {
    destinations: [],
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    destinations: [],
  },
};

export const Error: Story = {
  args: {
    destinations: [],
    isError: true,
  },
};
