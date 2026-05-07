"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateStopInput {
  tripId: string;
  stopId: string;
  name?: string;
  startDate?: Date;
  endDate?: Date;
}

async function updateStop({
  tripId,
  stopId,
  name,
  startDate,
  endDate,
}: UpdateStopInput): Promise<void> {
  const response = await fetch(`/api/trips/${tripId}/stops/${stopId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(name !== undefined && { name }),
      ...(startDate !== undefined && { startDate: startDate.toISOString() }),
      ...(endDate !== undefined && { endDate: endDate.toISOString() }),
    }),
  });
  if (!response.ok) throw new Error("Failed to update stop");
}

export function useUpdateStop(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateStop,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stops", tripId] });
    },
  });
}
