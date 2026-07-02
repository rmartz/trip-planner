"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export class PublishScheduleForbiddenError extends Error {
  constructor() {
    super("Only Planners can publish a schedule");
    this.name = "PublishScheduleForbiddenError";
  }
}

interface PublishScheduleInput {
  tripId: string;
  stopId: string;
  orderedActivityIds: string[];
}

export async function publishSchedule({
  tripId,
  stopId,
  orderedActivityIds,
}: PublishScheduleInput): Promise<void> {
  const response = await fetch(
    `/api/trips/${tripId}/schedule/${stopId}/publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedActivityIds }),
    },
  );
  if (response.status === 403) throw new PublishScheduleForbiddenError();
  if (!response.ok)
    throw new Error(`Failed to publish schedule (${String(response.status)})`);
}

export function usePublishSchedule(tripId: string, stopId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedActivityIds: string[]) =>
      publishSchedule({ tripId, stopId, orderedActivityIds }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["schedule", tripId, stopId],
      });
    },
  });
}
