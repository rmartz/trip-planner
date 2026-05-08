"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Stop, Leg } from "@/lib/types/trip";
import { TRIP_STRUCTURE_COPY } from "./copy";

function formatDateRange(startDate: Date, endDate: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
  return `${fmt(startDate)} → ${fmt(endDate)}`;
}

export interface TripStructurePageViewProps {
  stops: Stop[];
  legs: Leg[];
  isPlanner: boolean;
  onAddStop: () => void;
  onEditStop: (stop: Stop) => void;
  onReorder: (stopIds: string[]) => void;
  onRemoveLeg: (leg: Leg) => void;
}

export function TripStructurePageView({
  stops,
  legs,
  isPlanner,
  onAddStop,
  onEditStop,
  onReorder,
  onRemoveLeg,
}: TripStructurePageViewProps) {
  const [draggedId, setDraggedId] = useState<string | undefined>();

  function handleDragStart(stopId: string) {
    setDraggedId(stopId);
  }

  function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) return;
    const ids = stops.map((s) => s.stopId);
    const fromIdx = ids.indexOf(draggedId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const reordered = [...ids];
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, draggedId);
    onReorder(reordered);
    setDraggedId(undefined);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <h1 className="text-lg font-semibold">
            {TRIP_STRUCTURE_COPY.heading}
          </h1>
          <p className="text-xs text-muted-foreground">
            {TRIP_STRUCTURE_COPY.headingSubtext}
          </p>
        </div>
        {isPlanner && (
          <Button size="sm" onClick={onAddStop}>
            {TRIP_STRUCTURE_COPY.addStop}
          </Button>
        )}
      </header>

      <main className="flex flex-col gap-2 p-4 flex-1">
        {stops.map((stop, index) => (
          <div
            key={stop.stopId}
            draggable={isPlanner}
            onDragStart={() => {
              handleDragStart(stop.stopId);
            }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={() => {
              handleDrop(stop.stopId);
            }}
            className="flex items-center gap-3 p-3 border rounded-lg bg-card"
          >
            {isPlanner && (
              <span
                data-testid={`drag-handle-${stop.stopId}`}
                className="text-muted-foreground cursor-grab select-none"
                aria-hidden="true"
              >
                ⋮⋮
              </span>
            )}
            <div className="flex flex-col flex-1 gap-0.5">
              <span className="font-mono text-xs text-muted-foreground">
                {TRIP_STRUCTURE_COPY.stopLabel(index + 1)}
              </span>
              <span className="font-bold text-base">{stop.name}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {formatDateRange(stop.startDate, stop.endDate)}
              </span>
            </div>
            {isPlanner && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  onEditStop(stop);
                }}
              >
                {TRIP_STRUCTURE_COPY.editStop}
              </Button>
            )}
          </div>
        ))}

        {legs.map((leg) => (
          <div
            key={leg.legId}
            className="flex items-center gap-3 p-3 border rounded-lg bg-card"
          >
            <div className="flex flex-col flex-1 gap-0.5">
              <span className="font-mono text-xs text-muted-foreground">
                {TRIP_STRUCTURE_COPY.legLabel}
              </span>
              <span className="font-bold text-base">{leg.name}</span>
            </div>
            {isPlanner && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  onRemoveLeg(leg);
                }}
              >
                {TRIP_STRUCTURE_COPY.removeLeg}
              </Button>
            )}
          </div>
        ))}
      </main>

      {isPlanner && (
        <footer className="p-4 border-t">
          <Button variant="outline" className="w-full">
            {TRIP_STRUCTURE_COPY.addLeg}
          </Button>
        </footer>
      )}
    </div>
  );
}
