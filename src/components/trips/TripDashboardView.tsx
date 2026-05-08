"use client";

import Link from "next/link";
import { BellIcon, MenuIcon } from "lucide-react";
import type { Trip } from "@/lib/types/trip";
import { getTripPhase } from "@/lib/trips/phase";
import { formatDateRange } from "@/lib/trips/format";
import { PhasePill } from "./PhasePill";
import { TRIP_DASHBOARD_COPY } from "./TripDashboardView.copy";

function formatCountdown(startDate: Date, today: Date): string {
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntil = Math.ceil(
    (startDate.getTime() - today.getTime()) / msPerDay,
  );
  if (daysUntil <= 0) return "";
  if (daysUntil === 1) return "Tomorrow";
  return `in ${String(daysUntil)} days`;
}

interface TripCardProps {
  trip: Trip;
  faded?: boolean;
}

function TripCard({ trip, faded = false }: TripCardProps) {
  const today = new Date();
  const phase = getTripPhase(trip);
  const countdown = formatCountdown(trip.startDate, today);
  const dateRange = formatDateRange(trip.startDate, trip.endDate);

  return (
    <Link
      href={`/trips/${trip.tripId}`}
      data-slot="trip-card"
      className={`block rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 ${faded ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium">{trip.name}</h3>
        <PhasePill phase={phase} />
      </div>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {dateRange}
        {countdown ? ` · ${countdown}` : ""}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-zinc-400">{trip.memberUids.length}</span>
        {trip.gapCount != null && trip.gapCount > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            {trip.gapCount} gaps
          </span>
        )}
      </div>
    </Link>
  );
}

const QUICK_ACCESS_ITEMS = [
  { label: TRIP_DASHBOARD_COPY.quickAccessTrips, href: "/trips" },
  {
    label: TRIP_DASHBOARD_COPY.quickAccessDestinations,
    href: "/destinations",
  },
  { label: TRIP_DASHBOARD_COPY.quickAccessCalendar, href: "/calendar" },
  {
    label: TRIP_DASHBOARD_COPY.quickAccessNotifications,
    href: "/notifications",
  },
] as const;

export interface TripDashboardViewProps {
  activeTrips: Trip[];
  pastTrips: Trip[];
  onOpenMenu?: () => void;
  onOpenNotifications?: () => void;
}

export function TripDashboardView({
  activeTrips,
  pastTrips,
  onOpenMenu,
  onOpenNotifications,
}: TripDashboardViewProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
        <button
          type="button"
          aria-label={TRIP_DASHBOARD_COPY.openMenuAriaLabel}
          onClick={onOpenMenu}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold">
          {TRIP_DASHBOARD_COPY.appTitle}
        </span>
        <button
          type="button"
          aria-label={TRIP_DASHBOARD_COPY.notificationsAriaLabel}
          onClick={onOpenNotifications}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <BellIcon className="h-5 w-5" />
        </button>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <section aria-labelledby="quick-access-heading" className="mb-6">
          <h2
            id="quick-access-heading"
            className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
            {TRIP_DASHBOARD_COPY.quickAccessHeading}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACCESS_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-center rounded-lg border border-zinc-200 px-4 py-4 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="active-trips-heading" className="mb-6">
          <h2
            id="active-trips-heading"
            className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300"
          >
            {TRIP_DASHBOARD_COPY.activeTripsHeading}
            {activeTrips.length > 0 && (
              <span className="ml-1 text-zinc-400">
                {" "}
                · {activeTrips.length}
              </span>
            )}
          </h2>
          {activeTrips.length === 0 ? (
            <p className="text-sm text-zinc-400">No active trips.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {activeTrips.map((trip) => (
                <TripCard key={trip.tripId} trip={trip} />
              ))}
            </div>
          )}
        </section>

        {pastTrips.length > 0 && (
          <section aria-labelledby="past-trips-heading">
            <h2
              id="past-trips-heading"
              className="mb-3 text-sm font-semibold text-zinc-500"
            >
              {TRIP_DASHBOARD_COPY.pastTripsHeading}
              <span className="ml-1 text-zinc-400"> · {pastTrips.length}</span>
            </h2>
            <div className="flex flex-col gap-2">
              {pastTrips.map((trip) => (
                <TripCard key={trip.tripId} trip={trip} faded />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
