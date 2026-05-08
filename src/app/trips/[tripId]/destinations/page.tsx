"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/nav/AppShell";
import type { Destination } from "@/lib/types/destination";
import { useTrip } from "@/hooks/use-trip";
import { DestinationsTripPageView } from "./DestinationsTripPageView";
import { DESTINATIONS_TRIP_PAGE_COPY } from "./DestinationsTripPageView.copy";

async function fetchTripDestinations(tripId: string): Promise<Destination[]> {
  const response = await fetch(`/api/trips/${tripId}/destinations`);
  if (!response.ok) throw new Error("Failed to fetch trip destinations");
  return (await response.json()) as Destination[];
}

export default function DestinationsTripPage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const tripId = params.tripId;

  const { data: trip } = useTrip(tripId);

  const {
    data: destinations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["trip-destinations", tripId],
    queryFn: () => fetchTripDestinations(tripId),
    enabled: tripId.length > 0,
  });

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: trip?.name ?? DESTINATIONS_TRIP_PAGE_COPY.pageTitle,
        onBack: () => {
          router.push(`/trips/${tripId}`);
        },
      }}
    >
      <DestinationsTripPageView
        destinations={destinations ?? []}
        isLoading={isLoading}
        isError={isError}
      />
    </AppShell>
  );
}
