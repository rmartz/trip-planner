"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import {
  type TransportLegSummary,
  TransportPlannerOverviewView,
} from "@/components/transport/TransportPlannerOverviewView";
import { useLegs } from "@/hooks/use-legs";
import { TripRole } from "@/lib/types/trip";
import { TRANSPORT_PAGE_COPY } from "./copy";

const EMPTY_DEMAND = {
  driving: 0,
  needRide: 0,
  noReply: 0,
  skipLeg: 0,
};

interface TransportPageProps {
  params: Promise<{ tripId: string }>;
}

export default function TransportPage({ params }: TransportPageProps) {
  const { tripId } = use(params);
  const router = useRouter();
  const { data } = useLegs(tripId);
  const legs = data?.legs ?? [];
  const isPlanner = data?.role === TripRole.Planner;

  const legSummaries: TransportLegSummary[] = legs.map((leg) => ({
    leg,
    demand: data?.legSummaries?.[leg.legId]?.demand ?? EMPTY_DEMAND,
    supply: data?.legSummaries?.[leg.legId]?.supply ?? [],
  }));

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: TRANSPORT_PAGE_COPY.pageTitle,
        onBack: () => {
          router.back();
        },
      }}
    >
      {isPlanner ? (
        <TransportPlannerOverviewView legs={legSummaries} />
      ) : (
        <p className="p-4 text-sm text-muted-foreground">
          {TRANSPORT_PAGE_COPY.plannerOnlyMessage}
        </p>
      )}
    </AppShell>
  );
}
