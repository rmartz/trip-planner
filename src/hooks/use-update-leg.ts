"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateLegInput {
  tripId: string;
  legId: string;
  fromStopId?: string;
  toStopId?: string;
}

async function updateLeg({
  tripId,
  legId,
  fromStopId,
  toStopId,
}: UpdateLegInput): Promise<void> {
  const response = await fetch(`/api/trips/${tripId}/legs/${legId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(fromStopId !== undefined && { fromStopId }),
      ...(toStopId !== undefined && { toStopId }),
    }),
  });
  if (!response.ok) throw new Error("Failed to update leg");
}

export function useUpdateLeg(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateLeg,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["legs", tripId] });
    },
  });
}
