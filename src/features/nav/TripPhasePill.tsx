"use client";

import { cn } from "@/lib/utils";

export enum TripPhase {
  Coordination = "coordination",
  Planning = "planning",
  Settled = "settled",
  SettlingUp = "settling-up",
}

const PHASE_LABELS: Record<TripPhase, string> = {
  [TripPhase.Coordination]: "Coordination",
  [TripPhase.Planning]: "Planning",
  [TripPhase.Settled]: "Settled",
  [TripPhase.SettlingUp]: "Settling up",
};

export interface TripPhasePillProps {
  phase: TripPhase;
  className?: string;
}

export function TripPhasePill({ phase, className }: TripPhasePillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border",
        className,
      )}
    >
      {PHASE_LABELS[phase]}
    </span>
  );
}
