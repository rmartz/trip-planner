"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import {
  type TransportLegSummary,
  TransportPlannerOverviewView,
} from "@/components/transport/TransportPlannerOverviewView";
import { useTransportSummaries } from "@/hooks/use-transport-summaries";
import { TRANSPORT_PAGE_COPY } from "./copy";

interface TransportPageProps {
  params: Promise<{ tripId: string }>;
}

export default function TransportPage({ params }: TransportPageProps) {
  const { tripId } = use(params);
  const router = useRouter();
  const {
    data: summariesData,
    isError: isSummariesError,
    isLoading: isSummariesLoading,
    isPending: isSummariesPending,
  } = useTransportSummaries(tripId);

  // haveOwn is not yet computed by the transport service (future work).
  const legSummaries: TransportLegSummary[] = (
    summariesData?.summaries ?? []
  ).map((s) => ({
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
      {isSummariesLoading || isSummariesPending ? (
        <p className="p-4 text-sm text-muted-foreground">
          {TRANSPORT_PAGE_COPY.loadingMessage}
        </p>
      ) : isSummariesError ? (
        <p className="p-4 text-sm text-muted-foreground">
          {TRANSPORT_PAGE_COPY.summaryErrorMessage}
        </p>
      ) : summariesData !== undefined ? (
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
