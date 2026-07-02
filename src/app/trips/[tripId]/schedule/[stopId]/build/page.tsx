"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { useStops } from "@/hooks/use-stops";
import { ScheduleBuilder } from "../../ScheduleBuilder";
import { SCHEDULE_BUILDER_PAGE_COPY } from "./ScheduleBuilderPage.copy";

export default function ScheduleBuilderPage() {
  const params = useParams<{ tripId: string; stopId: string }>();
  const router = useRouter();
  const tripId = params.tripId;
  const stopId = params.stopId;

  const { data } = useStops(tripId);
  const stop = data?.stops.find((s) => s.stopId === stopId);

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: SCHEDULE_BUILDER_PAGE_COPY.pageTitle,
        onBack: () => {
          router.push(`/trips/${tripId}/schedule`);
        },
      }}
    >
      <ScheduleBuilder
        tripId={tripId}
        stopId={stopId}
        stopName={stop?.name ?? SCHEDULE_BUILDER_PAGE_COPY.unknownStop}
      />
    </AppShell>
  );
}
