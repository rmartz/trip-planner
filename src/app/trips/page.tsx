"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { useTrips } from "@/hooks/use-trips";
import type { Trip } from "@/lib/types/trip";
import { getTripPhase } from "@/lib/trips/phase";
import { formatDateRange } from "@/lib/trips/format";
import { PhasePill } from "@/components/trips/PhasePill";
import { TRIPS_PAGE_COPY } from "./copy";

interface TripRowProps {
  trip: Trip;
}

function TripRow({ trip }: TripRowProps) {
  const phase = getTripPhase(trip);
  return (
    <div
      data-slot="trip-row"
      className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium">{trip.name}</h3>
        <PhasePill phase={phase} />
      </div>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {formatDateRange(trip.startDate, trip.endDate)}
      </p>
    </div>
  );
}

export default function TripsPage() {
  const { data: trips, isLoading, isError } = useTrips();
  const now = new Date();

  const upcoming = trips?.filter((t) => t.endDate >= now) ?? [];
  const archived = trips?.filter((t) => t.endDate < now) ?? [];

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <p className="text-zinc-500">{TRIPS_PAGE_COPY.loadingText}</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <p className="text-red-500">{TRIPS_PAGE_COPY.errorText}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          aria-label="Go back"
          className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold">{TRIPS_PAGE_COPY.pageTitle}</h1>
      </div>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {TRIPS_PAGE_COPY.upcomingHeading}
          {upcoming.length > 0 && (
            <span className="ml-1 text-zinc-400"> · {upcoming.length}</span>
          )}
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-zinc-400">{TRIPS_PAGE_COPY.emptyText}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map((trip) => (
              <TripRow key={trip.tripId} trip={trip} />
            ))}
          </div>
        )}
      </section>

      {archived.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-zinc-500">
            {TRIPS_PAGE_COPY.archivedHeading}
            <span className="ml-1 text-zinc-400"> · {archived.length}</span>
          </h2>
          <div className="flex flex-col gap-2 opacity-50">
            {archived.map((trip) => (
              <TripRow key={trip.tripId} trip={trip} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
