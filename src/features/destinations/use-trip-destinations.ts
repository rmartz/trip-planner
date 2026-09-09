"use client";

import { useQuery } from "@tanstack/react-query";
import type { TripDestination } from "@/lib/types/destination";

async function fetchTripDestinations(
  tripId: string,
): Promise<TripDestination[]> {
  const response = await fetch(`/api/trips/${tripId}/destinations`);
  if (!response.ok) throw new Error("Failed to fetch trip destinations");
  return (await response.json()) as TripDestination[];
}

export function useTripDestinations(tripId: string) {
  return useQuery({
    queryKey: ["trip-destinations", tripId],
    queryFn: () => fetchTripDestinations(tripId),
    enabled: tripId.length > 0,
  });
}
