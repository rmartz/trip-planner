"use client";

import { ScreenAvailabilityView } from "@/components/trips/ScreenAvailabilityView";
import { toDateKey } from "@/lib/dates";
import type { Trip } from "@/lib/types/trip";
import type { UnavailableRange } from "@/lib/types/unavailable-range";
import { AVAILABILITY_PAGE_COPY } from "./AvailabilityPageView.copy";

/** Returns a Date stripped to midnight local time. */
function toDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Builds the inclusive list of dates between trip.startDate and trip.endDate.
 */
function buildDates(trip: Trip): Date[] {
  const dates: Date[] = [];
  const cursor = toDay(trip.startDate);
  const end = toDay(trip.endDate);
  while (cursor.getTime() <= end.getTime()) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

/**
 * Builds the freeCountByDate map for the trip's date range.
 *
 * This scaffold has access only to the current viewer's unavailable ranges, so
 * the heatmap defaults all dates to "all members free" (memberCount) and
 * subtracts one from any date inside the viewer's own personal block. Once
 * other members' availability data is wired in, this aggregation will sum
 * across all Planners.
 */
function buildFreeCountByDate(
  dates: Date[],
  memberCount: number,
  currentUserRanges: UnavailableRange[],
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const date of dates) {
    const key = toDateKey(date);
    const isUserUnavailable = currentUserRanges.some((range) => {
      const start = toDay(range.startDate).getTime();
      const end = toDay(range.endDate).getTime();
      const d = toDay(date).getTime();
      return d >= start && d <= end;
    });
    result[key] = isUserUnavailable
      ? Math.max(0, memberCount - 1)
      : memberCount;
  }
  return result;
}

export interface AvailabilityPageViewProps {
  trip: Trip | undefined;
  currentUserTrips: Trip[];
  currentUserRanges: UnavailableRange[];
  isLoading: boolean;
  isError: boolean;
}

export function AvailabilityPageView({
  trip,
  currentUserTrips,
  currentUserRanges,
  isLoading,
  isError,
}: AvailabilityPageViewProps) {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {isLoading && (
        <p className="text-sm text-zinc-500">
          {AVAILABILITY_PAGE_COPY.loadingText}
        </p>
      )}
      {!isLoading && isError && (
        <p className="text-sm text-red-500">
          {AVAILABILITY_PAGE_COPY.errorText}
        </p>
      )}
      {!isLoading && !isError && trip === undefined && (
        <p className="text-sm text-zinc-500">
          {AVAILABILITY_PAGE_COPY.notFoundText}
        </p>
      )}
      {!isLoading && !isError && trip !== undefined && (
        <ScreenAvailabilityView
          dates={buildDates(trip)}
          memberCount={trip.memberUids.length}
          freeCountByDate={buildFreeCountByDate(
            buildDates(trip),
            trip.memberUids.length,
            currentUserRanges,
          )}
          currentUserTrips={currentUserTrips}
          currentUserRanges={currentUserRanges}
          isLoading={false}
          isError={false}
        />
      )}
    </div>
  );
}
