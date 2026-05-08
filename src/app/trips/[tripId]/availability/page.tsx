"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { useTrip } from "@/hooks/use-trip";
import { useTrips } from "@/hooks/use-trips";
import { useUnavailableRanges } from "@/hooks/use-unavailable-ranges";
import { AvailabilityPageView } from "./AvailabilityPageView";
import { AVAILABILITY_PAGE_COPY } from "./AvailabilityPageView.copy";

export default function AvailabilityPage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const tripId = params.tripId;

  const {
    data: trip,
    isLoading: isTripLoading,
    isError: isTripError,
  } = useTrip(tripId);
  const {
    data: trips,
    isLoading: isTripsLoading,
    isError: isTripsError,
  } = useTrips();
  const {
    data: ranges,
    isLoading: isRangesLoading,
    isError: isRangesError,
  } = useUnavailableRanges();

  const isLoading = isTripLoading || isTripsLoading || isRangesLoading;
  const isError = isTripError || isTripsError || isRangesError;

  // Exclude the current trip from "currentUserTrips" so a personal block
  // overlapping this trip's window is not flagged as overlapping itself.
  const currentUserTrips = trips?.filter((t) => t.tripId !== tripId) ?? [];
  const currentUserRanges = ranges ?? [];

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: trip?.name ?? AVAILABILITY_PAGE_COPY.pageTitle,
        onBack: () => {
          router.push(`/trips/${tripId}`);
        },
      }}
    >
      <AvailabilityPageView
        trip={trip}
        currentUserTrips={currentUserTrips}
        currentUserRanges={currentUserRanges}
        isLoading={isLoading}
        isError={isError}
      />
    </AppShell>
  );
}
