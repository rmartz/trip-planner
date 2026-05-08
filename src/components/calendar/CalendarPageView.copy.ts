export const CALENDAR_PAGE_COPY = {
  pageTitle: "Calendar",
  addBlockButtonLabel: "+ Block",
  prevMonthAriaLabel: "Previous month",
  nextMonthAriaLabel: "Next month",
  weekdayHeaders: ["S", "M", "T", "W", "T", "F", "S"] as const,
  upcomingBlocksSectionTitle: "Upcoming blocks",
  legendBlocked: "Blocked",
  legendConflict: "Conflicts trip",
  overlapWarningPrefix: "⚠ overlaps ",
  loadingText: "Loading...",
  errorText: "Failed to load calendar data.",
  emptyUpcomingText: "No upcoming blocks.",
} as const;
