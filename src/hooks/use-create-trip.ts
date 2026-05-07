"use client";

import { useMutation } from "@tanstack/react-query";

interface CreateTripInput {
  name: string;
  startDate: Date;
  endDate: Date;
}

async function createTrip({
  name,
  startDate,
  endDate,
}: CreateTripInput): Promise<string> {
  const response = await fetch("/api/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }),
  });
  if (!response.ok) throw new Error("Failed to create trip");
  const data = (await response.json()) as { tripId: string };
  return data.tripId;
}

export function useCreateTrip() {
  return useMutation({ mutationFn: createTrip });
}
