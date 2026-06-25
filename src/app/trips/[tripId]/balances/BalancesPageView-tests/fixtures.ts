import type { BalanceRow, TransferRow } from "../BalancesPageView";

export type AccountBalanceFixture = Omit<
  Extract<BalanceRow, { nonAccount?: false }>,
  "nonAccount" | "proxyName"
>;

export type NonAccountBalanceFixture = Omit<
  Extract<BalanceRow, { nonAccount: true }>,
  "nonAccount" | "proxyName"
>;

export function makeAccountBalance(
  overrides: Partial<AccountBalanceFixture> = {},
): BalanceRow {
  return {
    amountCents: 2500,
    currency: "USD",
    memberId: "member-alice",
    memberName: "Alice",
    ...overrides,
  };
}

export function makeNonAccountBalance(
  proxyName: string,
  overrides: Partial<NonAccountBalanceFixture> = {},
): BalanceRow {
  return {
    amountCents: 2500,
    currency: "USD",
    memberId: "member-alice",
    memberName: "Alice",
    nonAccount: true,
    proxyName,
    ...overrides,
  };
}

export function makeTransfer(
  overrides: Partial<TransferRow> = {},
): TransferRow {
  return {
    amountCents: 1200,
    currency: "USD",
    fromMemberId: "member-bob",
    fromMemberName: "Bob",
    toMemberId: "member-alice",
    toMemberName: "Alice",
    transferId: "transfer-1",
    ...overrides,
  };
}
