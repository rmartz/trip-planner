export const SCHEDULE_PAGE_COPY = {
  emptyDayMessage: "No activities scheduled.",
  emptyScheduleMessage: "No activities scheduled yet.",
  heading: "Schedule",
  headingSubtext: "Published itinerary",
  pageTitle: "Schedule",
  timeLockedHeading: "Time-locked",
  timeLockedSlotLabel: (slot: string) => `${slot} 🔒`,
  timeSlotLabel: (slot: string) => slot,
} as const;
