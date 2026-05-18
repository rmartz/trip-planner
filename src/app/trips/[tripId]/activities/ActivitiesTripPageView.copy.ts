export const ACTIVITIES_TRIP_PAGE_COPY = {
  byNameSubheader: "by name:",
  emptyText: "No activities have been proposed for this trip yet.",
  errorText: "Couldn't load activities for this trip. Please try again.",
  heading: "Activities",
  loadingText: "Loading activities…",
  maybeCategoryLabel: "M",
  noCategoryLabel: "N",
  overflowLabel: (n: number) => `+${String(n)}`,
  pageTitle: "Activities",
  proposedByPrefix: "Proposed by",
  timeHintPrefix: "Suggested time:",
  yesCategoryLabel: "Y",
} as const;
