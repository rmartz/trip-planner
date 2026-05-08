import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { TripRole } from "@/lib/types/trip";
import {
  RsvpPageView,
  RsvpStatus,
  type RsvpScheduledActivity,
} from "./RsvpPageView";

function makeActivity(
  overrides: Partial<RsvpScheduledActivity> = {},
): RsvpScheduledActivity {
  return {
    activityId: "act-1",
    name: "Welcome breakfast",
    timeSlot: "09:00",
    status: RsvpStatus.Pending,
    ...overrides,
  };
}

const meta: Meta<typeof RsvpPageView> = {
  component: RsvpPageView,
  args: {
    activities: [
      makeActivity({
        activityId: "a-1",
        name: "Welcome breakfast",
        timeSlot: "09:00",
        status: RsvpStatus.Confirmed,
      }),
      makeActivity({
        activityId: "a-2",
        name: "Walking tour",
        timeSlot: "11:00",
        status: RsvpStatus.Pending,
      }),
      makeActivity({
        activityId: "a-3",
        name: "Group dinner",
        timeSlot: "19:00",
        status: RsvpStatus.Declined,
      }),
    ],
    viewerRole: TripRole.Guest,
    isLoading: false,
    isError: false,
    onConfirm: fn(),
    onDecline: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof RsvpPageView>;

export const GuestLoaded: Story = {};

export const GuestEmpty: Story = {
  args: {
    activities: [],
  },
};

export const Loading: Story = {
  args: {
    activities: [],
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    activities: [],
    isError: true,
  },
};

export const PlannerView: Story = {
  args: {
    viewerRole: TripRole.Planner,
  },
};
