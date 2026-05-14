import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Leg } from "@/lib/types/trip";
import {
  type TransportLegSummary,
  TransportPlannerOverviewView,
} from "./TransportPlannerOverviewView";

function makeLeg(overrides: Partial<Leg> = {}): Leg {
  return {
    legId: "leg-1",
    tripId: "trip-1",
    fromStopId: "stop-1",
    toStopId: "stop-2",
    name: "Austin → Wimberley",
    order: 0,
    memberUids: ["uid-1"],
    isActive: true,
    ...overrides,
  };
}

function makeLegSummary(
  overrides: Partial<TransportLegSummary> = {},
): TransportLegSummary {
  return {
    leg: makeLeg(),
    capacity: { driverCount: 1, seatCount: 4 },
    demand: { ridersNeeded: 3 },
    ...overrides,
  };
}

const meta: Meta<typeof TransportPlannerOverviewView> = {
  component: TransportPlannerOverviewView,
  args: {
    legs: [makeLegSummary()],
  },
};

export default meta;

type Story = StoryObj<typeof TransportPlannerOverviewView>;

export const Covered: Story = {};

export const WithGap: Story = {
  args: {
    legs: [
      makeLegSummary({
        capacity: { driverCount: 1, seatCount: 2 },
        demand: { ridersNeeded: 5 },
      }),
    ],
  },
};

export const MultipleLegs: Story = {
  args: {
    legs: [
      makeLegSummary({
        leg: makeLeg({ legId: "l1", name: "Austin → Wimberley" }),
      }),
      makeLegSummary({
        leg: makeLeg({
          legId: "l2",
          name: "Wimberley → San Antonio",
        }),
        capacity: { driverCount: 0, seatCount: 0 },
        demand: { ridersNeeded: 4 },
      }),
    ],
  },
};

export const Empty: Story = {
  args: {
    legs: [],
  },
};
