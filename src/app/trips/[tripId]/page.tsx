"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { useTrip } from "@/hooks/use-trip";
import { TripOverviewPageView } from "./TripOverviewPageView";

export default function TripOverviewPage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const tripId = params.tripId;

  const { data: trip, isLoading, isError } = useTrip(tripId);

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
      />
    </AppShell>
  );
}
