"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExpenseSettingsMap } from "@/lib/types/expense-settings";

interface SerializedExpenseSettings {
  categories: ExpenseSettingsMap;
}

async function fetchExpenseSettings(
  tripId: string,
): Promise<ExpenseSettingsMap> {
  const response = await fetch(`/api/trips/${tripId}/expense-settings`);
  if (!response.ok) throw new Error("Failed to fetch expense settings");
  const data = (await response.json()) as SerializedExpenseSettings;
  return data.categories;
}

async function saveExpenseSettings(
  tripId: string,
  categories: ExpenseSettingsMap,
): Promise<void> {
  const response = await fetch(`/api/trips/${tripId}/expense-settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categories }),
  });
  if (!response.ok) throw new Error("Failed to save expense settings");
}

export function useExpenseSettings(tripId: string) {
  return useQuery({
    queryKey: ["expenseSettings", tripId],
    queryFn: () => fetchExpenseSettings(tripId),
    enabled: tripId.length > 0,
  });
}

export function useUpdateExpenseSettings(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categories: ExpenseSettingsMap) =>
      saveExpenseSettings(tripId, categories),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["expenseSettings", tripId],
      });
    },
  });
}
