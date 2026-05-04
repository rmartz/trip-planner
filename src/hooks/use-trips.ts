"use client";

import { useQuery } from "@tanstack/react-query";
import type { Trip } from "@/lib/types/trip";

async function fetchTrips(): Promise<Trip[]> {
  const response = await fetch("/api/trips");
  if (!response.ok) throw new Error("Failed to fetch trips");
  const data = (await response.json()) as (Omit<
    Trip,
    "startDate" | "endDate" | "createdAt"
  > & {
    startDate: string;
    endDate: string;
    createdAt: string;
  })[];
  return data.map((trip) => ({
    ...trip,
    startDate: new Date(trip.startDate),
    endDate: new Date(trip.endDate),
    createdAt: new Date(trip.createdAt),
  }));
}

export function useTrips() {
  return useQuery({ queryKey: ["trips"], queryFn: fetchTrips });
}
