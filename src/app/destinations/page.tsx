"use client";

import { useState } from "react";
import { useDestinations } from "@/hooks/use-destinations";
import { useTrips } from "@/hooks/use-trips";
import { DestinationCatalogView } from "@/components/destinations/DestinationCatalogView";
import { DestinationDetailView } from "@/components/destinations/DestinationDetailView";
import { DestinationFormView } from "@/components/destinations/DestinationFormView";
import { AttachDestinationPickerView } from "@/components/destinations/AttachDestinationPickerView";
import type { DestinationFormInput } from "@/components/destinations/DestinationFormView";
import type { Destination } from "@/lib/types/destination";
import type { Trip, Stop } from "@/lib/types/trip";

type ViewState =
  | { mode: "catalog" }
  | { mode: "detail"; destination: Destination }
  | { mode: "create" }
  | { mode: "edit"; destination: Destination }
  | { mode: "attach"; destination: Destination };

export default function DestinationsPage() {
  const { data: destinations, isLoading, isError, refetch } = useDestinations();
  const { data: trips, isLoading: isTripsLoading } = useTrips();
  const [viewState, setViewState] = useState<ViewState>({ mode: "catalog" });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitError, setIsSubmitError] = useState(false);
  const [stopsForTrip, setStopsForTrip] = useState<Record<string, Stop[]>>({});

  const filteredDestinations = (destinations ?? []).filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
    if (stopsForTrip[trip.tripId] !== undefined) return;
    try {
      const response = await fetch(`/api/trips/${trip.tripId}/stops`);
      if (!response.ok) return;
      const data = (await response.json()) as { stops: Stop[] };
      setStopsForTrip((prev) => ({ ...prev, [trip.tripId]: data.stops }));
    } catch {
      // stops remain unloaded; user sees empty list
    }
  }

  function handleOpenAttach(destination: Destination) {
    setViewState({ mode: "attach", destination });
    for (const trip of trips ?? []) {
      void loadStopsForTrip(trip);
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

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      {viewState.mode === "detail" ? (
        <DestinationDetailView
          destination={viewState.destination}
          onEdit={(dest) => {
            setViewState({ mode: "edit", destination: dest });
          }}
          onBack={() => {
            setViewState({ mode: "catalog" });
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
          trips={trips ?? []}
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
            setViewState({ mode: "detail", destination: dest });
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
