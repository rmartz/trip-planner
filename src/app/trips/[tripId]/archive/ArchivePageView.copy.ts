export const ARCHIVE_PAGE_COPY = {
  heading: "Archive",
  subtext: "soft-deleted · planner only",
  removedLegsHeading: (count: number) => `Removed legs · ${count}`,
  restoreButton: "Restore",
  deleteForeverButton: "Delete forever",
  emptyState: "No archived legs.",
} as const;
