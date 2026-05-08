import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { CalendarPageView } from "./CalendarPageView";

const JUNE_2025 = new Date(2025, 5, 1);

const defaultArgs = {
  currentMonth: JUNE_2025,
  ranges: [],
  trips: [],
  onPrevMonth: fn(),
  onNextMonth: fn(),
  onAddBlock: fn(),
  isLoading: false,
  isError: false,
};

const meta: Meta<typeof CalendarPageView> = {
  component: CalendarPageView,
  args: defaultArgs,
};

export default meta;

type Story = StoryObj<typeof CalendarPageView>;

export const Empty: Story = {};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    isError: true,
  },
};

export const WithBlockedDays: Story = {
  args: {
    ranges: [
      {
        rangeId: "range-1",
        uid: "uid-1",
        startDate: new Date("2025-06-05T00:00:00"),
        endDate: new Date("2025-06-07T00:00:00"),
      },
      {
        rangeId: "range-2",
        uid: "uid-1",
        startDate: new Date("2025-06-20T00:00:00"),
        endDate: new Date("2025-06-22T00:00:00"),
        note: "Work conference",
      },
    ],
  },
};

export const WithConflictDays: Story = {
  args: {
    ranges: [
      {
        rangeId: "range-1",
        uid: "uid-1",
        startDate: new Date("2025-06-12T00:00:00"),
        endDate: new Date("2025-06-14T00:00:00"),
        note: "Family visit",
      },
    ],
    trips: [
      {
        tripId: "trip-1",
        name: "Paris Trip",
        startDate: new Date("2025-06-10T00:00:00"),
        endDate: new Date("2025-06-20T00:00:00"),
        createdAt: new Date("2025-01-01T00:00:00"),
        createdBy: "uid-1",
        memberUids: ["uid-1"],
      },
    ],
  },
};

export const WithUpcomingBlocksAndOverlapWarnings: Story = {
  args: {
    ranges: [
      {
        rangeId: "range-safe",
        uid: "uid-1",
        startDate: new Date("2025-06-02T00:00:00"),
        endDate: new Date("2025-06-03T00:00:00"),
        note: "Doctor appointment",
      },
      {
        rangeId: "range-conflict",
        uid: "uid-1",
        startDate: new Date("2025-06-12T00:00:00"),
        endDate: new Date("2025-06-14T00:00:00"),
        note: "Family visit",
      },
    ],
    trips: [
      {
        tripId: "trip-1",
        name: "Paris Trip",
        startDate: new Date("2025-06-10T00:00:00"),
        endDate: new Date("2025-06-20T00:00:00"),
        createdAt: new Date("2025-01-01T00:00:00"),
        createdBy: "uid-1",
        memberUids: ["uid-1"],
      },
    ],
  },
};
