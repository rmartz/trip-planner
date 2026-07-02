import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { TimeOfDaySlot } from "@/lib/types/activity";
import { ScheduleBuilderView } from "./ScheduleBuilderView";
import { SCHEDULE_BUILDER_COPY } from "./ScheduleBuilderView.copy";
import { makeActivity } from "./ScheduleBuilderView.fixtures";

const meta: Meta<typeof ScheduleBuilderView> = {
  component: ScheduleBuilderView,
  args: {
    stopName: "London",
    activities: [],
    onReorder: fn(),
    onPublish: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof ScheduleBuilderView>;

export const Empty: Story = {};

export const WithPinnedOnly: Story = {
  args: {
    activities: [
      makeActivity({
        activityId: "a-1",
        name: "Birthday dinner",
        pinned: true,
        timeOfDaySlot: TimeOfDaySlot.Evening,
      }),
    ],
  },
};

export const WithProposedOnly: Story = {
  args: {
    activities: [
      makeActivity({
        activityId: "a-1",
        name: "Walking tour",
        pinned: false,
        timeOfDaySlot: TimeOfDaySlot.Morning,
        order: 0,
      }),
      makeActivity({
        activityId: "a-2",
        name: "Museum visit",
        pinned: false,
        timeOfDaySlot: undefined,
        order: 1,
      }),
      makeActivity({
        activityId: "a-3",
        name: "Dinner at the harbor",
        pinned: false,
        timeOfDaySlot: TimeOfDaySlot.Evening,
        order: 2,
      }),
    ],
  },
};

export const WithPinnedAndProposed: Story = {
  args: {
    activities: [
      makeActivity({
        activityId: "a-pinned-1",
        name: "Welcome breakfast",
        pinned: true,
        timeOfDaySlot: TimeOfDaySlot.Morning,
        order: 0,
      }),
      makeActivity({
        activityId: "a-pinned-2",
        name: "Group photo session",
        pinned: true,
        timeOfDaySlot: undefined,
        order: 1,
      }),
      makeActivity({
        activityId: "a-1",
        name: "Walking tour",
        pinned: false,
        timeOfDaySlot: TimeOfDaySlot.Afternoon,
        order: 0,
      }),
      makeActivity({
        activityId: "a-2",
        name: "Museum visit",
        pinned: false,
        timeOfDaySlot: undefined,
        order: 1,
      }),
      makeActivity({
        activityId: "a-3",
        name: "Dinner at the harbor",
        pinned: false,
        timeOfDaySlot: TimeOfDaySlot.Evening,
        order: 2,
      }),
    ],
  },
};

const proposedActivities = [
  makeActivity({
    activityId: "a-1",
    name: "Walking tour",
    pinned: false,
    timeOfDaySlot: TimeOfDaySlot.Morning,
    order: 0,
  }),
  makeActivity({
    activityId: "a-2",
    name: "Museum visit",
    pinned: false,
    timeOfDaySlot: undefined,
    order: 1,
  }),
];

export const Publishing: Story = {
  args: {
    activities: proposedActivities,
    isPublishing: true,
  },
};

export const Published: Story = {
  args: {
    activities: proposedActivities,
    isPublished: true,
  },
};

export const PublishError: Story = {
  args: {
    activities: proposedActivities,
    errorMessage: SCHEDULE_BUILDER_COPY.forbiddenError,
  },
};
