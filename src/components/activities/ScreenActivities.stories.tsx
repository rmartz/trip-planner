import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ScreenActivitiesView } from "./ScreenActivitiesView";
import type { Activity } from "@/lib/types/activity";
import { TimeOfDaySlot, TransportationMode } from "@/lib/types/activity";
import { InterestVote } from "@/lib/types/interest-vote";
import { TripRole } from "@/lib/types/trip";

const sampleActivities: Activity[] = [
  {
    activityId: "act-1",
    stopId: "stop-1",
    tripId: "trip-1",
    name: "Hiking the Ridge Trail",
    estimatedDurationMinutes: 180,
  },
  {
    activityId: "act-2",
    stopId: "stop-1",
    tripId: "trip-1",
    name: "Kayaking on the River",
    description: "Bring sunscreen and water shoes",
    estimatedDurationMinutes: 120,
    transportationRequired: TransportationMode.Private,
  },
];

const sampleActivitiesWithPinned: Activity[] = [
  {
    activityId: "act-1",
    stopId: "stop-1",
    tripId: "trip-1",
    name: "Float the Guadalupe",
    estimatedDurationMinutes: 240,
    pinned: true,
  },
  {
    activityId: "act-2",
    stopId: "stop-1",
    tripId: "trip-1",
    name: "Salt Lick BBQ dinner",
    estimatedDurationMinutes: 90,
    pinned: true,
    pinnedSlot: TimeOfDaySlot.Evening,
  },
  {
    activityId: "act-3",
    stopId: "stop-1",
    tripId: "trip-1",
    name: "Kayaking on the River",
    estimatedDurationMinutes: 120,
  },
  {
    activityId: "act-4",
    stopId: "stop-1",
    tripId: "trip-1",
    name: "Hiking the Ridge Trail",
    estimatedDurationMinutes: 180,
  },
];

const sampleVotes = {
  "act-1": { userVote: undefined, counts: { yes: 5, maybe: 2, no: 1 } },
  "act-2": {
    userVote: InterestVote.Yes,
    counts: { yes: 3, maybe: 0, no: 2 },
  },
};

const meta: Meta<typeof ScreenActivitiesView> = {
  component: ScreenActivitiesView,
  args: {
    activities: [],
    activityVotes: {},
    canPropose: true,
    onPropose: fn(),
    onVote: fn(),
    role: TripRole.Guest,
  },
};

export default meta;

type Story = StoryObj<typeof ScreenActivitiesView>;

export const Empty: Story = {};

export const EmptyReadOnly: Story = {
  args: {
    canPropose: false,
  },
};

export const GuestWithActivities: Story = {
  args: {
    activities: sampleActivities,
    activityVotes: sampleVotes,
    role: TripRole.Guest,
  },
};

export const GuestWithActivitiesReadOnly: Story = {
  args: {
    activities: sampleActivities,
    activityVotes: sampleVotes,
    canPropose: false,
    role: TripRole.Guest,
  },
};

export const PlannerWithActivities: Story = {
  args: {
    activities: sampleActivities,
    activityVotes: sampleVotes,
    role: TripRole.Planner,
  },
};

export const WithPinnedActivitiesPlanner: Story = {
  args: {
    activities: sampleActivitiesWithPinned,
    activityVotes: {},
    canPin: true,
    onPin: fn(),
    onPinToSlot: fn(),
    onUnpin: fn(),
    role: TripRole.Planner,
  },
};

export const WithPinnedActivitiesGuest: Story = {
  args: {
    activities: sampleActivitiesWithPinned,
    activityVotes: {},
    canPropose: false,
    role: TripRole.Guest,
  },
};
