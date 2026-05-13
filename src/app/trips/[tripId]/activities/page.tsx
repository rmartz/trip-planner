"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { useTrip } from "@/hooks/use-trip";
import {
  ActivitiesTripPageView,
  type ActivityProposal,
} from "./ActivitiesTripPageView";
import { ACTIVITIES_TRIP_PAGE_COPY } from "./ActivitiesTripPageView.copy";

const STUB_PROPOSALS: ActivityProposal[] = [];

export default function ActivitiesTripPage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const tripId = params.tripId;

  const { data: trip, isLoading, isError } = useTrip(tripId);

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: trip?.name ?? ACTIVITIES_TRIP_PAGE_COPY.pageTitle,
        onBack: () => {
          router.push(`/trips/${tripId}`);
        },
      }}
    >
      <ActivitiesTripPageView
        proposals={STUB_PROPOSALS}
        isLoading={isLoading}
        isError={isError}
        onVote={(proposalId, vote) => {
          // Vote mutations are out of scope for this scaffold (#51 / #52).
          void proposalId;
          void vote;
        }}
      />
    </AppShell>
  );
}
