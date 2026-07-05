import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { AppDrawerView } from "./AppDrawerView";

const meta: Meta<typeof AppDrawerView> = {
  component: AppDrawerView,
};

export default meta;

type Story = StoryObj<typeof AppDrawerView>;

export const UserScopeEmpty: Story = {
  args: {
    scope: "user",
    userEmail: "traveler@example.com",
    recentTrips: [],
    onSignOut: fn(),
  },
};

export const UserScopeWithRecentTrips: Story = {
  args: {
    scope: "user",
    userEmail: "traveler@example.com",
    recentTrips: [
      {
        tripId: "trip-1",
        name: "Paris Summer 2025",
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-06-14"),
        createdAt: new Date("2025-01-01"),
        createdBy: "uid-1",
        memberUids: ["uid-1"],
        inviteToken: "tok-1",
      },
      {
        tripId: "trip-2",
        name: "Tokyo Autumn 2025",
        startDate: new Date("2025-10-10"),
        endDate: new Date("2025-10-24"),
        createdAt: new Date("2025-02-01"),
        createdBy: "uid-1",
        memberUids: ["uid-1", "uid-2"],
        inviteToken: "tok-1",
      },
    ],
    onSignOut: fn(),
  },
};

export const TripScopeNoOtherTrips: Story = {
  args: {
    scope: "trip",
    userEmail: "traveler@example.com",
    activeTrip: {
      tripId: "trip-1",
      name: "Paris Summer 2025",
      startDate: new Date("2025-06-01"),
      endDate: new Date("2025-06-14"),
      createdAt: new Date("2025-01-01"),
      createdBy: "uid-1",
      memberUids: ["uid-1"],
      inviteToken: "tok-1",
    },
    otherTrips: [],
    onSignOut: fn(),
  },
};

export const TripScopeCoordinationPhase: Story = {
  args: {
    scope: "trip",
    userEmail: "traveler@example.com",
    activeTrip: {
      tripId: "trip-1",
      name: "Alps Adventure 2099",
      startDate: new Date("2099-06-01"),
      endDate: new Date("2099-06-14"),
      createdAt: new Date("2099-01-01"),
      createdBy: "uid-1",
      memberUids: ["uid-1", "uid-2", "uid-3"],
      inviteToken: "tok-1",
    },
    otherTrips: [],
    onSignOut: fn(),
  },
};

export const TripScopeWithOtherTrips: Story = {
  args: {
    scope: "trip",
    userEmail: "traveler@example.com",
    activeTrip: {
      tripId: "trip-1",
      name: "Paris Summer 2025",
      startDate: new Date("2025-06-01"),
      endDate: new Date("2025-06-14"),
      createdAt: new Date("2025-01-01"),
      createdBy: "uid-1",
      memberUids: ["uid-1"],
      inviteToken: "tok-1",
    },
    otherTrips: [
      {
        tripId: "trip-2",
        name: "Tokyo Autumn 2025",
        startDate: new Date("2025-10-10"),
        endDate: new Date("2025-10-24"),
        createdAt: new Date("2025-02-01"),
        createdBy: "uid-1",
        memberUids: ["uid-1", "uid-2"],
        inviteToken: "tok-1",
      },
    ],
    onSignOut: fn(),
  },
};
