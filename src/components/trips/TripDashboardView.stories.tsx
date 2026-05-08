import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TripDashboardView } from "./TripDashboardView";
import type { Trip } from "@/lib/types/trip";

const meta: Meta<typeof TripDashboardView> = {
  component: TripDashboardView,
};

export default meta;

type Story = StoryObj<typeof TripDashboardView>;

const activeTrip: Trip = {
  tripId: "trip-active-1",
  name: "Tokyo Adventure",
  startDate: new Date("2026-09-01T12:00:00Z"),
  endDate: new Date("2026-09-10T12:00:00Z"),
  createdAt: new Date("2026-01-01T12:00:00Z"),
  createdBy: "uid-a",
  memberUids: ["uid-a", "uid-b", "uid-c"],
};

const activeTrip2: Trip = {
  tripId: "trip-active-2",
  name: "Kyoto Weekend",
  startDate: new Date("2026-10-15T12:00:00Z"),
  endDate: new Date("2026-10-17T12:00:00Z"),
  createdAt: new Date("2026-01-01T12:00:00Z"),
  createdBy: "uid-a",
  memberUids: ["uid-a"],
  gapCount: 2,
};

const pastTrip: Trip = {
  tripId: "trip-past-1",
  name: "Paris Last Summer",
  startDate: new Date("2025-07-01T12:00:00Z"),
  endDate: new Date("2025-07-08T12:00:00Z"),
  createdAt: new Date("2025-01-01T12:00:00Z"),
  createdBy: "uid-a",
  memberUids: ["uid-a", "uid-b"],
};

export const Empty: Story = {
  args: {
    activeTrips: [],
    pastTrips: [],
  },
};

export const ActiveOnly: Story = {
  args: {
    activeTrips: [activeTrip, activeTrip2],
    pastTrips: [],
  },
};

export const PastOnly: Story = {
  args: {
    activeTrips: [],
    pastTrips: [pastTrip],
  },
};

export const ActiveAndPast: Story = {
  args: {
    activeTrips: [activeTrip, activeTrip2],
    pastTrips: [pastTrip],
  },
};
