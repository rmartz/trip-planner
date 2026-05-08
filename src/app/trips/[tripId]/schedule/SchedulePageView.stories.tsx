import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SchedulePageView } from "./SchedulePageView";

const meta: Meta<typeof SchedulePageView> = {
  component: SchedulePageView,
  args: {
    days: [],
  },
};

export default meta;

type Story = StoryObj<typeof SchedulePageView>;

export const Empty: Story = {};

export const WithSchedule: Story = {
  args: {
    days: [
      {
        dayKey: "day-1",
        label: "Mon, Jun 1",
        activities: [
          {
            activityId: "a-1",
            name: "Welcome breakfast",
            timeSlot: "09:00",
            order: 0,
          },
          {
            activityId: "a-2",
            name: "Walking tour",
            timeSlot: "11:00",
            order: 1,
          },
          {
            activityId: "a-3",
            name: "Dinner reservation",
            timeSlot: "19:30",
            order: 2,
          },
        ],
      },
      {
        dayKey: "day-2",
        label: "Tue, Jun 2",
        activities: [
          {
            activityId: "a-4",
            name: "Museum visit",
            timeSlot: "10:00",
            order: 0,
          },
        ],
      },
      {
        dayKey: "day-3",
        label: "Wed, Jun 3",
        activities: [],
      },
    ],
  },
};
