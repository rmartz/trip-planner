import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { DestinationDetailView } from "./DestinationDetailView";
import type { Destination } from "@/lib/types/destination";

const sampleDestination: Destination = {
  destinationId: "dest-1",
  uid: "user-1",
  name: "Paris",
  seasonality: "best in spring",
  tripIds: [],
};

const meta: Meta<typeof DestinationDetailView> = {
  component: DestinationDetailView,
  args: {
    destination: sampleDestination,
    onEdit: fn(),
    onBack: fn(),
    onShare: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof DestinationDetailView>;

export const WithSeasonality: Story = {};

export const NoSeasonality: Story = {
  args: {
    destination: {
      ...sampleDestination,
      seasonality: undefined,
    },
  },
};

export const WithShareButton: Story = {
  args: {
    canShare: true,
  },
};

export const WithoutShareButton: Story = {
  args: {
    canShare: false,
  },
};
