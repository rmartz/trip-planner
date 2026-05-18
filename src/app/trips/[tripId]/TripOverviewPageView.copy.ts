export const TRIP_OVERVIEW_PAGE_COPY = {
  errorText: "Couldn't load this trip. Please try again.",
  loadingText: "Loading trip…",
  lodgingGapSubline: (count: number) =>
    `${String(count)} ${count === 1 ? "gap" : "gaps"}`,
  notFoundText: "Trip not found.",
  sectionActivities: "Activities",
  sectionArchive: "Archive",
  sectionAvailability: "Availability",
  sectionBalances: "Balances",
  sectionDestinations: "Destinations",
  sectionExpenses: "Expenses",
  sectionLodging: "Lodging",
  sectionMembers: "Members",
  sectionRsvp: "RSVP",
  sectionSchedule: "Schedule",
  sectionStructure: "Structure",
  sectionTransport: "Transportation",
  sectionsHeading: "Plan & coordinate",
  transportGapSubline: (count: number) =>
    `${String(count)} ${count === 1 ? "gap" : "gaps"}`,
} as const;
