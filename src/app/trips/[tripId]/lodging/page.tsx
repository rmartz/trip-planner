"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { LodgingPlannerOverviewView } from "@/components/lodging/LodgingPlannerOverviewView";
import type { LodgingStopSummary } from "@/components/lodging/LodgingPlannerOverviewView";
import { AppShell } from "@/components/nav/AppShell";
import { useStops } from "@/hooks/use-stops";
import { TripRole } from "@/lib/types/trip";
import { LODGING_PAGE_COPY } from "./copy";

interface LodgingPageProps {
  params: Promise<{ tripId: string }>;
}

export default function LodgingPage({ params }: LodgingPageProps) {
  const { tripId } = use(params);
  const router = useRouter();
  const { data } = useStops(tripId);
  const stops = data?.stops ?? [];
  const isPlanner = data?.role === TripRole.Planner;

  const stopSummaries: LodgingStopSummary[] = stops.map((stop) => ({
    stop,
    demand: { needLodging: 0, haveOwn: 0, sharing: 0, noReply: 0 },
    supply: [],
  }));

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
        <LodgingPlannerOverviewView stops={stopSummaries} />
      ) : (
        <div className="p-4 text-sm text-muted-foreground">
          {LODGING_PAGE_COPY.plannerOnlyMessage}
        </div>
      )}
    </AppShell>
  );
}
