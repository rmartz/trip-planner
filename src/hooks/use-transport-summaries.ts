"use client";

import { useQuery } from "@tanstack/react-query";
import type { Leg } from "@/lib/types/trip";
import type {
  TransportCarOffer,
  TransportLegDemand,
} from "@/lib/types/transportation";

interface TransportSummaryJson {
  legId: string;
  leg: Leg;
  demand: TransportLegDemand;
  supply: TransportCarOffer[];
}

interface TransportSummariesResponse {
  summaries: TransportSummaryJson[];
}

async function fetchTransportSummaries(
  tripId: string,
): Promise<TransportSummaryJson[]> {
  const response = await fetch(`/api/trips/${tripId}/transport/summaries`);
  if (!response.ok) throw new Error("Failed to fetch transport summaries");
  const data = (await response.json()) as TransportSummariesResponse;
  return data.summaries;
}

export function useTransportSummaries(tripId: string) {
  return useQuery({
    queryKey: ["transport-summaries", tripId],
    queryFn: () => fetchTransportSummaries(tripId),
  });
}
