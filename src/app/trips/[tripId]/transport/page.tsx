"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import {
  type TransportLegSummary,
  TransportPlannerOverviewView,
} from "@/components/transport/TransportPlannerOverviewView";
import { useLegs } from "@/hooks/use-legs";
import { useTransportSummaries } from "@/hooks/use-transport-summaries";
import { TripRole } from "@/lib/types/trip";
import { TRANSPORT_PAGE_COPY } from "./copy";

interface TransportPageProps {
  params: Promise<{ tripId: string }>;
}

export default function TransportPage({ params }: TransportPageProps) {
  const { tripId } = use(params);
  const router = useRouter();
  const { data: legsData } = useLegs(tripId);
  const { data: summaries } = useTransportSummaries(tripId);
  const isPlanner = legsData?.role === TripRole.Planner;

  // haveOwn is not yet computed by the transport service (future work).
  const legSummaries: TransportLegSummary[] = (summaries ?? []).map((s) => ({
    leg: s.leg,
    demand: { ...s.demand, haveOwn: 0 },
    supply: s.supply,
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
        <TransportPlannerOverviewView
          legs={legSummaries}
          // TODO: Wire real handler and populate nonAccountMembers from leg
          // data in a follow-up PR.
          onToggleMemberSortedOwn={() => undefined}
        />
      ) : (
        <p className="p-4 text-sm text-muted-foreground">
          {TRANSPORT_PAGE_COPY.plannerOnlyMessage}
        </p>
      )}
    </AppShell>
  );
}
