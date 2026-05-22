"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import type { Leg } from "@/lib/types/trip";
import { TripRole } from "@/lib/types/trip";
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
  role: TripRole;
  summaries: TransportSummaryJson[];
}

export interface TransportSummariesData {
  role: TripRole;
  summaries: TransportSummaryJson[];
}

async function fetchTransportSummaries(
  tripId: string,
): Promise<TransportSummariesData | undefined> {
  const response = await fetch(`/api/trips/${tripId}/transport/summaries`);
  if (response.status === 403) return undefined;
  if (!response.ok) throw new Error("Failed to fetch transport summaries");
  const data = (await response.json()) as TransportSummariesResponse;
  return { role: data.role, summaries: data.summaries };
}

export function useTransportSummaries(tripId: string) {
  const { loading, user } = useAuth();

  return useQuery({
    queryKey: ["transport-summaries", tripId, user?.uid],
    queryFn: () => fetchTransportSummaries(tripId),
    enabled: tripId.length > 0 && !loading && !!user,
  });
}
