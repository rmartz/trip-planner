"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ExpenseCategory,
  ExpenseLinkedEntity,
  ExpenseSplitMethod,
} from "@/lib/types/expense";
import type { ExpenseUnitModel } from "@/lib/types/expense-settings";

interface CreateExpenseInput {
  amount: number;
  currency: string;
  category: ExpenseCategory;
  name: string;
  payerUid: string;
  participantUids: string[];
  splitMethod: ExpenseSplitMethod;
  linkedEntity?: ExpenseLinkedEntity;
  unitModel?: ExpenseUnitModel;
}

async function createExpense(
  tripId: string,
  input: CreateExpenseInput,
): Promise<string> {
  const response = await fetch(`/api/trips/${tripId}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error("Failed to create expense");
  const data = (await response.json()) as { expenseId: string };
  return data.expenseId;
}

export function useCreateExpense(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExpenseInput) => createExpense(tripId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
    },
  });
}
