"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateLegInput {
  tripId: string;
  fromStopId: string;
  toStopId: string;
}

async function createLeg({
  tripId,
  fromStopId,
  toStopId,
}: CreateLegInput): Promise<string> {
  const response = await fetch(`/api/trips/${tripId}/legs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fromStopId, toStopId }),
  });
  if (!response.ok) throw new Error("Failed to create leg");
  const data = (await response.json()) as { legId: string };
  return data.legId;
}

export function useCreateLeg(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLeg,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["legs", tripId] });
    },
  });
}
