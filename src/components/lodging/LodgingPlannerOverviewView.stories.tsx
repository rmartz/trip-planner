import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  LodgingPlannerOverviewView,
  LodgingVisibility,
} from "./LodgingPlannerOverviewView";
import type { LodgingStopSummary } from "./LodgingPlannerOverviewView";
import type { Stop } from "@/lib/types/trip";

function makeStop(overrides: Partial<Stop> = {}): Stop {
  return {
    stopId: "stop-1",
    tripId: "trip-1",
    name: "Austin",
    startDate: new Date("2025-06-01T00:00:00Z"),
    endDate: new Date("2025-06-03T00:00:00Z"),
    order: 0,
    memberUids: ["uid-1"],
    ...overrides,
  };
}

const balancedStop: LodgingStopSummary = {
  stop: makeStop({ name: "Austin" }),
  demand: { needLodging: 3, haveOwn: 2, sharing: 1, noReply: 2 },
  supply: [
    {
      hostName: "Marco",
      offerLabel: "Marco's place",
      bedCount: 4,
      visibility: LodgingVisibility.Public,
    },
  ],
};

const gapStop: LodgingStopSummary = {
  stop: makeStop({ stopId: "stop-2", name: "Wimberley", order: 1 }),
  demand: { needLodging: 5, haveOwn: 1, sharing: 0, noReply: 4 },
  supply: [
    {
      hostName: "Tara",
      offerLabel: "Tara's couch",
      bedCount: 2,
      visibility: LodgingVisibility.InviteOnly,
      inviteeCount: 3,
    },
  ],
};

const noHostsStop: LodgingStopSummary = {
  stop: makeStop({ stopId: "stop-3", name: "San Marcos", order: 2 }),
  demand: { needLodging: 4, haveOwn: 0, sharing: 0, noReply: 6 },
  supply: [],
};

const meta: Meta<typeof LodgingPlannerOverviewView> = {
  component: LodgingPlannerOverviewView,
};

export default meta;

type Story = StoryObj<typeof LodgingPlannerOverviewView>;

export const Balanced: Story = {
  args: {
    stops: [balancedStop],
  },
};

export const WithGap: Story = {
  args: {
    stops: [gapStop],
  },
};

export const NoHosts: Story = {
  args: {
    stops: [noHostsStop],
  },
};

export const MultipleStops: Story = {
  args: {
    stops: [balancedStop, gapStop, noHostsStop],
  },
};

export const MultipleHosts: Story = {
  args: {
    stops: [
      {
        stop: makeStop({ name: "Denver" }),
        demand: { needLodging: 6, haveOwn: 2, sharing: 1, noReply: 3 },
        supply: [
          {
            hostName: "Marco",
            offerLabel: "Marco's place",
            bedCount: 4,
            visibility: LodgingVisibility.Public,
          },
          {
            hostName: "Tara",
            offerLabel: "Tara's couch",
            bedCount: 2,
            visibility: LodgingVisibility.InviteOnly,
            inviteeCount: 3,
          },
        ],
      },
    ],
  },
};
