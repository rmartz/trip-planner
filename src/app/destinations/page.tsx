"use client";

import { useRef, useState } from "react";
import { useDestinations } from "@/hooks/use-destinations";
import { useTrips } from "@/hooks/use-trips";
import { useAuth } from "@/hooks/use-auth";
import { DestinationCatalogView } from "@/components/destinations/DestinationCatalogView";
import { DestinationDetailView } from "@/components/destinations/DestinationDetailView";
import { DestinationFormView } from "@/components/destinations/DestinationFormView";
import { AttachDestinationPickerView } from "@/components/destinations/AttachDestinationPickerView";
import { ShareDestinationPickerView } from "@/components/destinations/ShareDestinationPickerView";
import type { DestinationFormInput } from "@/components/destinations/DestinationFormView";
import type { ShareablePlanner } from "@/components/destinations/ShareDestinationPickerView";
import { TripRole } from "@/lib/types/trip";
import type { Destination } from "@/lib/types/destination";
import type { Trip, Stop } from "@/lib/types/trip";

interface StopWireFormat {
  stopId: string;
  tripId: string;
  name: string;
  startDate: string;
  endDate: string;
  order: number;
  memberUids: string[];
}

interface TripMemberWireFormat {
  uid: string;
  role: TripRole;
  displayName: string | undefined;
}

interface TripMembersResponse {
  accountMembers: TripMemberWireFormat[];
}

type ViewState =
  | { mode: "catalog" }
  | { mode: "detail"; destination: Destination }
  | { mode: "create" }
  | { mode: "edit"; destination: Destination }
  | { mode: "attach"; destination: Destination }
  | { mode: "share"; destination: Destination };

