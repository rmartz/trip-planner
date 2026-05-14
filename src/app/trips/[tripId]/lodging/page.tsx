"use client";

import { use, useCallback, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  LodgingGuestOfferStatus,
  LodgingGuestOverviewView,
  type LodgingGuestStopSummary,
} from "@/components/lodging/LodgingGuestOverviewView";
import { LodgingHostGuestPicker } from "@/components/lodging/LodgingHostGuestPicker";
import { LodgingPlannerOverviewView } from "@/components/lodging/LodgingPlannerOverviewView";
import type { LodgingStopSummary } from "@/components/lodging/LodgingPlannerOverviewView";
import { useAuth } from "@/hooks/use-auth";
import { stopLodgingQueryOptions } from "@/hooks/use-stop-lodging";
import { AppShell } from "@/components/nav/AppShell";
import { useStops } from "@/hooks/use-stops";
import type { NonAccountMember } from "@/lib/types/non-account-member";
import { tripMembersQueryOptions } from "@/hooks/use-trip-members";
import { LodgingStatus } from "@/lib/types/lodging";
import { type Stop, TripRole } from "@/lib/types/trip";
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

function makeGuestSummary(
  stop: Stop,
  hostNamesByUid: Record<string, string>,
  currentUserUid: string | undefined,
  visibleRecords: {
    guestCount?: number;
    status: LodgingStatus;
    uid: string;
  }[],
): LodgingGuestStopSummary {
  return {
    offers: visibleRecords
      .filter((record) => record.uid !== currentUserUid)
      .filter((record) => record.status === LodgingStatus.SecuredCapacity)
      .map((record) => ({
        bedCount: record.guestCount,
        hostName: hostNamesByUid[record.uid] ?? record.uid,
        offerId: `${stop.stopId}-${record.uid}`,
        offerLabel: stop.name,
        status: LodgingGuestOfferStatus.Pending,
      })),
    sortedOwnLodging: false,
    stop,
  };
}

export default function LodgingPage({ params }: LodgingPageProps) {
  const { tripId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { data } = useStops(tripId);
  const stops = data?.stops ?? [];
  const isPlanner = data?.role === TripRole.Planner;
  const tripMembersQuery = useQuery(tripMembersQueryOptions(tripId));
  const stopLodgingQueries = useQueries({
    queries: stops.map((stop) => stopLodgingQueryOptions(tripId, stop.stopId)),
  });

  const { data: nonAccountMembers = [] } = useQuery({
    queryKey: ["nonAccountMembers", tripId],
    queryFn: () => fetchNonAccountMembers(tripId),
    enabled: isPlanner,
  });

  const [sortedOwnOverrides, setSortedOwnOverrides] = useState<
    Record<string, boolean>
  >({});

  const plannerStopSummaries: LodgingStopSummary[] = stops.map((stop) => ({
    stop,
    demand: { needLodging: 0, haveOwn: 0, sharing: 0, noReply: 0 },
    supply: [],
    nonAccountMembers: nonAccountMembers.map((member) => ({
      memberId: member.nonAccountMemberId,
      name: member.name,
      sortedOwnLodging:
        sortedOwnOverrides[`${stop.stopId}:${member.nonAccountMemberId}`] ??
        false,
    })),
  }));

  const guestStopSummaries: LodgingGuestStopSummary[] = stops.map(
    (stop, index) =>
      makeGuestSummary(
        stop,
        Object.fromEntries(
          (tripMembersQuery.data ?? []).map((member) => [
            member.uid,
            member.displayName ?? member.uid,
          ]),
        ),
        user?.uid,
        stopLodgingQueries[index]?.data ?? [],
      ),
  );

  const hostPickerStops = stops.filter((stop, index) => {
    const ownRecord = stopLodgingQueries[index]?.data?.find(
      (record) => record.uid === user?.uid,
    );

    return ownRecord?.status === LodgingStatus.SecuredCapacity;
  });

  const handleToggleMemberSortedOwn = useCallback(
    async (stopId: string, memberId: string, sorted: boolean) => {
      const key = `${stopId}:${memberId}`;
      setSortedOwnOverrides((prev) => ({ ...prev, [key]: sorted }));
      const response = await fetch(
        `/api/trips/${tripId}/stops/${stopId}/members/${memberId}/lodging-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortedOwn: sorted }),
        },
      );
      if (!response.ok) {
        setSortedOwnOverrides((prev) => ({ ...prev, [key]: !sorted }));
      }
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
      {hostPickerStops.length > 0 && (
        <div className="flex flex-col gap-4 p-4">
          {hostPickerStops.map((stop) => (
            <section
              key={stop.stopId}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800"
            >
              <h2 className="border-b border-zinc-200 px-4 py-3 text-base font-semibold dark:border-zinc-800">
                {stop.name}
              </h2>
              <LodgingHostGuestPicker stopId={stop.stopId} tripId={tripId} />
            </section>
          ))}
        </div>
      )}
      {isPlanner ? (
        <LodgingPlannerOverviewView
          stops={plannerStopSummaries}
          onToggleMemberSortedOwn={(stopId, memberId, sorted) => {
            void handleToggleMemberSortedOwn(stopId, memberId, sorted);
          }}
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
