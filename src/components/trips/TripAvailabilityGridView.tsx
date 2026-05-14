"use client";

import { useRef } from "react";
import { TRIP_AVAILABILITY_GRID_COPY } from "./TripAvailabilityGridView.copy";

/** Formats a Date to "YYYY-MM-DD" in local time for use as a map key. */
function toDateKey(date: Date): string {
  return [
    String(date.getFullYear()),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

/** Short day label: "Jun 10". */
function toShortLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Heat level label for data attribute and styling. */
function heatLabel(count: number, total: number): "all" | "some" | "none" {
  if (total === 0 || count === 0) return "none";
  if (count >= total) return "all";
  return "some";
}

const HEAT_CLASSES: Record<"all" | "some" | "none", string> = {
  all: "bg-emerald-500 dark:bg-emerald-400",
  some: "bg-emerald-200 dark:bg-emerald-700",
  none: "bg-zinc-100 dark:bg-zinc-800",
};

const MINE_RING = "ring-2 ring-blue-500 ring-inset";

interface DateCellProps {
  date: Date;
  isMine: boolean;
  heat: "all" | "some" | "none";
  onDragStart: (key: string) => void;
  onDragEnter: (key: string) => void;
  onDragEnd: () => void;
  onDragCancel: () => void;
}

function DateCell({
  date,
  isMine,
  heat,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDragCancel,
}: DateCellProps) {
  const key = toDateKey(date);
  const label = toShortLabel(date);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Toggle availability for ${label}`}
      aria-pressed={isMine}
      data-testid={`avail-input-cell-${key}`}
      data-mine={isMine ? "true" : "false"}
      data-heat={heat}
      className="flex select-none flex-col items-center gap-0.5"
      onPointerDown={(e) => {
        e.preventDefault();
        onDragStart(key);
      }}
      onPointerEnter={() => {
        onDragEnter(key);
      }}
      onPointerUp={() => {
        onDragEnd();
      }}
      onPointerCancel={() => {
        onDragCancel();
      }}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onDragStart(key);
          onDragEnd();
        }
      }}
    >
      <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <div
        className={[
          "h-10 w-10 cursor-pointer rounded-sm",
          HEAT_CLASSES[heat],
          isMine ? MINE_RING : "",
        ].join(" ")}
      />
    </div>
  );
}

export interface TripAvailabilityGridViewProps {
  /** Ordered list of dates to display in the grid. */
  dates: Date[];
  /** The current user's selected available dates (YYYY-MM-DD keys). */
  myAvailableDates: ReadonlySet<string>;
  /** Map of YYYY-MM-DD → number of planners available on that date. */
  memberCountByDate: Record<string, number>;
  /** Total number of planners on the trip. */
  plannerCount: number;
  isLoading: boolean;
  /** Called with the array of date keys that were toggled. */
  onToggleDates: (dateKeys: string[]) => void;
}

export function TripAvailabilityGridView({
  dates,
  myAvailableDates,
  memberCountByDate,
  plannerCount,
  isLoading,
  onToggleDates,
}: TripAvailabilityGridViewProps) {
  const isDragging = useRef(false);
  const draggedKeys = useRef<string[]>([]);

  function handleDragStart(key: string) {
    isDragging.current = true;
    draggedKeys.current = [key];
  }

  function handleDragEnter(key: string) {
    if (!isDragging.current) return;
    if (!draggedKeys.current.includes(key)) {
      draggedKeys.current = [...draggedKeys.current, key];
    }
  }

  function handleDragEnd() {
    if (!isDragging.current) return;
    const keys = draggedKeys.current;
    isDragging.current = false;
    draggedKeys.current = [];
    if (keys.length > 0) {
      onToggleDates(keys);
    }
  }

  function handleDragCancel() {
    isDragging.current = false;
    draggedKeys.current = [];
  }

  return (
    <div
      className="flex flex-col gap-4"
      onPointerUp={handleDragEnd}
      onPointerLeave={handleDragEnd}
      onPointerCancel={handleDragCancel}
    >
      {isLoading && (
        <p className="text-sm text-zinc-500">
          {TRIP_AVAILABILITY_GRID_COPY.loadingText}
        </p>
      )}

      {!isLoading && (
        <>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {TRIP_AVAILABILITY_GRID_COPY.instructions}
          </p>
          <div className="flex flex-wrap gap-2">
            {dates.map((date) => {
              const key = toDateKey(date);
              const count = memberCountByDate[key] ?? 0;
              return (
                <DateCell
                  key={key}
                  date={date}
                  isMine={myAvailableDates.has(key)}
                  heat={heatLabel(count, plannerCount)}
                  onDragStart={handleDragStart}
                  onDragEnter={handleDragEnter}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
