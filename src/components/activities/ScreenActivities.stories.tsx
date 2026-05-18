import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ScreenActivitiesView } from "./ScreenActivitiesView";
import type { Activity } from "@/lib/types/activity";
import { TimeOfDaySlot, TransportationMode } from "@/lib/types/activity";

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

const meta: Meta<typeof ScreenActivitiesView> = {
  component: ScreenActivitiesView,
  args: {
    activities: [],
    canPropose: true,
    onPropose: fn(),
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

export const WithActivities: Story = {
  args: {
    activities: sampleActivities,
  },
};

export const WithActivitiesReadOnly: Story = {
  args: {
    activities: sampleActivities,
    canPropose: false,
  },
};

export const WithPinnedActivitiesPlanner: Story = {
  args: {
    activities: sampleActivitiesWithPinned,
    canPin: true,
    onPin: fn(),
    onPinToSlot: fn(),
    onUnpin: fn(),
  },
};

export const WithPinnedActivitiesGuest: Story = {
  args: {
    activities: sampleActivitiesWithPinned,
    canPropose: false,
  },
};
