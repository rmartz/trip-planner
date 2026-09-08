import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import {
  LodgingGuestOfferStatus,
  LodgingGuestOverviewView,
  type LodgingGuestStopSummary,
} from "./LodgingGuestOverviewView";
import type { Stop } from "@/lib/types/trip";

function makeStop(overrides: Partial<Stop> = {}): Stop {
  return {
    endDate: new Date("2026-08-05T00:00:00"),
    memberUids: ["uid-1", "uid-2"],
    name: "Paris",
    order: 0,
    startDate: new Date("2026-08-01T00:00:00"),
    stopId: "stop-paris",
    tripId: "trip-1",
    ...overrides,
  };
}

const SUMMARIES: LodgingGuestStopSummary[] = [
  {
    offers: [
      {
        bedCount: 2,
        hostName: "Alice",
        offerId: "o-1",
        offerLabel: "Apartment near the Seine",
        status: LodgingGuestOfferStatus.Pending,
      },
      {
        bedCount: 1,
        hostName: "Bob",
        offerId: "o-2",
        offerLabel: "Spare bedroom",
        status: LodgingGuestOfferStatus.Accepted,
      },
    ],
    sortedOwnLodging: false,
    stop: makeStop({ stopId: "stop-paris", name: "Paris" }),
  },
  {
    offers: [],
    sortedOwnLodging: true,
    stop: makeStop({ stopId: "stop-lyon", name: "Lyon" }),
  },
];

const meta: Meta<typeof LodgingGuestOverviewView> = {
  component: LodgingGuestOverviewView,
  args: {
    stops: SUMMARIES,
    onAcceptOffer: fn(),
    onDeclineOffer: fn(),
    onToggleSortedOwn: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof LodgingGuestOverviewView>;

export const GuestWithOffers: Story = {};

export const GuestSortedOwn: Story = {
  args: {
    stops: [
      {
        offers: [],
        sortedOwnLodging: true,
        stop: makeStop({ name: "Paris" }),
      },
    ],
  },
};

export const NoStops: Story = {
  args: {
    stops: [],
  },
};
