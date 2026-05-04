"use client";

import Link from "next/link";
import { useTrips } from "@/hooks/use-trips";
import type { Trip } from "@/lib/types/trip";
import { TRIP_LIST_COPY } from "./TripList.copy";

function formatDateRange(startDate: Date, endDate: Date): string {
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return `${startDate.toLocaleDateString(undefined, opts)} – ${endDate.toLocaleDateString(undefined, opts)}`;
}

interface TripCardProps {
  trip: Trip;
}

function TripCard({ trip }: TripCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h3 className="font-medium">{trip.name}</h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {formatDateRange(trip.startDate, trip.endDate)}
      </p>
    </div>
  );
}

export function TripList() {
  const { data: trips, isLoading, isError } = useTrips();

  if (isLoading) {
    return (
      <p className="text-zinc-500 dark:text-zinc-400">
        {TRIP_LIST_COPY.loadingText}
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-red-500 dark:text-red-400">
        {TRIP_LIST_COPY.errorText}
      </p>
    );
  }

  if (!trips?.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-xl font-medium">
          {TRIP_LIST_COPY.emptyStateHeading}
        </p>
        <p className="text-zinc-500 dark:text-zinc-400">
          {TRIP_LIST_COPY.emptyStateDescription}
        </p>
        <Link
          href="/trips/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {TRIP_LIST_COPY.createTripButton}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {trips.length} {trips.length === 1 ? "trip" : "trips"}
        </span>
        <Link
          href="/trips/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {TRIP_LIST_COPY.createTripButton}
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {trips.map((trip) => (
          <TripCard key={trip.tripId} trip={trip} />
        ))}
      </div>
    </div>
  );
}
