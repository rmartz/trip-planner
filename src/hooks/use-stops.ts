"use client";

import { useQuery } from "@tanstack/react-query";
import type { Stop } from "@/lib/types/trip";
import { TripRole } from "@/lib/types/trip";

interface StopJson {
  stopId: string;
  tripId: string;
  name: string;
  startDate: string;
  endDate: string;
  order: number;
  memberUids: string[];
}

interface StopsResponse {
  stops: StopJson[];
  role: TripRole | null;
}

function parseStop(json: StopJson): Stop {
  return {
    ...json,
    startDate: new Date(json.startDate),
    endDate: new Date(json.endDate),
  };
}

async function fetchStops(
  tripId: string,
): Promise<{ stops: Stop[]; role: TripRole | null }> {
  const response = await fetch(`/api/trips/${tripId}/stops`);
  if (!response.ok) throw new Error("Failed to fetch stops");
  const data = (await response.json()) as StopsResponse;
  return {
    stops: data.stops.map(parseStop),
    role: data.role,
  };
}

export function useStops(tripId: string) {
  return useQuery({
    queryKey: ["stops", tripId],
    queryFn: () => fetchStops(tripId),
  });
}
