"use client";

import { VoteRow } from "@/components/ui/VoteRow";
import { InterestVote } from "@/lib/types/interest-vote";
import { ACTIVITIES_TRIP_PAGE_COPY } from "./ActivitiesTripPageView.copy";

export interface ActivityProposalCounts {
  yes: number;
  maybe: number;
  no: number;
}

export interface ActivityProposal {
  proposalId: string;
  name: string;
  description?: string;
  proposerName: string;
  counts: ActivityProposalCounts;
  timeHint?: string;
  userVote: InterestVote | undefined;
}

export interface ActivitiesTripPageViewProps {
  proposals: ActivityProposal[];
  isLoading: boolean;
  isError: boolean;
  onVote: (proposalId: string, vote: InterestVote) => void;
}

export function ActivitiesTripPageView({
  proposals,
  isLoading,
  isError,
  onVote,
}: ActivitiesTripPageViewProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      {isLoading && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {ACTIVITIES_TRIP_PAGE_COPY.loadingText}
        </p>
      )}
      {!isLoading && isError && (
        <p className="text-sm text-red-500 dark:text-red-400">
          {ACTIVITIES_TRIP_PAGE_COPY.errorText}
        </p>
      )}
      {!isLoading && !isError && proposals.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {ACTIVITIES_TRIP_PAGE_COPY.emptyText}
        </p>
      )}
      {!isLoading && !isError && proposals.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {ACTIVITIES_TRIP_PAGE_COPY.heading}
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
                    {ACTIVITIES_TRIP_PAGE_COPY.proposedByPrefix}{" "}
                    {proposal.proposerName}
                  </span>
                  {proposal.description !== undefined && (
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">
                      {proposal.description}
                    </p>
                  )}
                  {proposal.timeHint !== undefined && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {ACTIVITIES_TRIP_PAGE_COPY.timeHintPrefix}{" "}
                      {proposal.timeHint}
                    </span>
                  )}
                </div>
                <VoteRow
                  value={proposal.userVote}
                  counts={proposal.counts}
                  onChange={(vote) => {
                    onVote(proposal.proposalId, vote);
                  }}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
