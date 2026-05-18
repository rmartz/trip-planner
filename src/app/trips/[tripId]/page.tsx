"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { useTransportSummaries } from "@/hooks/use-transport-summaries";
import { useTrip } from "@/hooks/use-trip";
import { computeTransportGapCount } from "@/lib/trips/transport";
import { TripOverviewPageView } from "./TripOverviewPageView";

export default function TripOverviewPage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const tripId = params.tripId;

  const { data: trip, isLoading, isError } = useTrip(tripId);
  const { data: summaries } = useTransportSummaries(tripId);

  const transportGapCount = computeTransportGapCount(summaries ?? []);

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: trip?.name ?? "",
        onBack: () => {
          router.back();
        },
      }}
    >
      <TripOverviewPageView
        trip={trip}
        isLoading={isLoading}
        isError={isError}
        lodgingGapCount={trip?.gapCount}
        transportGapCount={transportGapCount}
      />
    </AppShell>
  );
}
