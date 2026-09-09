import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ScreenAvailabilityView } from "./ScreenAvailabilityView";

/** Generates an array of dates from startDate for `count` days. */
function makeDates(startIso: string, count: number): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(`${startIso}T00:00:00`);
    d.setDate(d.getDate() + i);
    return d;
  });
}

const JUN_DATES = makeDates("2025-06-10", 11); // Jun 10–20

const defaultArgs = {
  dates: JUN_DATES,
  memberCount: 4,
  freeCountByDate: {},
  currentUserTrips: [],
  currentUserRanges: [],
  isLoading: false,
  isError: false,
};

const meta: Meta<typeof ScreenAvailabilityView> = {
  component: ScreenAvailabilityView,
  args: defaultArgs,
};

export default meta;

type Story = StoryObj<typeof ScreenAvailabilityView>;

export const Empty: Story = {};

export const Loading: Story = {
  args: { isLoading: true },
};

export const Error: Story = {
  args: { isError: true },
};

export const HeatmapOnly: Story = {
  args: {
    freeCountByDate: {
      "2025-06-10": 1,
      "2025-06-11": 2,
      "2025-06-12": 3,
      "2025-06-13": 4,
      "2025-06-14": 4,
      "2025-06-15": 3,
      "2025-06-16": 2,
      "2025-06-17": 4,
      "2025-06-18": 4,
      "2025-06-19": 4,
      "2025-06-20": 1,
    },
  },
};

export const WithConflicts: Story = {
  args: {
    freeCountByDate: {
      "2025-06-10": 4,
      "2025-06-11": 4,
      "2025-06-12": 4,
      "2025-06-13": 4,
      "2025-06-14": 4,
      "2025-06-15": 4,
      "2025-06-16": 4,
      "2025-06-17": 4,
      "2025-06-18": 4,
      "2025-06-19": 4,
      "2025-06-20": 4,
    },
    currentUserTrips: [
      {
        tripId: "trip-other",
        name: "NYC Getaway",
        startDate: new Date("2025-06-12T00:00:00"),
        endDate: new Date("2025-06-15T00:00:00"),
        createdAt: new Date("2025-01-01T00:00:00"),
        createdBy: "uid-1",
        memberUids: ["uid-1"],
        inviteToken: "tok-other",
      },
    ],
    currentUserRanges: [
      {
        rangeId: "range-conflict",
        uid: "uid-1",
        startDate: new Date("2025-06-12T00:00:00"),
        endDate: new Date("2025-06-14T00:00:00"),
        note: "family reunion",
      },
    ],
  },
};

export const BestWindowsWithConflictCallout: Story = {
  args: {
    memberCount: 8,
    freeCountByDate: Object.fromEntries(
      JUN_DATES.map((d) => {
        const k = `${String(d.getFullYear())}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        return [k, 8];
      }),
    ),
    currentUserTrips: [
      {
        tripId: "trip-bach",
        name: "Bach",
        startDate: new Date("2025-06-18T00:00:00"),
        endDate: new Date("2025-06-22T00:00:00"),
        createdAt: new Date("2025-01-01T00:00:00"),
        createdBy: "uid-marco",
        memberUids: ["uid-marco"],
        inviteToken: "tok-bach",
      },
    ],
    currentUserRanges: [
      {
        rangeId: "range-pat",
        uid: "uid-pat",
        startDate: new Date("2025-06-18T00:00:00"),
        endDate: new Date("2025-06-20T00:00:00"),
        note: "family reunion",
      },
    ],
  },
};
