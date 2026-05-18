"use client";

import { VoteRow } from "@/components/ui/VoteRow";
import { InterestVote } from "@/lib/types/interest-vote";
import { TripRole } from "@/lib/types/trip";
import { ACTIVITIES_TRIP_PAGE_COPY } from "./ActivitiesTripPageView.copy";

const COPY = ACTIVITIES_TRIP_PAGE_COPY;
const MAX_VISIBLE_NAMES = 3;

export interface ActivityProposalCounts {
  yes: number;
  maybe: number;
  no: number;
}

export interface ActivityProposalVoterNames {
  yes: string[];
  maybe: string[];
  no: string[];
}

export interface ActivityProposal {
  proposalId: string;
  name: string;
  description?: string;
  proposerName: string;
  counts: ActivityProposalCounts;
  timeHint?: string;
  userVote: InterestVote | undefined;
  voterNames?: ActivityProposalVoterNames;
}

export interface ActivitiesTripPageViewProps {
  proposals: ActivityProposal[];
  isLoading: boolean;
  isError: boolean;
  role?: TripRole;
  onVote: (proposalId: string, vote: InterestVote) => void;
}

interface VoterNameGroupProps {
  label: string;
  names: string[];
}

function VoterNameGroup({ label, names }: VoterNameGroupProps) {
  if (names.length === 0) {
    return null;
  }
  const visible = names.slice(0, MAX_VISIBLE_NAMES);
  const overflow = names.length - MAX_VISIBLE_NAMES;
  return (
    <span className="font-mono text-xs">
      <span className="font-medium">{label}</span> {visible.join(", ")}
      {overflow > 0 && (
        <>
          {", "}
          <span>{COPY.overflowLabel(overflow)}</span>
        </>
      )}
    </span>
  );
}

interface PlannerByNameInsetProps {
  voterNames: ActivityProposalVoterNames;
}

function PlannerByNameInset({ voterNames }: PlannerByNameInsetProps) {
  const yes = voterNames.yes;
  const maybe = voterNames.maybe;
  const no = voterNames.no;
  return (
    <div className="mt-1 rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-900">
      <p className="mb-1 font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
        {COPY.byNameSubheader}
      </p>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        <VoterNameGroup label="Y" names={yes} />
        <VoterNameGroup label="M" names={maybe} />
        <VoterNameGroup label="N" names={no} />
      </div>
    </div>
  );
}

export function ActivitiesTripPageView({
  isError,
  isLoading,
  onVote,
  proposals,
  role,
}: ActivitiesTripPageViewProps) {
  const isPlanner = role === TripRole.Planner;

  return (
    <div className="flex flex-col gap-4 p-4">
      {isLoading && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {COPY.loadingText}
        </p>
      )}
      {!isLoading && isError && (
        <p className="text-sm text-red-500 dark:text-red-400">
          {COPY.errorText}
        </p>
      )}
      {!isLoading && !isError && proposals.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {COPY.emptyText}
        </p>
      )}
      {!isLoading && !isError && proposals.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {COPY.heading}
          </h2>
          <ul
            data-testid="activities-trip-list"
            className="flex flex-col gap-3"
          >
            {proposals.map((proposal) => (
              <li
                key={proposal.proposalId}
                className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{proposal.name}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {COPY.proposedByPrefix} {proposal.proposerName}
                  </span>
                  {proposal.description !== undefined && (
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {proposal.description}
                    </p>
                  )}
                  {proposal.timeHint !== undefined && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {COPY.timeHintPrefix} {proposal.timeHint}
                    </span>
                  )}
                </div>
                <VoteRow
                  value={proposal.userVote}
                  counts={proposal.counts}
                  hideButtons={isPlanner}
                  onChange={(vote) => {
                    onVote(proposal.proposalId, vote);
                  }}
                />
                {isPlanner && proposal.voterNames !== undefined && (
                  <PlannerByNameInset voterNames={proposal.voterNames} />
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
