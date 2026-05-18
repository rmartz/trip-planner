import { fn } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RsvpStatus, ScheduleRSVPView } from "./ScheduleRSVPView";

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
        rsvp: RsvpStatus.Confirmed,
      },
      {
        activityId: "act-3",
        name: "Sunset paddle",
        timeLabel: "Evening",
        rsvp: RsvpStatus.Skipped,
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
        rsvp: RsvpStatus.Confirmed,
      },
      {
        activityId: "act-2",
        name: "Lunch at Barton Springs",
        timeLabel: "Afternoon",
        rsvp: RsvpStatus.Confirmed,
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
        rsvp: RsvpStatus.Skipped,
      },
      {
        activityId: "act-2",
        name: "Lunch at Barton Springs",
        timeLabel: "Afternoon",
        rsvp: RsvpStatus.Skipped,
      },
    ],
  },
};

export const NoActivities: Story = {
  args: {
    activities: [],
  },
};
