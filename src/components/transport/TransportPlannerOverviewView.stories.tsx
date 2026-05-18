import { fn } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Leg } from "@/lib/types/trip";
import {
  type NonAccountMemberTransportSummary,
  type TransportLegSummary,
  TransportOfferVisibility,
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
    demand: { driving: 1, needRide: 3, skipLeg: 0, noReply: 0 },
    supply: [
      {
        driverName: "Marco",
        routeName: "Marco's car",
        seatCount: 4,
        visibility: TransportOfferVisibility.Public,
      },
    ],
    ...overrides,
  };
}

function makeNonAccountMember(
  overrides: Partial<NonAccountMemberTransportSummary> = {},
): NonAccountMemberTransportSummary {
  return {
    memberId: "member-1",
    name: "Dana",
    sortedOwnTransport: false,
    ...overrides,
  };
}

const meta: Meta<typeof TransportPlannerOverviewView> = {
  component: TransportPlannerOverviewView,
  args: {
    legs: [makeLegSummary()],
    onToggleMemberSortedOwn: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof TransportPlannerOverviewView>;

export const Covered: Story = {};

export const WithGap: Story = {
  args: {
    legs: [
      makeLegSummary({
        demand: { driving: 0, needRide: 5, skipLeg: 0, noReply: 0 },
        supply: [
          {
            driverName: "Marco",
            routeName: "Marco's car",
            seatCount: 2,
            visibility: TransportOfferVisibility.Public,
          },
        ],
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
        demand: { driving: 0, needRide: 4, skipLeg: 0, noReply: 0 },
        supply: [],
      }),
    ],
  },
};

export const MultipleDrivers: Story = {
  args: {
    legs: [
      makeLegSummary({
        demand: { driving: 2, needRide: 5, skipLeg: 0, noReply: 2 },
        supply: [
          {
            driverName: "Marco",
            routeName: "Marco's car",
            seatCount: 4,
            visibility: TransportOfferVisibility.Public,
          },
          {
            driverName: "Tara",
            routeName: "Tara's SUV",
            seatCount: 6,
            visibility: TransportOfferVisibility.InviteOnly,
            inviteeCount: 3,
          },
        ],
      }),
    ],
  },
};

export const Empty: Story = {
  args: {
    legs: [],
  },
};

export const WithNonAccountMembers: Story = {
  args: {
    legs: [
      makeLegSummary({
        nonAccountMembers: [
          makeNonAccountMember({ memberId: "m-1", name: "Dana" }),
          makeNonAccountMember({
            memberId: "m-2",
            name: "Eli",
            sortedOwnTransport: true,
          }),
        ],
      }),
    ],
  },
};
