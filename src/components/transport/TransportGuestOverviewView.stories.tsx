import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Leg } from "@/lib/types/trip";
import {
  type TransportGuestLegSummary,
  TransportGuestOverviewView,
  type TransportSeatOffer,
} from "./TransportGuestOverviewView";

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

function makeSeatOffer(
  overrides: Partial<TransportSeatOffer> = {},
): TransportSeatOffer {
  return {
    offerId: "offer-1",
    driverName: "Marco",
    driverUid: "driver-uid-1",
    routeName: "Marco's car",
    seatCount: 3,
    ...overrides,
  };
}

function makeLegSummary(
  overrides: Partial<TransportGuestLegSummary> = {},
): TransportGuestLegSummary {
  return {
    leg: makeLeg(),
    offers: [makeSeatOffer()],
    ...overrides,
  };
}

const meta: Meta<typeof TransportGuestOverviewView> = {
  component: TransportGuestOverviewView,
  args: {
    legs: [makeLegSummary()],
    onClaimSeat: () => undefined,
  },
};

export default meta;

type Story = StoryObj<typeof TransportGuestOverviewView>;

export const Default: Story = {};

export const MultipleOffers: Story = {
  args: {
    legs: [
      makeLegSummary({
        offers: [
          makeSeatOffer({
            offerId: "offer-1",
            driverName: "Marco",
            routeName: "Marco's car",
            seatCount: 3,
          }),
          makeSeatOffer({
            offerId: "offer-2",
            driverName: "Tara",
            driverUid: "driver-uid-2",
            routeName: "Tara's SUV",
            seatCount: 5,
          }),
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
        leg: makeLeg({ legId: "l2", name: "Wimberley → San Antonio" }),
        offers: [],
      }),
    ],
  },
};

export const NoOffers: Story = {
  args: {
    legs: [makeLegSummary({ offers: [] })],
  },
};

export const Empty: Story = {
  args: {
    legs: [],
  },
};
