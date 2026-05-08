import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { DestinationCatalogView } from "./DestinationCatalogView";
import type { Destination } from "@/lib/types/destination";

const sampleDestinations: Destination[] = [
  {
    destinationId: "dest-1",
    uid: "user-1",
    name: "Paris",
    seasonality: "best in spring",
    tripIds: [],
  },
  {
    destinationId: "dest-2",
    uid: "user-1",
    name: "Kyoto",
    seasonality: "cherry blossom season",
    tripIds: ["trip-a"],
  },
  {
    destinationId: "dest-3",
    uid: "user-1",
    name: "Lisbon",
    tripIds: [],
  },
];

const meta: Meta<typeof DestinationCatalogView> = {
  component: DestinationCatalogView,
  args: {
    destinations: sampleDestinations,
    isLoading: false,
    isError: false,
    searchQuery: "",
    onSearchChange: fn(),
    onAdd: fn(),
    onEdit: fn(),
    onShare: fn(),
    onAttach: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof DestinationCatalogView>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    destinations: [],
  },
};

export const Loading: Story = {
  args: {
    destinations: [],
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    destinations: [],
    isError: true,
  },
};

export const WithSearchQuery: Story = {
  args: {
    searchQuery: "Paris",
  },
};
