import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Destination } from "@/lib/types/destination";
import { DestinationsTripPageView } from "./DestinationsTripPageView";

function makeDestination(overrides: Partial<Destination> = {}): Destination {
  return {
    destinationId: "dest-1",
    uid: "uid-1",
    name: "Reykjavik",
    seasonality: "summer",
    tripIds: ["trip-1"],
    ...overrides,
  };
}

const meta: Meta<typeof DestinationsTripPageView> = {
  component: DestinationsTripPageView,
  args: {
    destinations: [
      makeDestination({ destinationId: "d-1", name: "Reykjavik" }),
      makeDestination({
        destinationId: "d-2",
        name: "Vik",
        seasonality: "fall",
      }),
      makeDestination({
        destinationId: "d-3",
        name: "Akureyri",
        seasonality: undefined,
      }),
    ],
    isLoading: false,
    isError: false,
  },
};

export default meta;

type Story = StoryObj<typeof DestinationsTripPageView>;

export const Loaded: Story = {};

export const Loading: Story = {
  args: {
    destinations: [],
    isLoading: true,
    isError: false,
  },
};

export const Error: Story = {
  args: {
    destinations: [],
    isLoading: false,
    isError: true,
  },
};

export const Empty: Story = {
  args: {
    destinations: [],
    isLoading: false,
    isError: false,
  },
};
