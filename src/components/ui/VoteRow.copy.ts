export const VOTE_ROW_COPY = {
  aggregateCounts: (yes: number, maybe: number, no: number) =>
    `Y ${yes} · M ${maybe} · N ${no}`,
  maybeLabel: "Maybe",
  noLabel: "No",
  yesLabel: "Yes",
} as const;
