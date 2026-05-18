"use client";

import type { Leg } from "@/lib/types/trip";
import {
  type TransportCarOffer,
  type TransportLegDemand,
  TransportOfferVisibility,
} from "@/lib/types/transportation";
import { TRANSPORT_PLANNER_OVERVIEW_COPY } from "./TransportPlannerOverviewView.copy";

export { TransportOfferVisibility };
export type { TransportCarOffer, TransportLegDemand };

const COPY = TRANSPORT_PLANNER_OVERVIEW_COPY;

export interface NonAccountMemberTransportSummary {
  memberId: string;
  name: string;
  sortedOwnTransport: boolean;
}

export interface TransportLegSummary {
  leg: Leg;
  demand: TransportLegDemand;
  supply: TransportCarOffer[];
  nonAccountMembers?: NonAccountMemberTransportSummary[];
}

export interface TransportPlannerOverviewViewProps {
  legs: TransportLegSummary[];
  onToggleMemberSortedOwn?: (
    legId: string,
    memberId: string,
    sorted: boolean,
  ) => void;
}

function totalSeats(supply: TransportCarOffer[]): number {
  return supply.reduce((acc, offer) => acc + offer.seatCount, 0);
}

interface LegSectionProps {
  onToggleMemberSortedOwn?: (
    legId: string,
    memberId: string,
    sorted: boolean,
  ) => void;
  summary: TransportLegSummary;
}

function LegSection({ onToggleMemberSortedOwn, summary }: LegSectionProps) {
  const { leg, demand, supply, nonAccountMembers } = summary;
  const seats = totalSeats(supply);
  const gap = seats - demand.needRide;
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
          {isGap ? COPY.gapPill(Math.abs(gap)) : COPY.okPill}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {COPY.demandCardTitle}
          </p>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-xs">
            <dt>{COPY.demandDriving}</dt>
            <dd className="text-right font-medium">{demand.driving}</dd>
            <dt>{COPY.demandNeedRide}</dt>
            <dd className="text-right font-medium">{demand.needRide}</dd>
            <dt>{COPY.demandSkipLeg}</dt>
            <dd className="text-right font-medium">{demand.skipLeg}</dd>
            <dt>{COPY.demandNoReply}</dt>
            <dd className="text-right font-medium">{demand.noReply}</dd>
          </dl>
        </div>

        <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
          <div className="mb-2 flex items-baseline gap-1">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {COPY.supplyCardTitle}
            </p>
            {supply.length > 1 && (
              <span className="ml-auto flex items-center gap-1 font-mono text-xs text-zinc-400">
                <span>{COPY.seatsLabel(seats)}</span>
                <span>·</span>
                <span>{COPY.driversLabel(supply.length)}</span>
              </span>
            )}
          </div>
          <ul className="flex flex-col gap-1">
            {supply.map((offer, index) => (
              <li
                key={`${offer.driverName}-${offer.routeName}-${String(index)}`}
                className="flex items-center gap-1 font-mono text-xs"
              >
                <span className="flex-1 truncate">
                  {offer.driverName} · {offer.routeName}
                </span>
                <span className="text-zinc-400">
                  {COPY.seatsLabel(offer.seatCount)}
                </span>
                <span className="text-zinc-400">
                  {offer.visibility === TransportOfferVisibility.Public
                    ? COPY.publicVisibility
                    : offer.inviteeCount != null
                      ? COPY.inviteOnlyVisibility(offer.inviteeCount)
                      : COPY.inviteOnlyLabel}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {nonAccountMembers !== undefined && nonAccountMembers.length > 0 && (
        <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {COPY.nonAccountMembersTitle}
          </p>
          <ul
            aria-label={COPY.sortedOwnTransportLabel}
            className="flex flex-col gap-1"
          >
            {nonAccountMembers.map((member) => (
              <li key={member.memberId}>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={member.sortedOwnTransport}
                    onChange={(e) => {
                      onToggleMemberSortedOwn?.(
                        leg.legId,
                        member.memberId,
                        e.target.checked,
                      );
                    }}
                  />
                  {member.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function TransportPlannerOverviewView({
  legs,
  onToggleMemberSortedOwn,
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
          <LegSection
            key={summary.leg.legId}
            onToggleMemberSortedOwn={onToggleMemberSortedOwn}
            summary={summary}
          />
        ))}
      </main>
    </div>
  );
}
