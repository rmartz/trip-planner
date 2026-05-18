"use client";

import Link from "next/link";
import type { Trip } from "@/lib/types/trip";
import { getTripPhase } from "@/lib/trips/phase";
import { formatDateRange } from "@/lib/trips/format";
import { PhasePill } from "@/components/trips/PhasePill";
import { TRIP_OVERVIEW_PAGE_COPY } from "./TripOverviewPageView.copy";

interface SectionLink {
  id: string;
  href: (tripId: string) => string;
  label: string;
}

const SECTION_LINKS: SectionLink[] = [
  {
    id: "structure",
    href: (tripId) => `/trips/${tripId}/structure`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionStructure,
  },
  {
    id: "destinations",
    href: (tripId) => `/trips/${tripId}/destinations`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionDestinations,
  },
  {
    id: "availability",
    href: (tripId) => `/trips/${tripId}/availability`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionAvailability,
  },
  {
    id: "lodging",
    href: (tripId) => `/trips/${tripId}/lodging`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionLodging,
  },
  {
    id: "transport",
    href: (tripId) => `/trips/${tripId}/transport`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionTransport,
  },
  {
    id: "activities",
    href: (tripId) => `/trips/${tripId}/activities`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionActivities,
  },
  {
    id: "schedule",
    href: (tripId) => `/trips/${tripId}/schedule`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionSchedule,
  },
  {
    id: "rsvp",
    href: (tripId) => `/trips/${tripId}/rsvp`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionRsvp,
  },
  {
    id: "expenses",
    href: (tripId) => `/trips/${tripId}/expenses`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionExpenses,
  },
  {
    id: "balances",
    href: (tripId) => `/trips/${tripId}/balances`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionBalances,
  },
  {
    id: "members",
    href: (tripId) => `/trips/${tripId}/members`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionMembers,
  },
  {
    id: "archive",
    href: (tripId) => `/trips/${tripId}/archive`,
    label: TRIP_OVERVIEW_PAGE_COPY.sectionArchive,
  },
];

export interface TripOverviewPageViewProps {
  trip: Trip | undefined;
  isLoading: boolean;
  isError: boolean;
  lodgingGapCount?: number;
  transportGapCount?: number;
}

export function TripOverviewPageView({
  trip,
  isLoading,
  isError,
  lodgingGapCount,
  transportGapCount,
}: TripOverviewPageViewProps) {
  const lodgingSubline =
    lodgingGapCount != null && lodgingGapCount > 0
      ? TRIP_OVERVIEW_PAGE_COPY.lodgingGapSubline(lodgingGapCount)
      : undefined;
  const transportSubline =
    transportGapCount != null && transportGapCount > 0
      ? TRIP_OVERVIEW_PAGE_COPY.transportGapSubline(transportGapCount)
      : undefined;
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
                  key={section.id}
                  href={section.href(trip.tripId)}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-4 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <span className="flex flex-col gap-0.5">
                    <span>{section.label}</span>
                    {section.id === "lodging" && lodgingSubline && (
                      <span className="text-xs font-normal text-amber-600 dark:text-amber-400">
                        {lodgingSubline}
                      </span>
                    )}
                    {section.id === "transport" && transportSubline && (
                      <span className="text-xs font-normal text-amber-600 dark:text-amber-400">
                        {transportSubline}
                      </span>
                    )}
                  </span>
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
