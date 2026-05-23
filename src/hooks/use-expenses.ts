"use client";

import { useQuery } from "@tanstack/react-query";
import type { Expense } from "@/lib/types/expense";

interface ExpensesResponse {
  expenses: Expense[];
}

async function fetchExpenses(tripId: string): Promise<Expense[]> {
  const response = await fetch(`/api/trips/${tripId}/expenses`);
  if (!response.ok) {
    throw new Error(`Failed to fetch expenses (${String(response.status)})`);
  }
  const data = (await response.json()) as ExpensesResponse;
  return data.expenses;
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
