import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";
import { ExpenseCategory, ExpenseSplitMethod } from "@/lib/types/expense";
import type { Expense } from "@/lib/types/expense";

export function makeExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    expenseId: "exp-1",
    tripId: "trip-1",
    name: "Hotel stay",
    amount: 150,
    currency: "USD",
    category: ExpenseCategory.Lodging,
    payerUid: "uid-alice",
    participantUids: ["uid-alice", "uid-bob"],
    splitMethod: ExpenseSplitMethod.Even,
    ...overrides,
  };
}

export function makeGetRequest(uid: string | undefined, tripId = "trip-1") {
  const headers = new Headers();
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  return new NextRequest(`http://localhost/api/trips/${tripId}/expenses`, {
    headers,
  });
}

export function makePostRequest(
  uid: string | undefined,
  body: unknown,
  tripId = "trip-1",
  options: { malformedJson?: boolean; nullBody?: boolean } = {},
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (uid !== undefined) headers.set(X_USER_ID_HEADER, uid);
  let bodyStr: string;
  if (options.malformedJson) {
    bodyStr = "not-json";
  } else if (options.nullBody) {
    bodyStr = "null";
  } else {
    bodyStr = JSON.stringify(body);
  }
  return new NextRequest(`http://localhost/api/trips/${tripId}/expenses`, {
    method: "POST",
    headers,
    body: bodyStr,
  });
}

export const VALID_BODY = {
  name: "Hotel stay",
  amount: 150,
  currency: "USD",
  category: ExpenseCategory.Lodging,
  payerUid: "uid-alice",
  participantUids: ["uid-alice", "uid-bob"],
  splitMethod: ExpenseSplitMethod.Even,
};
