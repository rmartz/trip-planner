"use client";

import { useQuery } from "@tanstack/react-query";
import type { Leg } from "@/lib/types/trip";
import { TripRole } from "@/lib/types/trip";

interface LegJson {
  legId: string;
  tripId: string;
  fromStopId: string;
  toStopId: string;
  name: string;
  notes?: string;
  order: number;
  memberUids: string[];
}

interface LegsResponse {
  legs: LegJson[];
  role: TripRole | null;
}

async function fetchLegs(
  tripId: string,
): Promise<{ legs: Leg[]; role: TripRole | null }> {
  const response = await fetch(`/api/trips/${tripId}/legs`);
  if (!response.ok) throw new Error("Failed to fetch legs");
  const data = (await response.json()) as LegsResponse;
  return {
    legs: data.legs,
    role: data.role,
  };
}

export function useLegs(tripId: string) {
  return useQuery({
    queryKey: ["legs", tripId],
    queryFn: () => fetchLegs(tripId),
  });
}
