export const TRANSPORT_PLANNER_OVERVIEW_COPY = {
  capacityCardTitle: "Capacity",
  capacityLabel: (seats: number) =>
    `${String(seats)} ${seats === 1 ? "seat" : "seats"}`,
  demandCardTitle: "Demand",
  demandRiders: "Riders needed",
  driverLabel: (count: number) =>
    `${String(count)} ${count === 1 ? "driver" : "drivers"}`,
  emptyLegsMessage: "No travel legs yet.",
  gapPill: (gap: number) => `${String(gap)} short`,
  heading: "Transportation",
  headingSubtext: "Per-leg capacity and demand",
  okPill: "Covered",
  passengersLabel: (count: number) =>
    `${String(count)} ${count === 1 ? "rider" : "riders"}`,
} as const;
