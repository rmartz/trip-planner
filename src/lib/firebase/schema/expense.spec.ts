import { describe, expect, it } from "vitest";
import {
  ExpenseCategory,
  ExpenseLinkedEntityType,
  ExpenseSplitMethod,
} from "@/lib/types/expense";
import { expenseToFirebase, firebaseToExpense } from "./expense";

// Fixtures
function makeLinkedEntity() {
  return {
    type: ExpenseLinkedEntityType.Stop,
    entityId: "stop-1",
    label: "Wimberley",
  };
}

describe("ExpenseCategory enum — five values", () => {
  it("has Lodging", () => {
    expect(ExpenseCategory.Lodging).toBeDefined();
  });

  it("has Food", () => {
    expect(ExpenseCategory.Food).toBeDefined();
  });

  it("has Transport", () => {
    expect(ExpenseCategory.Transport).toBeDefined();
  });

  it("has Activity", () => {
    expect(ExpenseCategory.Activity).toBeDefined();
  });

  it("has Other", () => {
    expect(ExpenseCategory.Other).toBeDefined();
  });
});

describe("ExpenseSplitMethod enum — even / rsvp / riders / custom", () => {
  it("has Even", () => {
    expect(ExpenseSplitMethod.Even).toBeDefined();
  });

  it("has Rsvp", () => {
    expect(ExpenseSplitMethod.Rsvp).toBeDefined();
  });

  it("has Riders", () => {
    expect(ExpenseSplitMethod.Riders).toBeDefined();
  });

  it("has Custom", () => {
    expect(ExpenseSplitMethod.Custom).toBeDefined();
  });
});

describe("ExpenseLinkedEntityType enum — stop / activity / leg", () => {
  it("has Stop", () => {
    expect(ExpenseLinkedEntityType.Stop).toBeDefined();
  });

  it("has Activity", () => {
    expect(ExpenseLinkedEntityType.Activity).toBeDefined();
  });

  it("has Leg", () => {
    expect(ExpenseLinkedEntityType.Leg).toBeDefined();
  });
});

describe("firebaseToExpense — deserializes Firestore data to Expense", () => {
  it("maps expenseId from argument", () => {
    const expense = firebaseToExpense("exp-1", "trip-1", {
      name: "Hotel",
      amount: 200,
      category: ExpenseCategory.Lodging,
      payerUid: "uid-1",
      participantUids: ["uid-1", "uid-2"],
      splitMethod: ExpenseSplitMethod.Even,
    });
    expect(expense.expenseId).toBe("exp-1");
  });

  it("maps tripId from argument", () => {
    const expense = firebaseToExpense("exp-1", "trip-abc", {
      name: "Hotel",
      amount: 200,
      category: ExpenseCategory.Lodging,
      payerUid: "uid-1",
      participantUids: ["uid-1"],
      splitMethod: ExpenseSplitMethod.Even,
    });
    expect(expense.tripId).toBe("trip-abc");
  });

  it("maps name", () => {
    const expense = firebaseToExpense("exp-1", "trip-1", {
      name: "Dinner",
      amount: 50,
      category: ExpenseCategory.Food,
      payerUid: "uid-1",
      participantUids: ["uid-1"],
      splitMethod: ExpenseSplitMethod.Even,
    });
    expect(expense.name).toBe("Dinner");
  });

  it("maps amount", () => {
    const expense = firebaseToExpense("exp-1", "trip-1", {
      name: "Bus",
      amount: 35.5,
      category: ExpenseCategory.Transport,
      payerUid: "uid-1",
      participantUids: ["uid-1"],
      splitMethod: ExpenseSplitMethod.Riders,
    });
    expect(expense.amount).toBe(35.5);
  });

  it("maps category", () => {
    const expense = firebaseToExpense("exp-1", "trip-1", {
      name: "Tour",
      amount: 100,
      category: ExpenseCategory.Activity,
      payerUid: "uid-1",
      participantUids: ["uid-1"],
      splitMethod: ExpenseSplitMethod.Rsvp,
    });
    expect(expense.category).toBe(ExpenseCategory.Activity);
  });

  it("maps payerUid", () => {
    const expense = firebaseToExpense("exp-1", "trip-1", {
      name: "x",
      amount: 10,
      category: ExpenseCategory.Other,
      payerUid: "uid-payer",
      participantUids: ["uid-payer"],
      splitMethod: ExpenseSplitMethod.Even,
    });
    expect(expense.payerUid).toBe("uid-payer");
  });

  it("maps participantUids", () => {
    const expense = firebaseToExpense("exp-1", "trip-1", {
      name: "x",
      amount: 10,
      category: ExpenseCategory.Other,
      payerUid: "uid-1",
      participantUids: ["uid-1", "uid-2", "uid-3"],
      splitMethod: ExpenseSplitMethod.Even,
    });
    expect(expense.participantUids).toEqual(["uid-1", "uid-2", "uid-3"]);
  });

  it("maps splitMethod", () => {
    const expense = firebaseToExpense("exp-1", "trip-1", {
      name: "x",
      amount: 10,
      category: ExpenseCategory.Other,
      payerUid: "uid-1",
      participantUids: ["uid-1"],
      splitMethod: ExpenseSplitMethod.Custom,
    });
    expect(expense.splitMethod).toBe(ExpenseSplitMethod.Custom);
  });

  it("maps optional linkedEntity when present", () => {
    const linked = makeLinkedEntity();
    const expense = firebaseToExpense("exp-1", "trip-1", {
      name: "x",
      amount: 10,
      category: ExpenseCategory.Lodging,
      payerUid: "uid-1",
      participantUids: ["uid-1"],
      splitMethod: ExpenseSplitMethod.Even,
      linkedEntity: linked,
    });
    expect(expense.linkedEntity).toEqual(linked);
  });

  it("leaves linkedEntity undefined when absent", () => {
    const expense = firebaseToExpense("exp-1", "trip-1", {
      name: "x",
      amount: 10,
      category: ExpenseCategory.Other,
      payerUid: "uid-1",
      participantUids: ["uid-1"],
      splitMethod: ExpenseSplitMethod.Even,
    });
    expect(expense.linkedEntity).toBeUndefined();
  });

  it("falls back to 0 for amount when absent", () => {
    const expense = firebaseToExpense("exp-1", "trip-1", {
      name: "x",
      category: ExpenseCategory.Other,
      payerUid: "uid-1",
      participantUids: [],
      splitMethod: ExpenseSplitMethod.Even,
    });
    expect(expense.amount).toBe(0);
  });

  it("falls back to USD for currency when absent", () => {
    const expense = firebaseToExpense("exp-1", "trip-1", {
      name: "x",
      amount: 10,
      category: ExpenseCategory.Other,
      payerUid: "uid-1",
      participantUids: ["uid-1"],
      splitMethod: ExpenseSplitMethod.Even,
    });
    expect(expense.currency).toBe("USD");
  });
});

