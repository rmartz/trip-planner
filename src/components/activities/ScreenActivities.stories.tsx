import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ScreenActivitiesView } from "./ScreenActivitiesView";
import type { Activity } from "@/lib/types/activity";
import { TransportationMode } from "@/lib/types/activity";

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
