import { describe, expect, it } from "vitest";
import { ExpenseCategory, ExpenseSplitMethod } from "@/lib/types/expense";
import { ExpenseUnitModel } from "@/lib/types/expense-settings";
import { expenseToFirebase, firebaseToExpense } from "./expense";

describe("firebaseToExpense — unit model override", () => {
  it("maps the unitModel override when present", () => {
    const expense = firebaseToExpense("exp-1", "trip-1", {
      name: "Ski passes",
      amount: 120,
      category: ExpenseCategory.Activity,
      payerUid: "uid-1",
      participantUids: ["uid-1"],
      splitMethod: ExpenseSplitMethod.Even,
      unitModel: ExpenseUnitModel.PerUnit,
    });
    expect(expense.unitModel).toBe(ExpenseUnitModel.PerUnit);
  });

  it("leaves unitModel undefined when absent", () => {
    const expense = firebaseToExpense("exp-1", "trip-1", {
      name: "Ski passes",
      amount: 120,
      category: ExpenseCategory.Activity,
      payerUid: "uid-1",
      participantUids: ["uid-1"],
      splitMethod: ExpenseSplitMethod.Even,
    });
    expect(expense.unitModel).toBeUndefined();
  });

  it("ignores an unrecognized unitModel value", () => {
    const expense = firebaseToExpense("exp-1", "trip-1", {
      name: "Ski passes",
      amount: 120,
      category: ExpenseCategory.Activity,
      payerUid: "uid-1",
      participantUids: ["uid-1"],
      splitMethod: ExpenseSplitMethod.Even,
      unitModel: "not_a_model",
    });
    expect(expense.unitModel).toBeUndefined();
  });
});

describe("expenseToFirebase — unit model override", () => {
  it("includes the unitModel override when provided", () => {
    const data = expenseToFirebase({
      name: "Ski passes",
      amount: 120,
      currency: "USD",
      category: ExpenseCategory.Activity,
      payerUid: "uid-1",
      participantUids: ["uid-1"],
      splitMethod: ExpenseSplitMethod.Even,
      unitModel: ExpenseUnitModel.SharedBucket,
    });
    expect(data.unitModel).toBe(ExpenseUnitModel.SharedBucket);
  });

  it("omits the unitModel key when undefined", () => {
    const data = expenseToFirebase({
      name: "Ski passes",
      amount: 120,
      currency: "USD",
      category: ExpenseCategory.Activity,
      payerUid: "uid-1",
      participantUids: ["uid-1"],
      splitMethod: ExpenseSplitMethod.Even,
    });
    expect("unitModel" in data).toBe(false);
  });
});
