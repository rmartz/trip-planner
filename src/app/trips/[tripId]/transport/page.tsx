"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import {
  type TransportLegSummary,
  TransportPlannerOverviewView,
} from "@/components/transport/TransportPlannerOverviewView";
import { useLegs } from "@/hooks/use-legs";
import { TRANSPORT_PAGE_COPY } from "./copy";

interface TransportPageProps {
  params: Promise<{ tripId: string }>;
}

export default function TransportPage({ params }: TransportPageProps) {
  const { tripId } = use(params);
  const router = useRouter();
  const { data } = useLegs(tripId);
  const legs = data?.legs ?? [];

  const legSummaries: TransportLegSummary[] = legs.map((leg) => ({
    leg,
    capacity: { driverCount: 0, seatCount: 0 },
    demand: { ridersNeeded: 0 },
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
      <TransportPlannerOverviewView legs={legSummaries} />
    </AppShell>
  );
}
