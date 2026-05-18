export const TRANSPORT_GUEST_OVERVIEW_COPY = {
  claimSeatButton: "Claim a seat",
  claimSeatAriaLabel: (driverName: string) => `Claim a seat from ${driverName}`,
  emptyOffersText: "No seat offers visible for this leg yet.",
  heading: "Your transport",
  headingSubtext: "Seat offers visible to you for each leg",
  noLegsText: "No travel legs on this trip yet.",
  seatOfferLabel: (driverName: string) => `Visible to you · ${driverName}`,
  seatsAvailable: (n: number) =>
    `seat available · ${String(n)} ${n === 1 ? "spot" : "spots"} open`,
} as const;
