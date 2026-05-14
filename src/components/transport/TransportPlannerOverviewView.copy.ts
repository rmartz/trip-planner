export const TRANSPORT_PLANNER_OVERVIEW_COPY = {
  demandCardTitle: "Demand",
  demandDriving: "Driving",
  demandHaveOwn: "Have own",
  demandNeedRide: "Need ride",
  demandNoReply: "No reply",
  demandSkipLeg: "Skip leg",
  driversLabel: (count: number) =>
    `${String(count)} ${count === 1 ? "driver" : "drivers"}`,
  emptyLegsMessage: "No travel legs yet.",
  gapPill: (gap: number) => `${String(gap)} short`,
  heading: "Transportation",
  headingSubtext: "Per-leg capacity and demand",
  inviteOnlyVisibility: (count: number) => `invite-only (${String(count)})`,
  okPill: "Covered",
  publicVisibility: "public",
  seatsLabel: (count: number) =>
    `${String(count)} ${count === 1 ? "seat" : "seats"}`,
  supplyCardTitle: "Supply",
} as const;
