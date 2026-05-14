"use client";

import { SCREEN_DESTINATIONS_TRIP_COPY } from "./ScreenDestinationsTripView.copy";
import type { TripDestination } from "@/lib/types/destination";

interface DestinationCandidateCardProps {
  tripDestination: TripDestination;
}

function DestinationCandidateCard({
  tripDestination,
}: DestinationCandidateCardProps) {
  return (
    <div className="flex gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded bg-zinc-200 text-xs text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
        {SCREEN_DESTINATIONS_TRIP_COPY.imagePlaceholderLabel}
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="font-semibold">{tripDestination.name}</p>
        <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
          {`attached → ${tripDestination.stopName}`}
        </p>
      </div>
    </div>
  );
}

export interface ScreenDestinationsTripViewProps {
  tripId: string;
  destinations: TripDestination[];
  isLoading: boolean;
  isError: boolean;
  onBack: () => void;
  onAdd: () => void;
}

export function ScreenDestinationsTripView({
  destinations,
  isLoading,
  isError,
  onBack,
  onAdd,
}: ScreenDestinationsTripViewProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-1 text-sm text-zinc-500 hover:underline"
            aria-label="Go back"
          >
            ←
          </button>
          <h1 className="text-lg font-semibold">
            {SCREEN_DESTINATIONS_TRIP_COPY.heading}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {SCREEN_DESTINATIONS_TRIP_COPY.subheading}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {SCREEN_DESTINATIONS_TRIP_COPY.addButton}
        </button>
      </header>

      <main className="flex flex-col gap-2 p-4 flex-1">
        {isLoading && (
          <p className="text-zinc-500 dark:text-zinc-400">
            {SCREEN_DESTINATIONS_TRIP_COPY.loadingText}
          </p>
        )}

        {isError && (
          <p className="text-red-500 dark:text-red-400">
            {SCREEN_DESTINATIONS_TRIP_COPY.errorText}
          </p>
        )}

        {!isLoading && !isError && destinations.length === 0 && (
          <p className="text-zinc-500 dark:text-zinc-400">
            {SCREEN_DESTINATIONS_TRIP_COPY.emptyStateText}
          </p>
        )}

        {!isLoading && !isError && destinations.length > 0 && (
          <div className="flex flex-col gap-2">
            {destinations.map((td) => (
              <DestinationCandidateCard
                key={td.destinationId}
                tripDestination={td}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
