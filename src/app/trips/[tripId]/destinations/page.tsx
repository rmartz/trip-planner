"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { ScreenDestinationsTripView } from "@/components/destinations/ScreenDestinationsTripView";
import { useTrip } from "@/hooks/use-trip";
import { useTripDestinations } from "@/hooks/use-trip-destinations";
import { DESTINATIONS_TRIP_PAGE_COPY } from "./DestinationsTripPageView.copy";

export default function DestinationsTripPage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const tripId = params.tripId;

  const { data: trip } = useTrip(tripId);

  const {
    data: destinations,
    isLoading,
    isError,
  } = useTripDestinations(tripId);

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
      <ScreenDestinationsTripView
        tripId={tripId}
        destinations={destinations ?? []}
        isLoading={isLoading}
        isError={isError}
        onBack={() => {
          router.push(`/trips/${tripId}`);
        }}
        onAdd={() => {
          router.push(`/destinations`);
        }}
      />
    </AppShell>
  );
}
