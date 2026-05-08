"use client";

import type { Destination } from "@/lib/types/destination";
import { DESTINATIONS_TRIP_PAGE_COPY } from "./DestinationsTripPageView.copy";

export interface DestinationsTripPageViewProps {
  destinations: Destination[];
  isLoading: boolean;
  isError: boolean;
}

export function DestinationsTripPageView({
  destinations,
  isLoading,
  isError,
}: DestinationsTripPageViewProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      {isLoading && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {DESTINATIONS_TRIP_PAGE_COPY.loadingText}
        </p>
      )}
      {!isLoading && isError && (
        <p className="text-sm text-red-500 dark:text-red-400">
          {DESTINATIONS_TRIP_PAGE_COPY.errorText}
        </p>
      )}
      {!isLoading && !isError && destinations.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {DESTINATIONS_TRIP_PAGE_COPY.emptyText}
        </p>
      )}
      {!isLoading && !isError && destinations.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {DESTINATIONS_TRIP_PAGE_COPY.heading}
          </h2>
          <ul
            data-testid="destinations-trip-list"
            className="flex flex-col gap-2"
          >
            {destinations.map((destination) => (
              <li
                key={destination.destinationId}
                className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800"
              >
                <span className="font-medium">{destination.name}</span>
                {destination.seasonality !== undefined && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {destination.seasonality}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
