"use client";

import { useQuery } from "@tanstack/react-query";
import type { Trip } from "@/lib/types/trip";

interface SerializedTrip extends Omit<
  Trip,
  "startDate" | "endDate" | "createdAt" | "settledAt"
> {
  startDate: string;
  endDate: string;
  createdAt: string;
  settledAt?: string;
}

async function fetchTrip(tripId: string): Promise<Trip | undefined> {
  const response = await fetch(`/api/trips/${tripId}`);
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error("Failed to fetch trip");
  const data = (await response.json()) as SerializedTrip;
  return {
    ...data,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    createdAt: new Date(data.createdAt),
    settledAt:
      data.settledAt !== undefined ? new Date(data.settledAt) : undefined,
  };
}

export function useTrip(tripId: string) {
  return useQuery({
    queryKey: ["trip", tripId],
    queryFn: () => fetchTrip(tripId),
    enabled: tripId.length > 0,
  });
}
