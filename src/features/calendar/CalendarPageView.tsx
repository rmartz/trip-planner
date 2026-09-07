"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UnavailableRange } from "@/lib/types/unavailable-range";
import type { Trip } from "@/lib/types/trip";
import { CALENDAR_PAGE_COPY } from "./CalendarPageView.copy";

const COPY = CALENDAR_PAGE_COPY;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function toDateKey(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${String(year)}-${mm}-${dd}`;
}

function dateInRange(date: Date, start: Date, end: Date): boolean {
  const d = date.getTime();
  return d >= start.getTime() && d <= end.getTime();
}

function dateWithinDay(
  target: Date,
  rangeStart: Date,
  rangeEnd: Date,
): boolean {
  // Create day-boundary versions for inclusive comparison
  const targetStart = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  const rangeStartDay = new Date(
    rangeStart.getFullYear(),
    rangeStart.getMonth(),
    rangeStart.getDate(),
  );
  const rangeEndDay = new Date(
    rangeEnd.getFullYear(),
    rangeEnd.getMonth(),
    rangeEnd.getDate(),
  );
  return dateInRange(targetStart, rangeStartDay, rangeEndDay);
}

function rangesOverlapTrip(range: UnavailableRange, trip: Trip): boolean {
  // Two date ranges [A,B] and [C,D] overlap when A<=D and C<=B
  const rangeStart = new Date(
    range.startDate.getFullYear(),
    range.startDate.getMonth(),
    range.startDate.getDate(),
  );
  const rangeEnd = new Date(
    range.endDate.getFullYear(),
    range.endDate.getMonth(),
    range.endDate.getDate(),
  );
  const tripStart = new Date(
    trip.startDate.getFullYear(),
    trip.startDate.getMonth(),
    trip.startDate.getDate(),
  );
  const tripEnd = new Date(
    trip.endDate.getFullYear(),
    trip.endDate.getMonth(),
    trip.endDate.getDate(),
  );
  return (
    rangeStart.getTime() <= tripEnd.getTime() &&
    tripStart.getTime() <= rangeEnd.getTime()
  );
}

function formatDateRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`;
}

type DayState = "blocked" | "conflict" | "normal";

interface DayCellProps {
  year: number;
  month: number;
  day: number;
  state: DayState;
}

function DayCell({ year, month, day, state }: DayCellProps) {
  const key = toDateKey(year, month, day);
  const isBlocked = state === "blocked";
  const isConflict = state === "conflict";

  return (
    <div
      data-testid={`calendar-day-${key}`}
      data-state={state === "normal" ? undefined : state}
      className={[
        "flex h-9 w-9 items-center justify-center rounded-full text-sm",
        isConflict
          ? "bg-amber-400 font-semibold text-amber-950"
          : isBlocked
            ? "bg-zinc-800 font-semibold text-white dark:bg-zinc-200 dark:text-zinc-900"
            : "text-zinc-700 dark:text-zinc-300",
      ].join(" ")}
    >
      {day}
    </div>
  );
}

interface BlockCardProps {
  range: UnavailableRange;
  overlappingTripName: string | undefined;
}

function BlockCard({ range, overlappingTripName }: BlockCardProps) {
  return (
    <div
      data-testid={`block-card-${range.rangeId}`}
      className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
    >
      <p className="text-sm font-medium">
        {formatDateRange(range.startDate, range.endDate)}
      </p>
      {range.note && (
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {range.note}
        </p>
      )}
      {overlappingTripName !== undefined && (
        <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">
          {COPY.overlapWarningPrefix}
          {overlappingTripName}
        </p>
      )}
    </div>
  );
}

export interface CalendarPageViewProps {
  currentMonth: Date;
  ranges: UnavailableRange[];
  trips: Trip[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onAddBlock: () => void;
  isLoading: boolean;
  isError: boolean;
}

export function CalendarPageView({
  currentMonth,
  ranges,
  trips,
  onPrevMonth,
  onNextMonth,
  onAddBlock,
  isLoading,
  isError,
}: CalendarPageViewProps) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = MONTH_NAMES[month] ?? "";
  const monthLabel = `${monthName} ${String(year)}`;

  // Build grid: first day of month's weekday, total days
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Determine day state for each day in the month
  function getDayState(day: number): DayState {
    const date = new Date(year, month, day);
    const blockingRange = ranges.find((r) =>
      dateWithinDay(date, r.startDate, r.endDate),
    );
    if (!blockingRange) return "normal";
    const hasConflict = trips.some((trip) =>
      rangesOverlapTrip(blockingRange, trip),
    );
    return hasConflict ? "conflict" : "blocked";
  }

  // Build the grid cells: leading empty cells + day cells
  const leadingEmpties = Array.from({ length: firstDayOfWeek });
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Upcoming blocks with their overlapping trip name
  const upcomingBlocks = ranges.map((range) => {
    const overlappingTrip = trips.find((trip) =>
      rangesOverlapTrip(range, trip),
    );
    return { range, overlappingTripName: overlappingTrip?.name };
  });

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-base font-semibold">{monthLabel}</span>
        <Button variant="ghost" size="sm" onClick={onAddBlock}>
          {COPY.addBlockButtonLabel}
        </Button>
      </div>

      {/* Calendar section */}
      <div className="px-4">
        {/* Month nav */}
        <div className="mb-2 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onPrevMonth}
            aria-label={COPY.prevMonthAriaLabel}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onNextMonth}
            aria-label={COPY.nextMonthAriaLabel}
          >
            <ChevronRightIcon />
          </Button>
        </div>

        {/* Weekday header */}
        <div className="grid grid-cols-7 gap-0.5">
          {COPY.weekdayHeaders.map((day, idx) => (
            <div
              key={idx}
              className="flex h-9 w-9 items-center justify-center text-xs font-medium text-zinc-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {leadingEmpties.map((_, i) => (
            <div key={`empty-${String(i)}`} className="h-9 w-9" />
          ))}
          {dayNumbers.map((day) => (
            <DayCell
              key={day}
              year={year}
              month={month}
              day={day}
              state={getDayState(day)}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-3 flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-zinc-800 dark:bg-zinc-200" />
            <span className="text-xs text-zinc-500">{COPY.legendBlocked}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="text-xs text-zinc-500">{COPY.legendConflict}</span>
          </div>
        </div>
      </div>

      {/* Upcoming blocks */}
      <div className="mt-6 px-4">
        <h2 className="mb-3 text-sm font-semibold">
          {COPY.upcomingBlocksSectionTitle}
        </h2>

        {isLoading && (
          <p className="text-sm text-zinc-500">{COPY.loadingText}</p>
        )}
        {isError && <p className="text-sm text-red-500">{COPY.errorText}</p>}
        {!isLoading && !isError && upcomingBlocks.length === 0 && (
          <p className="text-sm text-zinc-500">{COPY.emptyUpcomingText}</p>
        )}
        {!isLoading &&
          !isError &&
          upcomingBlocks.map(({ range, overlappingTripName }) => (
            <BlockCard
              key={range.rangeId}
              range={range}
              overlappingTripName={overlappingTripName}
            />
          ))}
      </div>
    </div>
  );
}
