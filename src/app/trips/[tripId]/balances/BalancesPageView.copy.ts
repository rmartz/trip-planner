export const BALANCES_PAGE_COPY = {
  balancesHeading: "Net balances",
  emptyText: "No balances to show yet.",
  errorText: "Couldn't load balances. Please try again.",
  heading: "Balances",
  headingSubtext: "Net per-member balances and recommended transfers",
  loadingText: "Loading balances…",
  markPaidLabel: "Mark paid",
  netCreditedLabel: "is owed",
  netOwedLabel: "owes",
  netSettledLabel: "is settled",
  pageTitle: "Balances",
  proxyLabel: (proxyName: string) => `(${proxyName} proxy)`,
  transferConnector: "→",
  transferFromWithProxies: (fromName: string, proxiedNames: string[]) =>
    `${fromName} (${proxiedNames.join(", ")})`,
  transfersEmpty: "No transfers needed.",
  transfersHeading: "Recommended transfers",
} as const;
