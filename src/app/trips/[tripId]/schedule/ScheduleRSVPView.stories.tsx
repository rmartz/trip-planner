import { fn } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ScheduleRsvpStatus, ScheduleRSVPView } from "./ScheduleRSVPView";

const meta: Meta<typeof ScheduleRSVPView> = {
  component: ScheduleRSVPView,
  args: {
    onRsvp: fn(),
    activities: [
      {
        activityId: "act-1",
        name: "Morning hike",
        timeLabel: "Morning",
        rsvp: undefined,
      },
      {
        activityId: "act-2",
        name: "Lunch at Barton Springs",
        timeLabel: "Afternoon",
        rsvp: ScheduleRsvpStatus.Confirmed,
      },
      {
        activityId: "act-3",
        name: "Sunset paddle",
        timeLabel: "Evening",
        rsvp: ScheduleRsvpStatus.Skipped,
      },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof ScheduleRSVPView>;

export const Default: Story = {};

export const AllConfirmed: Story = {
  args: {
    activities: [
      {
        activityId: "act-1",
        name: "Morning hike",
        timeLabel: "Morning",
        rsvp: ScheduleRsvpStatus.Confirmed,
      },
      {
        activityId: "act-2",
        name: "Lunch at Barton Springs",
        timeLabel: "Afternoon",
        rsvp: ScheduleRsvpStatus.Confirmed,
      },
    ],
  },
};

export const AllSkipped: Story = {
  args: {
    activities: [
      {
        activityId: "act-1",
        name: "Morning hike",
        timeLabel: "Morning",
        rsvp: ScheduleRsvpStatus.Skipped,
      },
      {
        activityId: "act-2",
        name: "Lunch at Barton Springs",
        timeLabel: "Afternoon",
        rsvp: ScheduleRsvpStatus.Skipped,
      },
    ],
  },
};

export const NoActivities: Story = {
  args: {
    activities: [],
  },
};
