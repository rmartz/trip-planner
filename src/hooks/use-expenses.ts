"use client";

import { useQuery } from "@tanstack/react-query";
import type { Expense } from "@/lib/types/expense";
import type {
  ExpenseCategory,
  ExpenseLinkedEntityType,
  ExpenseSplitMethod,
} from "@/lib/types/expense";

interface ExpenseJson {
  expenseId: string;
  tripId: string;
  name: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  payerUid: string;
  participantUids: string[];
  splitMethod: ExpenseSplitMethod;
  linkedEntity?: {
    type: string;
    entityId: string;
    label: string;
  };
}

interface ExpensesResponse {
  expenses: ExpenseJson[];
}

async function fetchExpenses(tripId: string): Promise<Expense[]> {
  const response = await fetch(`/api/trips/${tripId}/expenses`);
  if (!response.ok) throw new Error("Failed to fetch expenses");
  const data = (await response.json()) as ExpensesResponse;
  return data.expenses.map((e) => ({
    expenseId: e.expenseId,
    tripId: e.tripId,
    name: e.name,
    amount: e.amount,
    currency: e.currency,
    category: e.category,
    payerUid: e.payerUid,
    participantUids: e.participantUids,
    splitMethod: e.splitMethod,
    ...(e.linkedEntity !== undefined
      ? {
          linkedEntity: {
            type: e.linkedEntity.type as ExpenseLinkedEntityType,
            entityId: e.linkedEntity.entityId,
            label: e.linkedEntity.label,
          },
        }
      : {}),
  }));
}

export function expensesQueryOptions(tripId: string) {
  return {
    queryKey: ["expenses", tripId],
    queryFn: () => fetchExpenses(tripId),
  } as const;
}

export function useExpenses(tripId: string) {
  return useQuery(expensesQueryOptions(tripId));
}
