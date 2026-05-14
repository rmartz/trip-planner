"use client";

import { use } from "react";
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
import { tripMembersQueryOptions } from "@/hooks/use-trip-members";
import { LodgingStatus } from "@/lib/types/lodging";
import { TripRole, type Stop, type TripMember } from "@/lib/types/trip";
import { LODGING_PAGE_COPY } from "./copy";

interface LodgingPageProps {
  params: Promise<{ tripId: string }>;
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
        bedCount: record.guestCount ?? 0,
        hostName: hostNamesByUid[record.uid] ?? record.uid,
        offerId: `${stop.stopId}-${record.uid}`,
        offerLabel: stop.name,
        status: LodgingGuestOfferStatus.Pending,
      })),
    sortedOwnLodging: false,
    stop,
  };
}

function makeHostNamesByUid(
  members: TripMember[] | undefined,
): Record<string, string> {
  return Object.fromEntries(
    (members ?? []).map((member) => [
      member.uid,
      member.displayName ?? member.uid,
    ]),
  );
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

  const plannerStopSummaries: LodgingStopSummary[] = stops.map((stop) => ({
    stop,
    demand: { needLodging: 0, haveOwn: 0, sharing: 0, noReply: 0 },
    supply: [],
  }));

  const guestStopSummaries: LodgingGuestStopSummary[] = stops.map(
    (stop, index) =>
      makeGuestSummary(
        stop,
        makeHostNamesByUid(tripMembersQuery.data),
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
        <LodgingPlannerOverviewView stops={plannerStopSummaries} />
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
