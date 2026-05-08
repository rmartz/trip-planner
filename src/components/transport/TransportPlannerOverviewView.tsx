"use client";

import type { Leg } from "@/lib/types/trip";
import { TRANSPORT_PLANNER_OVERVIEW_COPY } from "./TransportPlannerOverviewView.copy";

const COPY = TRANSPORT_PLANNER_OVERVIEW_COPY;

export interface TransportLegCapacity {
  driverCount: number;
  seatCount: number;
}

export interface TransportLegDemand {
  ridersNeeded: number;
}

export interface TransportLegSummary {
  leg: Leg;
  capacity: TransportLegCapacity;
  demand: TransportLegDemand;
}

export interface TransportPlannerOverviewViewProps {
  legs: TransportLegSummary[];
}

interface LegSectionProps {
  summary: TransportLegSummary;
}

function LegSection({ summary }: LegSectionProps) {
  const { leg, capacity, demand } = summary;
  const gap = capacity.seatCount - demand.ridersNeeded;
  const isGap = gap < 0;

  return (
    <section
      data-testid="transport-leg-section"
      className="flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{leg.name}</h2>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            isGap
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {isGap ? COPY.gapPill(gap) : COPY.okPill}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {COPY.capacityCardTitle}
          </p>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-xs">
            <dt>{COPY.driverLabel(capacity.driverCount)}</dt>
            <dd className="text-right font-medium">
              {COPY.capacityLabel(capacity.seatCount)}
            </dd>
          </dl>
        </div>

        <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {COPY.demandCardTitle}
          </p>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-xs">
            <dt>{COPY.demandRiders}</dt>
            <dd className="text-right font-medium">
              {COPY.passengersLabel(demand.ridersNeeded)}
            </dd>
          </dl>
        </div>
      </div>
    </section>
  );
}

export function TransportPlannerOverviewView({
  legs,
}: TransportPlannerOverviewViewProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-4 py-3">
        <h1 className="text-lg font-semibold">{COPY.heading}</h1>
        <p className="text-xs text-muted-foreground">{COPY.headingSubtext}</p>
      </header>

      <main
        data-testid="transport-legs-list"
        className="flex flex-col gap-6 p-4"
      >
        {legs.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {COPY.emptyLegsMessage}
          </p>
        )}
        {legs.map((summary) => (
          <LegSection key={summary.leg.legId} summary={summary} />
        ))}
      </main>
    </div>
  );
}
