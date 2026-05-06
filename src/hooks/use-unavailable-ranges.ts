"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UnavailableRange } from "@/lib/types/unavailable-range";

type SerializedRange = Omit<UnavailableRange, "startDate" | "endDate"> & {
  startDate: string;
  endDate: string;
};

function deserialize(r: SerializedRange): UnavailableRange {
  return {
    ...r,
    startDate: new Date(r.startDate),
    endDate: new Date(r.endDate),
  };
}

async function fetchRanges(): Promise<UnavailableRange[]> {
  const response = await fetch("/api/unavailability");
  if (!response.ok) throw new Error("Failed to fetch unavailable ranges");
  return ((await response.json()) as SerializedRange[]).map(deserialize);
}

export function useUnavailableRanges() {
  return useQuery({ queryKey: ["unavailableRanges"], queryFn: fetchRanges });
}

export function useCreateUnavailableRange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      range: Omit<UnavailableRange, "rangeId" | "uid">,
    ): Promise<UnavailableRange> => {
      const response = await fetch("/api/unavailability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: range.startDate.toISOString(),
          endDate: range.endDate.toISOString(),
          note: range.note,
        }),
      });
      if (!response.ok) throw new Error("Failed to create unavailable range");
      return deserialize((await response.json()) as SerializedRange);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["unavailableRanges"] });
    },
  });
}

export function useDeleteUnavailableRange() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rangeId: string): Promise<void> => {
      const response = await fetch(`/api/unavailability/${rangeId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete unavailable range");
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["unavailableRanges"] });
    },
  });
}
