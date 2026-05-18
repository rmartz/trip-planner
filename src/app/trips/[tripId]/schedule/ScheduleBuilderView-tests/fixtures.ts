import type { ProposedActivityItem } from "../ScheduleBuilderView";

export function makeActivity(
  overrides: Partial<ProposedActivityItem> = {},
): ProposedActivityItem {
  return {
    activityId: "activity-1",
    name: "Morning hike",
    pinned: false,
    timeOfDaySlot: undefined,
    order: 0,
    ...overrides,
  };
}
