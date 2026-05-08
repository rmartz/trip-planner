export const SCREEN_AVAILABILITY_COPY = {
  loadingText: "Loading availability…",
  errorText: "Failed to load availability.",
  emptyDatesText: "No dates to display.",
  legendFew: "few free",
  legendAllFree: "all free",
  legendConflictsYou: "conflicts you",
  bestWindowsSectionTitle: "Best windows",
  noBestWindowsText: "No windows with full availability yet.",
  conflictWarningPrefix: "⚠ overlaps ",
  freeCountLabel: (free: number, total: number) => `${String(free)}/${String(total)}`,
} as const;
