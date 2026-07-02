import { describe, expect, it } from "vitest";
import {
  type Activity,
  TimeOfDaySlot,
  TimeOfDaySlotType,
} from "@/lib/types/activity";
import { toProposedActivityItems } from "./ScheduleBuilder";

function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    activityId: "activity-1",
    stopId: "stop-1",
    tripId: "trip-1",
    name: "Morning hike",
    estimatedDurationMinutes: 120,
    ...overrides,
  };
}

describe("toProposedActivityItems", () => {
  it("maps a pinned activity's pinnedSlot onto the proposed item", () => {
    const items = toProposedActivityItems([
      makeActivity({
        activityId: "a-pinned",
        pinned: true,
        pinnedSlot: TimeOfDaySlot.Evening,
      }),
    ]);

    expect(items[0]).toEqual({
      activityId: "a-pinned",
      name: "Morning hike",
      pinned: true,
      timeOfDaySlot: TimeOfDaySlot.Evening,
      order: 0,
    });
  });

  it("derives the slot from the first preferred slot when not pinned", () => {
    const [item] = toProposedActivityItems([
      makeActivity({
        activityId: "a-proposed",
        timeOfDaySlot: {
          type: TimeOfDaySlotType.PreferredIn,
          slots: [TimeOfDaySlot.Afternoon, TimeOfDaySlot.Evening],
        },
      }),
    ]);

    expect(item?.pinned).toBe(false);
    expect(item?.timeOfDaySlot).toBe(TimeOfDaySlot.Afternoon);
  });

  it("assigns order by array position", () => {
    const items = toProposedActivityItems([
      makeActivity({ activityId: "a-1" }),
      makeActivity({ activityId: "a-2" }),
    ]);

    expect(items.map((item) => item.order)).toEqual([0, 1]);
  });
});
