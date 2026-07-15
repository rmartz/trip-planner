"use client";

import { useQuery } from "@tanstack/react-query";
import type { LodgingStatus } from "@/lib/types/lodging";
import type { LodgingRecord } from "@/lib/types/lodging";

interface LodgingRecordJson {
  guestCount?: number;
  invitedUids?: string[];
  sharingWithUid?: string;
  status: LodgingStatus;
  stopId: string;
  uid: string;
  updatedAt: string;
}

interface StopLodgingResponse {
  records: LodgingRecordJson[];
}

function parseLodgingRecord(json: LodgingRecordJson): LodgingRecord {
  return {
    ...json,
    updatedAt: new Date(json.updatedAt),
  };
}

export async function fetchStopLodging(
  tripId: string,
  stopId: string,
): Promise<LodgingRecord[]> {
  const response = await fetch(`/api/trips/${tripId}/stops/${stopId}/lodging`);
  if (!response.ok) {
    throw new Error(`Failed to fetch lodging (${String(response.status)})`);
  }

  const data = (await response.json()) as StopLodgingResponse;
  return data.records.map(parseLodgingRecord);
}

export function stopLodgingQueryOptions(tripId: string, stopId: string) {
  return {
    queryKey: ["lodging", tripId, stopId],
    queryFn: () => fetchStopLodging(tripId, stopId),
  } as const;
}

export function useStopLodging(tripId: string, stopId: string) {
  return useQuery(stopLodgingQueryOptions(tripId, stopId));
}
