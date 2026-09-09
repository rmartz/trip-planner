"use client";

import { useQuery } from "@tanstack/react-query";
import type { Trip } from "@/lib/types/trip";

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number) as [
    number,
    number,
    number,
  ];
  return new Date(year, month - 1, day);
}

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
    startDate: parseLocalDate(trip.startDate),
    endDate: parseLocalDate(trip.endDate),
    createdAt: new Date(trip.createdAt),
  }));
}

export function useTrips() {
  return useQuery({ queryKey: ["trips"], queryFn: fetchTrips });
}
