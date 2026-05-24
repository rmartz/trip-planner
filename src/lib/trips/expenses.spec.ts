import { describe, expect, it } from "vitest";
import { ExpenseCategory, ExpenseSplitMethod } from "@/lib/types/expense";
import type { Expense } from "@/lib/types/expense";
import { computeNetBalances } from "./expenses";

function makeExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    expenseId: "exp-1",
    tripId: "trip-1",
    name: "Dinner",
    amount: 100,
    currency: "USD",
    category: ExpenseCategory.Food,
    payerUid: "uid-a",
    participantUids: ["uid-a"],
    splitMethod: ExpenseSplitMethod.Even,
    ...overrides,
  };
}

describe("computeNetBalances — empty expense list", () => {
  it("returns an empty map when there are no expenses", () => {
    const result = computeNetBalances([]);
    expect(result.size).toBe(0);
  });
});

describe("computeNetBalances — single expense, payer is sole participant", () => {
  it("gives the payer zero net balance when they are the only participant", () => {
    const expense = makeExpense({
      payerUid: "uid-a",
      participantUids: ["uid-a"],
      amount: 100,
    });
    const result = computeNetBalances([expense]);
    expect(result.get("uid-a")).toBe(0);
  });
});

describe("computeNetBalances — payer credits", () => {
  it("credits the payer with the full expense amount", () => {
    const expense = makeExpense({
      payerUid: "uid-a",
      participantUids: ["uid-a", "uid-b"],
      amount: 100,
    });
    const result = computeNetBalances([expense]);
    // uid-a paid 10000 cents, owes 5000 cents → net +5000 cents
    expect(result.get("uid-a")).toBe(5000);
  });

  it("uses the exact amount stored on the expense for the credit", () => {
    const expense = makeExpense({
      payerUid: "uid-a",
      participantUids: ["uid-a", "uid-b"],
      amount: 75,
    });
    const result = computeNetBalances([expense]);
    // paid 7500 cents, owes 3750 cents → net +3750 cents
    expect(result.get("uid-a")).toBe(3750);
  });
});

describe("computeNetBalances — even split debits", () => {
  it("debits each participant their equal share", () => {
    const expense = makeExpense({
      payerUid: "uid-a",
      participantUids: ["uid-a", "uid-b", "uid-c"],
      amount: 90,
    });
    const result = computeNetBalances([expense]);
    // uid-b and uid-c each owe 3000 cents
    expect(result.get("uid-b")).toBe(-3000);
    expect(result.get("uid-c")).toBe(-3000);
  });

  it("computes zero net balance for payer who is sole participant", () => {
    const expense = makeExpense({
      payerUid: "uid-a",
      participantUids: ["uid-a"],
      amount: 60,
    });
    const result = computeNetBalances([expense]);
    expect(result.get("uid-a")).toBe(0);
  });
});

describe("computeNetBalances — multiple expenses accumulate correctly", () => {
  it("sums credits and debits across multiple expenses", () => {
    const exp1 = makeExpense({
      expenseId: "exp-1",
      payerUid: "uid-a",
      participantUids: ["uid-a", "uid-b"],
      amount: 100,
    });
    const exp2 = makeExpense({
      expenseId: "exp-2",
      payerUid: "uid-b",
      participantUids: ["uid-a", "uid-b"],
      amount: 60,
    });
    const result = computeNetBalances([exp1, exp2]);
    // uid-a: paid 10000 cents, owes 5000 (exp1) + 3000 (exp2) = 8000 → net +2000 cents
    expect(result.get("uid-a")).toBe(2000);
    // uid-b: paid 6000 cents, owes 5000 (exp1) + 3000 (exp2) = 8000 → net -2000 cents
    expect(result.get("uid-b")).toBe(-2000);
  });

  it("includes a member in the result only for expenses they are involved in", () => {
    const exp1 = makeExpense({
      expenseId: "exp-1",
      payerUid: "uid-a",
      participantUids: ["uid-a", "uid-b"],
      amount: 100,
    });
    const exp2 = makeExpense({
      expenseId: "exp-2",
      payerUid: "uid-a",
      participantUids: ["uid-a", "uid-c"],
      amount: 60,
    });
    const result = computeNetBalances([exp1, exp2]);
    expect(result.has("uid-b")).toBe(true);
    expect(result.has("uid-c")).toBe(true);
    expect(result.get("uid-b")).toBe(-5000);
    expect(result.get("uid-c")).toBe(-3000);
  });
});

describe("computeNetBalances — non-participating payer", () => {
  it("credits the payer even when they are not a participant", () => {
    const expense = makeExpense({
      payerUid: "uid-a",
      participantUids: ["uid-b", "uid-c"],
      amount: 60,
    });
    const result = computeNetBalances([expense]);
    // uid-a paid 6000 cents, owes nothing → net +6000 cents
    expect(result.get("uid-a")).toBe(6000);
    expect(result.get("uid-b")).toBe(-3000);
    expect(result.get("uid-c")).toBe(-3000);
  });
});

describe("computeNetBalances — rounding", () => {
  it("distributes remainder cents so that all balances sum to zero", () => {
    // $100 split 3 ways: 10000 cents / 3 = 3333 each + 1 cent remainder.
    const expense = makeExpense({
      payerUid: "uid-a",
      participantUids: ["uid-a", "uid-b", "uid-c"],
      amount: 100,
    });
    const result = computeNetBalances([expense]);
    const total = Array.from(result.values()).reduce((sum, v) => sum + v, 0);
    expect(total).toBe(0);
  });
});
