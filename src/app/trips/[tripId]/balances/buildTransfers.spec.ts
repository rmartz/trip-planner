import { describe, expect, it } from "vitest";
import { buildTransfers } from "./buildTransfers";
import type { BalanceRow } from "./BalancesPageView";

function makeBalance(
  overrides: {
    amountCents?: number;
    currency?: string;
    memberId?: string;
    memberName?: string;
  } = {},
): BalanceRow {
  return {
    amountCents: 5000,
    currency: "USD",
    memberId: "member-alice",
    memberName: "Alice",
    ...overrides,
  };
}

describe("buildTransfers — currency derived from balance data, not hard-coded", () => {
  it("uses the currency from the balance rows when currency is EUR", () => {
    const balances = [
      makeBalance({
        amountCents: 3000,
        currency: "EUR",
        memberId: "m-a",
        memberName: "A",
      }),
      makeBalance({
        amountCents: -3000,
        currency: "EUR",
        memberId: "m-b",
        memberName: "B",
      }),
    ];
    const [transfer] = buildTransfers(balances, new Set());
    expect(transfer?.currency).toBe("EUR");
  });

  it("uses USD when balances carry USD", () => {
    const balances = [
      makeBalance({
        amountCents: 2000,
        currency: "USD",
        memberId: "m-a",
        memberName: "A",
      }),
      makeBalance({
        amountCents: -2000,
        currency: "USD",
        memberId: "m-b",
        memberName: "B",
      }),
    ];
    const [transfer] = buildTransfers(balances, new Set());
    expect(transfer?.currency).toBe("USD");
  });
});

describe("buildTransfers — integer cents without float conversion", () => {
  it("returns exact integer cent amounts for 1-cent balances", () => {
    const balances = [
      makeBalance({ amountCents: 1, memberId: "m-a", memberName: "A" }),
      makeBalance({ amountCents: -1, memberId: "m-b", memberName: "B" }),
    ];
    const [transfer] = buildTransfers(balances, new Set());
    expect(transfer?.amountCents).toBe(1);
  });

  it("returns exact integer cent amounts for amounts that are not round dollars", () => {
    const balances = [
      makeBalance({ amountCents: 333, memberId: "m-a", memberName: "A" }),
      makeBalance({ amountCents: -333, memberId: "m-b", memberName: "B" }),
    ];
    const [transfer] = buildTransfers(balances, new Set());
    expect(transfer?.amountCents).toBe(333);
  });

  it("amountCents is a whole integer with no fractional component", () => {
    const balances = [
      makeBalance({ amountCents: 10, memberId: "m-a", memberName: "A" }),
      makeBalance({ amountCents: -10, memberId: "m-b", memberName: "B" }),
    ];
    const [transfer] = buildTransfers(balances, new Set());
    expect(Number.isInteger(transfer?.amountCents)).toBe(true);
  });
});

describe("buildTransfers — transferId includes amount in cents", () => {
  it("transferId contains the transfer amount in cents", () => {
    const balances = [
      makeBalance({
        amountCents: 5000,
        memberId: "m-alice",
        memberName: "Alice",
      }),
      makeBalance({
        amountCents: -5000,
        memberId: "m-bob",
        memberName: "Bob",
      }),
    ];
    const [transfer] = buildTransfers(balances, new Set());
    expect(transfer?.transferId).toContain("5000");
  });

  it("a settled transfer ID does not suppress a transfer with a different amount between the same parties", () => {
    // Settle the 5000-cent transfer
    const oldSettledId = "m-bob-m-alice-5000";
    // Now the balance changes to 6000 cents
    const balances = [
      makeBalance({
        amountCents: 6000,
        memberId: "m-alice",
        memberName: "Alice",
      }),
      makeBalance({
        amountCents: -6000,
        memberId: "m-bob",
        memberName: "Bob",
      }),
    ];
    const transfers = buildTransfers(balances, new Set([oldSettledId]));
    // The new 6000-cent transfer has a different ID, so it must not be filtered out
    expect(transfers).toHaveLength(1);
    expect(transfers[0]?.amountCents).toBe(6000);
  });
});