describe("expenseToFirebase — serializes Expense to Firestore data", () => {
  it("maps name", () => {
    const data = expenseToFirebase({
      name: "Airbnb",
      amount: 500,
      currency: "USD",
      category: ExpenseCategory.Lodging,
      payerUid: "uid-1",
      participantUids: ["uid-1", "uid-2"],
      splitMethod: ExpenseSplitMethod.Even,
    });
    expect(data.name).toBe("Airbnb");
  });

  it("maps amount", () => {
    const data = expenseToFirebase({
      name: "x",
      amount: 99.99,
      currency: "USD",
      category: ExpenseCategory.Food,
      payerUid: "uid-1",
      participantUids: ["uid-1"],
      splitMethod: ExpenseSplitMethod.Even,
    });
    expect(data.amount).toBe(99.99);
  });

  it("maps category", () => {
    const data = expenseToFirebase({
      name: "x",
      amount: 10,
      currency: "USD",
      category: ExpenseCategory.Transport,
      payerUid: "uid-1",
      participantUids: ["uid-1"],
      splitMethod: ExpenseSplitMethod.Riders,
    });
    expect(data.category).toBe(ExpenseCategory.Transport);
  });

  it("maps payerUid", () => {
    const data = expenseToFirebase({
      name: "x",
      amount: 10,
      currency: "USD",
      category: ExpenseCategory.Other,
      payerUid: "uid-xyz",
      participantUids: ["uid-xyz"],
      splitMethod: ExpenseSplitMethod.Even,
    });
    expect(data.payerUid).toBe("uid-xyz");
  });

  it("maps participantUids", () => {
    const data = expenseToFirebase({
      name: "x",
      amount: 10,
      currency: "USD",
      category: ExpenseCategory.Other,
      payerUid: "uid-1",
      participantUids: ["uid-1", "uid-2"],
      splitMethod: ExpenseSplitMethod.Even,
    });
    expect(data.participantUids).toEqual(["uid-1", "uid-2"]);
  });

  it("maps splitMethod", () => {
    const data = expenseToFirebase({
      name: "x",
      amount: 10,
      currency: "USD",
      category: ExpenseCategory.Activity,
      payerUid: "uid-1",
      participantUids: ["uid-1"],
      splitMethod: ExpenseSplitMethod.Rsvp,
    });
    expect(data.splitMethod).toBe(ExpenseSplitMethod.Rsvp);
  });

  it("includes linkedEntity when provided", () => {
    const linked = makeLinkedEntity();
    const data = expenseToFirebase({
      name: "x",
      amount: 10,
      currency: "USD",
      category: ExpenseCategory.Lodging,
      payerUid: "uid-1",
      participantUids: ["uid-1"],
      splitMethod: ExpenseSplitMethod.Even,
      linkedEntity: linked,
    });
    expect(data.linkedEntity).toEqual(linked);
  });

  it("omits linkedEntity key when undefined", () => {
    const data = expenseToFirebase({
      name: "x",
      amount: 10,
      currency: "USD",
      category: ExpenseCategory.Other,
      payerUid: "uid-1",
      participantUids: ["uid-1"],
      splitMethod: ExpenseSplitMethod.Even,
    });
    expect("linkedEntity" in data).toBe(false);
  });

  it("maps currency", () => {
    const data = expenseToFirebase({
      name: "x",
      amount: 10,
      currency: "EUR",
      category: ExpenseCategory.Other,
      payerUid: "uid-1",
      participantUids: ["uid-1"],
      splitMethod: ExpenseSplitMethod.Even,
    });
    expect(data.currency).toBe("EUR");
  });
});
