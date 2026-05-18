"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ExpenseCategory,
  ExpenseLinkedEntity,
  ExpenseSplitMethod,
} from "@/lib/types/expense";

interface CreateExpenseInput {
  tripId: string;
  name: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  payerUid: string;
  participantUids: string[];
  splitMethod: ExpenseSplitMethod;
  linkedEntity?: ExpenseLinkedEntity;
}

async function createExpense(input: CreateExpenseInput): Promise<string> {
  const { tripId, ...body } = input;
  const response = await fetch(`/api/trips/${tripId}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Failed to create expense");
  const data = (await response.json()) as { expenseId: string };
  return data.expenseId;
}

export function useCreateExpense(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["expenses", tripId] });
    },
  });
}
