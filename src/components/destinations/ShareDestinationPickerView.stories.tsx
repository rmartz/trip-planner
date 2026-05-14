import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ShareDestinationPickerView } from "./ShareDestinationPickerView";
import type { Destination } from "@/lib/types/destination";
import type { ShareablePlanner } from "./ShareDestinationPickerView";

const sampleDestination: Destination = {
  destinationId: "dest-1",
  uid: "user-1",
  name: "Paris",
  seasonality: "best in spring",
  tripIds: [],
};

const samplePlanners: ShareablePlanner[] = [
  { uid: "user-2", displayName: "Alice" },
  { uid: "user-3", displayName: "Bob" },
];

const meta: Meta<typeof ShareDestinationPickerView> = {
  component: ShareDestinationPickerView,
  args: {
    destination: sampleDestination,
    planners: samplePlanners,
    isLoading: false,
    isSubmitting: false,
    isError: false,
    onSelectPlanner: fn(),
    onCancel: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof ShareDestinationPickerView>;

export const WithPlanners: Story = {};

export const Loading: Story = {
  args: {
    planners: [],
    isLoading: true,
  },
};

export const NoPlanners: Story = {
  args: {
    planners: [],
  },
};

export const ErrorState: Story = {
  args: {
    isError: true,
  },
};
