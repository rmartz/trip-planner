"use client";

import Link from "next/link";
import type { Trip } from "@/lib/types/trip";
import { getTripPhase } from "@/lib/trips/phase";
import { formatDateRange } from "@/lib/trips/format";
import { PhasePill } from "@/components/trips/PhasePill";
import { TRIP_OVERVIEW_PAGE_COPY } from "./TripOverviewPageView.copy";

interface SectionLink {
  href: (tripId: string) => string;
  label: string;
}

const SECTION_LINKS: SectionLink[] = [
  {
    href: (tripId) => `/trips/${tripId}/structure`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionStructure,
  },
  {
    href: (tripId) => `/trips/${tripId}/destinations`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionDestinations,
  },
  {
    href: (tripId) => `/trips/${tripId}/availability`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionAvailability,
  },
  {
    href: (tripId) => `/trips/${tripId}/lodging`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionLodging,
  },
  {
    href: (tripId) => `/trips/${tripId}/transport`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionTransport,
  },
  {
    href: (tripId) => `/trips/${tripId}/activities`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionActivities,
  },
  {
    href: (tripId) => `/trips/${tripId}/schedule`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionSchedule,
  },
  {
    href: (tripId) => `/trips/${tripId}/rsvp`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionRsvp,
  },
  {
    href: (tripId) => `/trips/${tripId}/expenses`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionExpenses,
  },
  {
    href: (tripId) => `/trips/${tripId}/balances`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionBalances,
  },
  {
    href: (tripId) => `/trips/${tripId}/members`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionMembers,
  },
  {
    href: (tripId) => `/trips/${tripId}/archive`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionArchive,
  },
];

export interface TripOverviewPageViewProps {
  trip: Trip | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function TripOverviewPageView({
  trip,
  isLoading,
  isError,
}: TripOverviewPageViewProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {isLoading && (
        <p className="p-6 text-sm text-zinc-500">
          {TRIP_OVERVIEW_PAGE_COPY.loadingText}
        </p>
      )}
      {!isLoading && isError && (
        <p className="p-6 text-sm text-red-500">
          {TRIP_OVERVIEW_PAGE_COPY.errorText}
        </p>
      )}
      {!isLoading && !isError && trip === undefined && (
        <p className="p-6 text-sm text-zinc-500">
          {TRIP_OVERVIEW_PAGE_COPY.notFoundText}
        </p>
      )}
      {!isLoading && !isError && trip !== undefined && (
        <>
          <header
            data-testid="trip-overview-header"
            className="flex flex-col gap-2 border-b border-zinc-200 px-4 py-5 dark:border-zinc-800 sm:px-6 lg:px-8"
          >
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {trip.name}
              </h1>
              <PhasePill phase={getTripPhase(trip)} />
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {formatDateRange(trip.startDate, trip.endDate)}
            </p>
          </header>

          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {TRIP_OVERVIEW_PAGE_COPY.sectionsHeading}
            </h2>
            <nav
              data-testid="trip-overview-sections"
              className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {SECTION_LINKS.map((section) => (
                <Link
                  key={section.label}
                  href={section.href(trip.tripId)}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-4 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <span>{section.label}</span>
                  <span aria-hidden="true" className="text-zinc-400">
                    →
                  </span>
                </Link>
              ))}
            </nav>
          </main>
        </>
      )}
    </div>
  );
}
