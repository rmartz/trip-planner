import { describe, expect, it } from "vitest";
import { computeNetBalances } from "@/lib/trips/expenses";
import {
  type Expense,
  ExpenseCategory,
  ExpenseSplitMethod,
} from "@/lib/types/expense";

function makeExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    amount: 12,
    category: ExpenseCategory.Other,
    currency: "USD",
    expenseId: "expense-1",
    name: "Expense",
    participantUids: ["uid-a", "uid-b", "uid-c"],
    payerUid: "uid-a",
    splitMethod: ExpenseSplitMethod.Even,
    tripId: "trip-1",
    ...overrides,
  };
}

describe("computeNetBalances", () => {
  it("applies Even split with deterministic remainder-cent distribution", () => {
    const balances = computeNetBalances([makeExpense({ amount: 10.01 })]);
    expect(balances.get("uid-a")).toBe(667);
    expect(balances.get("uid-b")).toBe(-334);
    expect(balances.get("uid-c")).toBe(-333);
  });

  it("applies Custom split using per-participant custom amounts", () => {
    const balances = computeNetBalances([
      makeExpense({
        amount: 999,
        participantAmounts: {
          "uid-a": 3.75,
          "uid-b": 2.25,
        },
        participantUids: ["uid-a", "uid-b"],
        splitMethod: ExpenseSplitMethod.Custom,
      }),
    ]);

    expect(balances.get("uid-a")).toBe(225);
    expect(balances.get("uid-b")).toBe(-225);
  });

  it("applies Riders split proportionally to usage shares", () => {
    const balances = computeNetBalances([
      makeExpense({
        amount: 10,
        participantShares: {
          "uid-a": 2,
          "uid-b": 1,
          "uid-c": 1,
        },
        splitMethod: ExpenseSplitMethod.Riders,
      }),
    ]);

    expect(balances.get("uid-a")).toBe(500);
    expect(balances.get("uid-b")).toBe(-250);
    expect(balances.get("uid-c")).toBe(-250);
  });

  it("applies Rsvp split to confirmed participants only", () => {
    const balances = computeNetBalances([
      makeExpense({
        amount: 9,
        confirmedParticipantUids: ["uid-a", "uid-c"],
        splitMethod: ExpenseSplitMethod.Rsvp,
      }),
    ]);

    expect(balances.get("uid-a")).toBe(450);
    expect(balances.get("uid-b")).toBeUndefined();
    expect(balances.get("uid-c")).toBe(-450);
  });

  it("deduplicates participant UIDs in Even split", () => {
    const balances = computeNetBalances([
      makeExpense({ amount: 9, participantUids: ["uid-a", "uid-b", "uid-a"] }),
    ]);
    expect(balances.get("uid-a")).toBe(450);
    expect(balances.get("uid-b")).toBe(-450);
  });

  it("aggregates weights for duplicate UIDs in Riders split", () => {
    const balances = computeNetBalances([
      makeExpense({
        amount: 10,
        participantShares: { "uid-a": 1, "uid-b": 3 },
        participantUids: ["uid-a", "uid-b", "uid-a"],
        splitMethod: ExpenseSplitMethod.Riders,
      }),
    ]);
    expect(balances.get("uid-a")).toBe(600);
    expect(balances.get("uid-b")).toBe(-600);
  });

  it("ignores expenses where a split method has no effective participants", () => {
    const balances = computeNetBalances([
      makeExpense({ participantUids: [] }),
      makeExpense({
        amount: 10,
        participantShares: { "uid-a": 0, "uid-b": 0, "uid-c": 0 },
        splitMethod: ExpenseSplitMethod.Riders,
      }),
      makeExpense({
        amount: 10,
        confirmedParticipantUids: [],
        splitMethod: ExpenseSplitMethod.Rsvp,
      }),
      makeExpense({
        amount: 10,
        participantAmounts: {},
        splitMethod: ExpenseSplitMethod.Custom,
      }),
    ]);

    expect(balances.size).toBe(0);
  });
});
