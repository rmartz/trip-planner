"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
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

interface UseTransportSummariesOptions {
  enabled?: boolean;
}

export function useTransportSummaries(
  tripId: string,
  options: UseTransportSummariesOptions = {},
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["transport-summaries", tripId, user?.uid],
    queryFn: () => fetchTransportSummaries(tripId),
    enabled: (options.enabled ?? true) && tripId.length > 0,
  });
}
