"use client";

import type { Stop } from "@/lib/types/trip";
import { LODGING_PLANNER_OVERVIEW_COPY } from "./LodgingPlannerOverviewView.copy";

const COPY = LODGING_PLANNER_OVERVIEW_COPY;

export enum LodgingVisibility {
  InviteOnly = "invite_only",
  Public = "public",
}

export interface LodgingHostOffer {
  hostName: string;
  offerLabel: string;
  bedCount: number;
  visibility: LodgingVisibility;
  inviteeCount?: number;
}

export interface LodgingDemandBreakdown {
  needLodging: number;
  haveOwn: number;
  sharing: number;
  noReply: number;
}

export interface NonAccountMemberLodgingSummary {
  memberId: string;
  name: string;
  sortedOwnLodging: boolean;
}

export interface LodgingStopSummary {
  stop: Stop;
  demand: LodgingDemandBreakdown;
  supply: LodgingHostOffer[];
  nonAccountMembers?: NonAccountMemberLodgingSummary[];
}

export interface LodgingPlannerOverviewViewProps {
  stops: LodgingStopSummary[];
  onToggleMemberSortedOwn: (
    stopId: string,
    memberId: string,
    sorted: boolean,
  ) => void;
}

function totalBeds(supply: LodgingHostOffer[]): number {
  return supply.reduce((acc, offer) => acc + offer.bedCount, 0);
}

function getStatusPill(
  demand: LodgingDemandBreakdown,
  supply: LodgingHostOffer[],
): { label: string; isGap: boolean } {
  const beds = totalBeds(supply);
  const gap = beds - demand.needLodging;
  if (gap >= 0) {
    return { label: COPY.balancedPill, isGap: false };
  }
  return { label: COPY.gapPill(gap), isGap: true };
}

interface StopSectionProps {
  onToggleMemberSortedOwn: (
    stopId: string,
    memberId: string,
    sorted: boolean,
  ) => void;
  summary: LodgingStopSummary;
}

function StopSection({ onToggleMemberSortedOwn, summary }: StopSectionProps) {
  const { stop, demand, supply, nonAccountMembers } = summary;
  const pill = getStatusPill(demand, supply);
  const beds = totalBeds(supply);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-base">{stop.name}</h2>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            pill.isGap
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {pill.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {COPY.demandCardTitle}
          </p>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-xs">
            <dt>{COPY.statusNeedLodging}</dt>
            <dd className="text-right font-medium">{demand.needLodging}</dd>
            <dt>{COPY.statusHaveOwn}</dt>
            <dd className="text-right font-medium">{demand.haveOwn}</dd>
            <dt>{COPY.statusSharing}</dt>
            <dd className="text-right font-medium">{demand.sharing}</dd>
            <dt>{COPY.statusNoReply}</dt>
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
                <span>{COPY.bedsLabel(beds)}</span>
                <span>·</span>
                <span>{COPY.hostsLabel(supply.length)}</span>
              </span>
            )}
          </div>
          <ul className="flex flex-col gap-1">
            {supply.map((offer) => (
              <li
                key={offer.offerLabel}
                className="flex items-center gap-1 font-mono text-xs"
              >
                <span className="flex-1 truncate">{offer.offerLabel}</span>
                <span className="text-zinc-400">
                  {COPY.bedsLabel(offer.bedCount)}
                </span>
                <span className="text-zinc-400">
                  {offer.visibility === LodgingVisibility.Public
                    ? COPY.publicVisibility
                    : COPY.inviteOnlyVisibility(offer.inviteeCount ?? 0)}
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
            aria-label={COPY.sortedOwnLodgingLabel}
            className="flex flex-col gap-1"
          >
            {nonAccountMembers.map((member) => (
              <li key={member.memberId}>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={member.sortedOwnLodging}
                    onChange={(e) => {
                      onToggleMemberSortedOwn(
                        stop.stopId,
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

export function LodgingPlannerOverviewView({
  onToggleMemberSortedOwn,
  stops,
}: LodgingPlannerOverviewViewProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 py-3 border-b">
        <h1 className="text-lg font-semibold">{COPY.heading}</h1>
        <p className="text-xs text-muted-foreground">{COPY.headingSubtext}</p>
      </header>

      <main className="flex flex-col gap-6 p-4">
        {stops.map((summary) => (
          <StopSection
            key={summary.stop.stopId}
            summary={summary}
            onToggleMemberSortedOwn={onToggleMemberSortedOwn}
          />
        ))}
      </main>
    </div>
  );
}
