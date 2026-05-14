"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { useStops } from "@/hooks/use-stops";
import { useTrip } from "@/hooks/use-trip";
import { TripRole } from "@/lib/types/trip";
import {
  RsvpPageView,
  type RsvpScheduledActivity,
  RsvpStatus,
} from "./RsvpPageView";
import { RSVP_PAGE_COPY } from "./RsvpPageView.copy";

const STUB_ACTIVITIES: RsvpScheduledActivity[] = [
  {
    activityId: "stub-1",
    name: "Welcome breakfast",
    timeSlot: "09:00",
    status: RsvpStatus.Pending,
  },
  {
    activityId: "stub-2",
    name: "Walking tour",
    timeSlot: "11:00",
    status: RsvpStatus.Pending,
  },
  {
    activityId: "stub-3",
    name: "Group dinner",
    timeSlot: "19:00",
    status: RsvpStatus.Pending,
  },
];

export default function RsvpPage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const tripId = params.tripId;

  const {
    data: trip,
    isLoading: isTripLoading,
    isError: isTripError,
  } = useTrip(tripId);
  const {
    data: stopsData,
    isLoading: isStopsLoading,
    isError: isStopsError,
  } = useStops(tripId);

  const isLoading = isTripLoading || isStopsLoading;
  const isError = isTripError || isStopsError;

  // Identify the viewer's role on this trip. Planners see a notice steering
  // them to the schedule page; guests see the RSVP list. The role from the
  // stops endpoint reflects this trip's membership; default to Guest if the
  // role hasn't loaded yet so we don't accidentally hide the list.
  const viewerRole = stopsData?.role ?? TripRole.Guest;

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: trip?.name ?? RSVP_PAGE_COPY.pageTitle,
        onBack: () => {
          router.push(`/trips/${tripId}`);
        },
      }}
    >
      <RsvpPageView
        activities={STUB_ACTIVITIES}
        viewerRole={viewerRole}
        isLoading={isLoading}
        isError={isError}
        onConfirm={(activityId) => {
          // RSVP confirm mutations are out of scope for this scaffold (#55).
          void activityId;
        }}
        onDecline={(activityId) => {
          // RSVP decline mutations are out of scope for this scaffold (#55).
          void activityId;
        }}
      />
    </AppShell>
  );
}
