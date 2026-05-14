import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { TripAvailabilityGridView } from "./TripAvailabilityGridView";

const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date("2025-06-10T00:00:00");
  d.setDate(d.getDate() + i);
  return d;
});

const meta: Meta<typeof TripAvailabilityGridView> = {
  component: TripAvailabilityGridView,
  args: {
    dates: DATES,
    myAvailableDates: new Set(["2025-06-10", "2025-06-11", "2025-06-13"]),
    memberCountByDate: {
      "2025-06-10": 3,
      "2025-06-11": 3,
      "2025-06-12": 2,
      "2025-06-13": 3,
      "2025-06-14": 1,
      "2025-06-15": 0,
      "2025-06-16": 3,
    },
    plannerCount: 3,
    isLoading: false,
    isSubmitting: false,
    onToggleDates: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof TripAvailabilityGridView>;

export const Default: Story = {};

export const NoSelections: Story = {
  args: {
    myAvailableDates: new Set(),
    memberCountByDate: {},
  },
};

export const AllAvailable: Story = {
  args: {
    myAvailableDates: new Set(DATES.map((d) => d.toISOString().slice(0, 10))),
    memberCountByDate: Object.fromEntries(
      DATES.map((d) => [d.toISOString().slice(0, 10), 3]),
    ),
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    dates: [],
  },
};
