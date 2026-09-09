"use client";

import type { Trip } from "@/lib/types/trip";
import type { UnavailableRange } from "@/lib/types/unavailable-range";
import { toDateKey } from "@/lib/dates";
import {
  getConflictDateKeys,
  getFirstWindowConflict,
} from "@/lib/trips/conflicts";
import { SCREEN_AVAILABILITY_COPY } from "./ScreenAvailabilityView.copy";

const COPY = SCREEN_AVAILABILITY_COPY;

/** Formats a Date to a short label: "Jun 10". */
function toShortLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Returns the heat level (0–4) for a given free count out of total.
 * l0 = 0 free, l4 = all free.
 */
function heatLevel(free: number, total: number): 0 | 1 | 2 | 3 | 4 {
  if (total === 0) return 0;
  const ratio = free / total;
  if (ratio === 0) return 0;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

const HEAT_CLASSES: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-zinc-100 dark:bg-zinc-800",
  1: "bg-emerald-100 dark:bg-emerald-900/40",
  2: "bg-emerald-200 dark:bg-emerald-800/60",
  3: "bg-emerald-400 dark:bg-emerald-600",
  4: "bg-emerald-600 dark:bg-emerald-400",
};

interface AvailCellProps {
  date: Date;
  free: number;
  total: number;
  isConflict: boolean;
}

function AvailCell({ date, free, total, isConflict }: AvailCellProps) {
  const key = toDateKey(date);
  const label = toShortLabel(date);
  const level = heatLevel(free, total);
  const heatClass = isConflict
    ? "bg-amber-300 dark:bg-amber-500"
    : HEAT_CLASSES[level];

  return (
    <div
      data-testid={`avail-cell-${key}`}
      data-conflict={isConflict ? "true" : undefined}
      className="flex flex-col items-center gap-0.5"
    >
      <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <div className={["h-10 w-10 rounded-sm", heatClass].join(" ")} />
      <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
        {COPY.freeCountLabel(free, total)}
      </span>
    </div>
  );
}

/**
 * Derives contiguous "best windows" from the dates array — runs of consecutive
 * dates where all members are free (freeCount === memberCount). Returns the
 * start/end of each such run.
 */
function getBestWindows(
  dates: Date[],
  freeCountByDate: Record<string, number>,
  memberCount: number,
): { start: Date; end: Date }[] {
  const windows: { start: Date; end: Date }[] = [];
  let runStart: Date | undefined;

  for (const date of dates) {
    const key = toDateKey(date);
    const free = freeCountByDate[key] ?? 0;
    if (free === memberCount && memberCount > 0) {
      runStart ??= date;
    } else {
      if (runStart !== undefined) {
        const prev = dates[dates.indexOf(date) - 1];
        if (prev !== undefined) windows.push({ start: runStart, end: prev });
        runStart = undefined;
      }
    }
  }

  // Close an open run at the end
  const lastDate = dates[dates.length - 1];
  if (runStart !== undefined && lastDate !== undefined) {
    windows.push({ start: runStart, end: lastDate });
  }

  return windows;
}

interface BestWindowCardProps {
  start: Date;
  end: Date;
  free: number;
  total: number;
  currentUserTrips: Trip[];
  currentUserRanges: UnavailableRange[];
}

function BestWindowCard({
  start,
  end,
  free,
  total,
  currentUserTrips,
  currentUserRanges,
}: BestWindowCardProps) {
  const conflict = getFirstWindowConflict(
    start,
    end,
    currentUserTrips,
    currentUserRanges,
  );
  const dateLabel = `${toShortLabel(start)}–${toShortLabel(end)}`;
  const freeLabel = COPY.freeCountLabel(free, total);

  return (
    <div
      data-testid={`best-window-${toDateKey(start)}-${toDateKey(end)}`}
      className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
    >
      <p className="text-sm font-medium">
        {dateLabel}
        <span className="ml-2 text-zinc-500">{freeLabel} free</span>
      </p>
      {conflict !== undefined && (
        <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">
          {COPY.conflictWarningPrefix}
          {conflict.name}
        </p>
      )}
    </div>
  );
}

export interface ScreenAvailabilityViewProps {
  /** Ordered list of dates to display in the grid. */
  dates: Date[];
  /** Total number of group members. */
  memberCount: number;
  /** Map of "YYYY-MM-DD" → number of members free on that date. */
  freeCountByDate: Record<string, number>;
  /** The current viewer's own platform trips (for conflict detection). */
  currentUserTrips: Trip[];
  /** The current viewer's personal day-off ranges (for conflict detection). */
  currentUserRanges: UnavailableRange[];
  isLoading: boolean;
  isError: boolean;
}

export function ScreenAvailabilityView({
  dates,
  memberCount,
  freeCountByDate,
  currentUserTrips,
  currentUserRanges,
  isLoading,
  isError,
}: ScreenAvailabilityViewProps) {
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];
  const conflictKeys =
    firstDate !== undefined && lastDate !== undefined
      ? getConflictDateKeys(
          firstDate,
          lastDate,
          currentUserTrips,
          currentUserRanges,
        )
      : new Set<string>();

  const bestWindows = getBestWindows(dates, freeCountByDate, memberCount);

  return (
    <div className="flex flex-col gap-6">
      {/* Date grid */}
      <div>
        {isLoading && (
          <p className="text-sm text-zinc-500">{COPY.loadingText}</p>
        )}
        {isError && <p className="text-sm text-red-500">{COPY.errorText}</p>}
        {!isLoading && !isError && dates.length === 0 && (
          <p className="text-sm text-zinc-500">{COPY.emptyDatesText}</p>
        )}
        {!isLoading && !isError && dates.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {dates.map((date) => {
              const key = toDateKey(date);
              const free = freeCountByDate[key] ?? 0;
              return (
                <AvailCell
                  key={key}
                  date={date}
                  free={free}
                  total={memberCount}
                  isConflict={conflictKeys.has(key)}
                />
              );
            })}
          </div>
        )}

        {/* Legend */}
        {!isLoading && !isError && (
          <div className="mt-3 flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-zinc-100 dark:bg-zinc-800" />
              <span className="text-xs text-zinc-500">{COPY.legendFew}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-emerald-600 dark:bg-emerald-400" />
              <span className="text-xs text-zinc-500">
                {COPY.legendAllFree}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-sm bg-amber-300 dark:bg-amber-500" />
              <span className="text-xs text-zinc-500">
                {COPY.legendConflictsYou}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Best windows */}
      <div data-testid="best-windows-section">
        <h2 className="mb-3 text-sm font-semibold">
          {COPY.bestWindowsSectionTitle}
        </h2>
        {!isLoading && !isError && bestWindows.length === 0 && (
          <p className="text-sm text-zinc-500">{COPY.noBestWindowsText}</p>
        )}
        {!isLoading &&
          !isError &&
          bestWindows.map(({ start, end }) => (
            <BestWindowCard
              key={`${toDateKey(start)}-${toDateKey(end)}`}
              start={start}
              end={end}
              free={memberCount}
              total={memberCount}
              currentUserTrips={currentUserTrips}
              currentUserRanges={currentUserRanges}
            />
          ))}
      </div>
    </div>
  );
}