export default function DestinationsPage() {
  const { data: destinations, isLoading, isError, refetch } = useDestinations();
  const { data: trips, isLoading: isTripsLoading } = useTrips();
  const { user } = useAuth();
  const [viewState, setViewState] = useState<ViewState>({ mode: "catalog" });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitError, setIsSubmitError] = useState(false);
  const [stopsForTrip, setStopsForTrip] = useState<Record<string, Stop[]>>({});
  const [membersByTripId, setMembersByTripId] = useState<
    Record<string, TripMemberWireFormat[]>
  >({});
  const inFlightTripIds = useRef<Set<string>>(new Set());
  const inFlightMemberTripIds = useRef<Set<string>>(new Set());

  const now = new Date();
  const activeTrips = (trips ?? []).filter((t) => t.endDate >= now);

  const filteredDestinations = (destinations ?? []).filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const uid = user?.uid;

  const plannerTripIds = activeTrips
    .filter((t) => {
      const members = membersByTripId[t.tripId];
      if (!members) return false;
      return members.some((m) => m.uid === uid && m.role === TripRole.Planner);
    })
    .map((t) => t.tripId);

  const coPlanners: ShareablePlanner[] = [];
  const plannerToTripId: Record<string, string> = {};
  for (const tripId of plannerTripIds) {
    const members = membersByTripId[tripId] ?? [];
    for (const m of members) {
      if (
        m.uid !== uid &&
        m.role === TripRole.Planner &&
        !plannerToTripId[m.uid]
      ) {
        plannerToTripId[m.uid] = tripId;
        coPlanners.push({
          uid: m.uid,
          displayName: m.displayName ?? m.uid,
        });
      }
    }
  }

  const membersLoaded = activeTrips.every(
    (t) => membersByTripId[t.tripId] !== undefined,
  );
  const canShare = membersLoaded && plannerTripIds.length > 0;

  async function handleCreate(input: DestinationFormInput) {
    setIsSubmitting(true);
    setIsSubmitError(false);
    try {
      const response = await fetch("/api/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) throw new Error("Failed to create destination");
      await refetch();
      setViewState({ mode: "catalog" });
    } catch {
      setIsSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEdit(
    destination: Destination,
    input: DestinationFormInput,
  ) {
    setIsSubmitting(true);
    setIsSubmitError(false);
    try {
      const response = await fetch(
        `/api/destinations/${destination.destinationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      if (!response.ok) throw new Error("Failed to update destination");
      await refetch();
      setViewState({ mode: "catalog" });
    } catch {
      setIsSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function loadStopsForTrip(trip: Trip) {
    if (
      stopsForTrip[trip.tripId] !== undefined ||
      inFlightTripIds.current.has(trip.tripId)
    )
      return;
    inFlightTripIds.current.add(trip.tripId);
    try {
      const response = await fetch(`/api/trips/${trip.tripId}/stops`);
      if (!response.ok) return;
      const data = (await response.json()) as { stops: StopWireFormat[] };
      const stops: Stop[] = data.stops.map((s) => ({
        ...s,
        startDate: new Date(s.startDate),
        endDate: new Date(s.endDate),
      }));
      setStopsForTrip((prev) => ({ ...prev, [trip.tripId]: stops }));
    } catch {
      // stops remain unloaded; user sees empty list
    } finally {
      inFlightTripIds.current.delete(trip.tripId);
    }
  }

  async function loadMembersForTrip(trip: Trip) {
    if (
      membersByTripId[trip.tripId] !== undefined ||
      inFlightMemberTripIds.current.has(trip.tripId)
    )
      return;
    inFlightMemberTripIds.current.add(trip.tripId);
    try {
      const response = await fetch(`/api/trips/${trip.tripId}/members`);
      if (!response.ok) return;
      const data = (await response.json()) as TripMembersResponse;
      setMembersByTripId((prev) => ({
        ...prev,
        [trip.tripId]: data.accountMembers,
      }));
    } catch {
      // members remain unloaded
    } finally {
      inFlightMemberTripIds.current.delete(trip.tripId);
    }
  }

  function handleOpenDetail(destination: Destination) {
    setViewState({ mode: "detail", destination });
    for (const trip of activeTrips) {
      void loadMembersForTrip(trip);
    }
  }

  function handleOpenAttach(destination: Destination) {
    setViewState({ mode: "attach", destination });
    for (const trip of activeTrips) {
      void loadStopsForTrip(trip);
    }
  }

  function handleOpenShare(destination: Destination) {
    setViewState({ mode: "share", destination });
    for (const trip of activeTrips) {
      void loadMembersForTrip(trip);
    }
  }

  async function handleAttachToStop(
    destination: Destination,
    trip: Trip,
    stop: Stop,
  ) {
    setIsSubmitting(true);
    setIsSubmitError(false);
    try {
      const response = await fetch(
        `/api/trips/${trip.tripId}/stops/${stop.stopId}/destinations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destinationId: destination.destinationId,
            catalogUid: destination.uid,
            destinationName: destination.name,
          }),
        },
      );
      if (!response.ok) throw new Error("Failed to attach destination");
      setViewState({ mode: "catalog" });
    } catch {
      setIsSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleShareToPlanner(
    destination: Destination,
    planner: ShareablePlanner,
  ) {
    const tripId = plannerToTripId[planner.uid];
    if (!tripId) return;
    setIsSubmitting(true);
    setIsSubmitError(false);
    try {
      const response = await fetch(
        `/api/destinations/${destination.destinationId}/share`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientUid: planner.uid,
            tripId,
          }),
        },
      );
      if (!response.ok) throw new Error("Failed to share destination");
      setViewState({ mode: "catalog" });
    } catch {
      setIsSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      {viewState.mode === "detail" ? (
        <DestinationDetailView
          destination={viewState.destination}
          canShare={canShare}
          onEdit={(dest) => {
            setViewState({ mode: "edit", destination: dest });
          }}
          onBack={() => {
            setViewState({ mode: "catalog" });
          }}
          onShare={() => {
            handleOpenShare(viewState.destination);
          }}
        />
      ) : viewState.mode === "create" ? (
        <DestinationFormView
          mode="create"
          isSubmitting={isSubmitting}
          isError={isSubmitError}
          onSubmit={(input) => {
            void handleCreate(input);
          }}
          onCancel={() => {
            setViewState({ mode: "catalog" });
          }}
        />
      ) : viewState.mode === "edit" ? (
        <DestinationFormView
          mode="edit"
          initialName={viewState.destination.name}
          initialSeasonality={viewState.destination.seasonality}
          isSubmitting={isSubmitting}
          isError={isSubmitError}
          onSubmit={(input) => {
            void handleEdit(viewState.destination, input);
          }}
          onCancel={() => {
            setViewState({ mode: "catalog" });
          }}
        />
      ) : viewState.mode === "attach" ? (
        <AttachDestinationPickerView
          destination={viewState.destination}
          trips={activeTrips}
          stopsForTrip={stopsForTrip}
          isLoading={isTripsLoading}
          isSubmitting={isSubmitting}
          isError={isSubmitError}
          onSelectStop={(trip, stop) => {
            void handleAttachToStop(viewState.destination, trip, stop);
          }}
          onCancel={() => {
            setViewState({ mode: "catalog" });
          }}
        />
      ) : viewState.mode === "share" ? (
        <ShareDestinationPickerView
          destination={viewState.destination}
          planners={coPlanners}
          isLoading={!membersLoaded}
          isSubmitting={isSubmitting}
          isError={isSubmitError}
          onSelectPlanner={(planner) => {
            void handleShareToPlanner(viewState.destination, planner);
          }}
          onCancel={() => {
            setViewState({ mode: "catalog" });
          }}
        />
      ) : (
        <DestinationCatalogView
          destinations={filteredDestinations}
          isLoading={isLoading}
          isError={isError}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAdd={() => {
            setViewState({ mode: "create" });
          }}
          onView={(dest) => {
            handleOpenDetail(dest);
          }}
          onEdit={(dest) => {
            setViewState({ mode: "edit", destination: dest });
          }}
          onShare={() => {
            // Share flow: follow-up
          }}
          onAttach={(dest) => {
            handleOpenAttach(dest);
          }}
        />
      )}
    </main>
  );
}
