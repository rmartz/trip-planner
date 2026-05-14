"use client";

import { use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  LodgingGuestOfferStatus,
  LodgingGuestOverviewView,
  type LodgingGuestStopSummary,
} from "@/components/lodging/LodgingGuestOverviewView";
import { LodgingPlannerOverviewView } from "@/components/lodging/LodgingPlannerOverviewView";
import type { LodgingStopSummary } from "@/components/lodging/LodgingPlannerOverviewView";
import { AppShell } from "@/components/nav/AppShell";
import { useStops } from "@/hooks/use-stops";
import type { NonAccountMember } from "@/lib/types/non-account-member";
import { TripRole, type Stop } from "@/lib/types/trip";
import { LODGING_PAGE_COPY } from "./copy";

interface LodgingPageProps {
  params: Promise<{ tripId: string }>;
}

interface MembersResponse {
  nonAccountMembers: NonAccountMember[];
}

async function fetchNonAccountMembers(
  tripId: string,
): Promise<NonAccountMember[]> {
  const response = await fetch(`/api/trips/${tripId}/members`);
  if (!response.ok) throw new Error("Failed to fetch members");
  const data = (await response.json()) as MembersResponse;
  return data.nonAccountMembers;
}

function makeGuestSummary(stop: Stop): LodgingGuestStopSummary {
  // Scaffold: every stop gets a single stub offer; #41 will replace this with
  // real host-initiated visibility, and #42 will replace sortedOwnLodging with
  // the simplified-status field.
  return {
    offers: [
      {
        bedCount: 2,
        hostName: "Alex",
        offerId: `${stop.stopId}-offer-1`,
        offerLabel: "Spare room available",
        status: LodgingGuestOfferStatus.Pending,
      },
    ],
    sortedOwnLodging: false,
    stop,
  };
}

export default function LodgingPage({ params }: LodgingPageProps) {
  const { tripId } = use(params);
  const router = useRouter();
  const { data } = useStops(tripId);
  const stops = data?.stops ?? [];
  const isPlanner = data?.role === TripRole.Planner;

  const { data: nonAccountMembers = [] } = useQuery({
    queryKey: ["nonAccountMembers", tripId],
    queryFn: () => fetchNonAccountMembers(tripId),
    enabled: isPlanner,
  });

  const nonAccountMemberSummaries = nonAccountMembers.map((member) => ({
    memberId: member.nonAccountMemberId,
    name: member.name,
    sortedOwnLodging: false,
  }));

  const plannerStopSummaries: LodgingStopSummary[] = stops.map((stop) => ({
    stop,
    demand: { needLodging: 0, haveOwn: 0, sharing: 0, noReply: 0 },
    supply: [],
    nonAccountMembers: nonAccountMemberSummaries,
  }));

  const guestStopSummaries: LodgingGuestStopSummary[] =
    stops.map(makeGuestSummary);

  const handleToggleMemberSortedOwn = useCallback(
    (stopId: string, memberId: string, sorted: boolean) => {
      void fetch(
        `/api/trips/${tripId}/stops/${stopId}/members/${memberId}/lodging-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortedOwn: sorted }),
        },
      );
    },
    [tripId],
  );

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: LODGING_PAGE_COPY.pageTitle,
        onBack: () => {
          router.back();
        },
      }}
    >
      {isPlanner ? (
        <LodgingPlannerOverviewView
          stops={plannerStopSummaries}
          onToggleMemberSortedOwn={handleToggleMemberSortedOwn}
        />
      ) : (
        <LodgingGuestOverviewView
          stops={guestStopSummaries}
          onAcceptOffer={(stopId, offerId) => {
            // Accept mutations are out of scope for this scaffold (#41).
            void stopId;
            void offerId;
          }}
          onDeclineOffer={(stopId, offerId) => {
            // Decline mutations are out of scope for this scaffold (#41).
            void stopId;
            void offerId;
          }}
          onToggleSortedOwn={(stopId, sortedOwn) => {
            // Sorted-own status mutations are out of scope for this scaffold (#42).
            void stopId;
            void sortedOwn;
          }}
        />
      )}
    </AppShell>
  );
}
