"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateStopInput {
  tripId: string;
  name: string;
  startDate: Date;
  endDate: Date;
}

async function createStop({
  tripId,
  name,
  startDate,
  endDate,
}: CreateStopInput): Promise<string> {
  const response = await fetch(`/api/trips/${tripId}/stops`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }),
  });
  if (!response.ok) throw new Error("Failed to create stop");
  const data = (await response.json()) as { stopId: string };
  return data.stopId;
}

export function useCreateStop(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStop,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["stops", tripId] });
    },
  });
}
