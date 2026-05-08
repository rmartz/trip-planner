"use client";

import { useState } from "react";
import { useDestinations } from "@/hooks/use-destinations";
import { DestinationCatalogView } from "@/components/destinations/DestinationCatalogView";
import { DestinationDetailView } from "@/components/destinations/DestinationDetailView";
import { DestinationFormView } from "@/components/destinations/DestinationFormView";
import type { DestinationFormInput } from "@/components/destinations/DestinationFormView";
import type { Destination } from "@/lib/types/destination";

type ViewState =
  | { mode: "catalog" }
  | { mode: "detail"; destination: Destination }
  | { mode: "create" }
  | { mode: "edit"; destination: Destination };

export default function DestinationsPage() {
  const { data: destinations, isLoading, isError, refetch } = useDestinations();
  const [viewState, setViewState] = useState<ViewState>({ mode: "catalog" });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredDestinations = (destinations ?? []).filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  async function handleCreate(input: DestinationFormInput) {
    setIsSubmitting(true);
    try {
      await fetch("/api/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      await refetch();
      setViewState({ mode: "catalog" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEdit(
    destination: Destination,
    input: DestinationFormInput,
  ) {
    setIsSubmitting(true);
    try {
      await fetch(`/api/destinations/${destination.destinationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      await refetch();
      setViewState({ mode: "catalog" });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (viewState.mode === "detail") {
    const { destination } = viewState;
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <DestinationDetailView
          destination={destination}
          onEdit={(dest) => {
            setViewState({ mode: "edit", destination: dest });
          }}
          onBack={() => {
            setViewState({ mode: "catalog" });
          }}
        />
      </main>
    );
  }

  if (viewState.mode === "create") {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <DestinationFormView
          mode="create"
          isSubmitting={isSubmitting}
          onSubmit={(input) => {
            void handleCreate(input);
          }}
          onCancel={() => {
            setViewState({ mode: "catalog" });
          }}
        />
      </main>
    );
  }

  if (viewState.mode === "edit") {
    const { destination } = viewState;
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <DestinationFormView
          mode="edit"
          initialName={destination.name}
          initialSeasonality={destination.seasonality}
          isSubmitting={isSubmitting}
          onSubmit={(input) => {
            void handleEdit(destination, input);
          }}
          onCancel={() => {
            setViewState({ mode: "catalog" });
          }}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
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
        onAttach={() => {
          // Attach flow: follow-up
        }}
      />
    </main>
  );
}
