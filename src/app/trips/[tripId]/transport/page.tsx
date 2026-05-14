"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import {
  TransportPlannerOverviewView,
  type TransportLegSummary,
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
    demand: { driving: 0, needRide: 0, haveOwn: 0, skipLeg: 0, noReply: 0 },
    supply: [],
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
