"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import type { TransportLegSummary } from "@/components/transport/TransportPlannerOverviewView";
import { useLegs } from "@/hooks/use-legs";
import { useTrip } from "@/hooks/use-trip";
import { computeTransportGapCount } from "@/lib/trips/transport";
import { TripOverviewPageView } from "./TripOverviewPageView";

const EMPTY_DEMAND = {
  driving: 0,
  needRide: 0,
  noReply: 0,
  skipLeg: 0,
};

export default function TripOverviewPage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const tripId = params.tripId;

  const { data: trip, isLoading, isError } = useTrip(tripId);
  const { data: legsData } = useLegs(tripId);

  const legs = legsData?.legs ?? [];
  const legSummaries: TransportLegSummary[] = legs.map((leg) => ({
    leg,
    demand: legsData?.legSummaries?.[leg.legId]?.demand ?? EMPTY_DEMAND,
    supply: legsData?.legSummaries?.[leg.legId]?.supply ?? [],
  }));

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
        transportGapCount={computeTransportGapCount(legSummaries)}
      />
    </AppShell>
  );
}
