"use client";

import { useQuery } from "@tanstack/react-query";
import type { Activity } from "@/lib/types/activity";

async function fetchActivities(tripId: string): Promise<Activity[]> {
  const response = await fetch(`/api/trips/${tripId}/activities`);
  if (!response.ok) throw new Error("Failed to fetch activities");
  const data = (await response.json()) as { activities: Activity[] };
  return data.activities;
}

export function useActivities(tripId: string) {
  return useQuery({
    queryKey: ["activities", tripId],
    queryFn: () => fetchActivities(tripId),
  });
}
