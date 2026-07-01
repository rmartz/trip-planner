export const SCHEDULE_STATUSES = ["draft", "published"] as const;

export type ScheduleStatus = (typeof SCHEDULE_STATUSES)[number];
