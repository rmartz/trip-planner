"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ReorderStopsInput {
  tripId: string;
  stopIds: string[];
}

async function reorderStops({
  tripId,
  stopIds,
}: ReorderStopsInput): Promise<void> {
  const response = await fetch(`/api/trips/${tripId}/stops/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stopIds }),
  });
  if (!response.ok) throw new Error("Failed to reorder stops");
}

export function useReorderStops(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderStops,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stops", tripId] });
    },
  });
}
