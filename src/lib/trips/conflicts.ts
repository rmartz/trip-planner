import type { Trip } from "@/lib/types/trip";
import type { UnavailableRange } from "@/lib/types/unavailable-range";

/** Returns a Date stripped to midnight local time for day-boundary comparisons. */
function toDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Returns true when two date ranges overlap (inclusive on both ends).
 * [aStart, aEnd] overlaps [bStart, bEnd] when aStart ≤ bEnd AND bStart ≤ aEnd.
 */
function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return (
    toDay(aStart).getTime() <= toDay(bEnd).getTime() &&
    toDay(bStart).getTime() <= toDay(aEnd).getTime()
  );
}

/**
 * Returns true when the given date (day-boundary) falls within [rangeStart, rangeEnd] inclusive.
 */
function dateInRange(date: Date, rangeStart: Date, rangeEnd: Date): boolean {
  const d = toDay(date).getTime();
  return d >= toDay(rangeStart).getTime() && d <= toDay(rangeEnd).getTime();
}

export interface ConflictSource {
  /** The trip that the personal block conflicts with. */
  kind: "trip" | "personal-block";
  name: string;
}

/**
 * Given a specific date and the current user's platform trips and personal
 * day-off ranges, returns the list of conflict sources that make that date a
 * conflict — or an empty array if the date is clear.
 *
 * A date conflicts when it falls within a personal day-off range that overlaps
 * one of the user's platform trips. This mirrors the CalendarPageView "conflict"
 * state: the user has marked themselves unavailable during a trip window.
 *
 * Conflicts are per-user: the caller passes only the viewing Planner's data.
 */
export function getConflictSourcesForDate(
  date: Date,
  userTrips: Trip[],
  userRanges: UnavailableRange[],
): ConflictSource[] {
  const sources: ConflictSource[] = [];

  for (const range of userRanges) {
    if (!dateInRange(date, range.startDate, range.endDate)) continue;
    // Date is inside this personal block — report each trip it overlaps.
    for (const trip of userTrips) {
      if (
        rangesOverlap(
          range.startDate,
          range.endDate,
          trip.startDate,
          trip.endDate,
        )
      ) {
        sources.push({ kind: "trip", name: trip.name });
      }
    }
  }

  return sources;
}

/**
 * Given a start date, end date (inclusive), and the current user's trips and
 * personal day-off ranges, returns the Set of date keys ("YYYY-MM-DD") that
 * have at least one conflict.
 *
 * Used by the ScreenAvailability grid to overlay conflict markers only for
 * the viewing Planner's personal data.
 */
export function getConflictDateKeys(
  windowStart: Date,
  windowEnd: Date,
  userTrips: Trip[],
  userRanges: UnavailableRange[],
): Set<string> {
  const result = new Set<string>();
  const current = toDay(windowStart);
  const end = toDay(windowEnd);

  while (current.getTime() <= end.getTime()) {
    const conflicts = getConflictSourcesForDate(current, userTrips, userRanges);
    if (conflicts.length > 0) {
      const key = [
        String(current.getFullYear()),
        String(current.getMonth() + 1).padStart(2, "0"),
        String(current.getDate()).padStart(2, "0"),
      ].join("-");
      result.add(key);
    }
    current.setDate(current.getDate() + 1);
  }

  return result;
}

/**
 * For "Best windows" callouts: given a date window [windowStart, windowEnd] and
 * the current user's trips and personal day-off ranges, returns the first
 * conflict source that overlaps the window — or undefined if clear.
 *
 * Checks personal-block conflicts (block overlaps trip) first, then bare trip
 * overlaps. The caller formats the display string (e.g. "⚠ overlaps {name}").
 */
export function getFirstWindowConflict(
  windowStart: Date,
  windowEnd: Date,
  userTrips: Trip[],
  userRanges: UnavailableRange[],
): ConflictSource | undefined {
  for (const range of userRanges) {
    if (rangesOverlap(windowStart, windowEnd, range.startDate, range.endDate)) {
      for (const trip of userTrips) {
        if (
          rangesOverlap(
            range.startDate,
            range.endDate,
            trip.startDate,
            trip.endDate,
          )
        ) {
          return { kind: "personal-block", name: range.note ?? trip.name };
        }
      }
    }
  }
  for (const trip of userTrips) {
    if (rangesOverlap(windowStart, windowEnd, trip.startDate, trip.endDate)) {
      return { kind: "trip", name: trip.name };
    }
  }
  return undefined;
}
