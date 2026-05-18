"use client";

import { cn } from "@/lib/utils";
import { InterestVote } from "@/lib/types/interest-vote";
import { VOTE_ROW_COPY } from "./VoteRow.copy";

export interface VoteCounts {
  yes: number;
  maybe: number;
  no: number;
}

interface VoteRowReadOnlyProps {
  value: InterestVote | undefined;
  counts: VoteCounts;
  hideButtons: true;
  onChange?: undefined;
}

interface VoteRowInteractiveProps {
  value: InterestVote | undefined;
  counts: VoteCounts;
  hideButtons?: false;
  onChange: (vote: InterestVote) => void;
}

export type VoteRowProps = VoteRowReadOnlyProps | VoteRowInteractiveProps;

interface VoteButtonProps {
  label: string;
  vote: InterestVote;
  selected: boolean;
  onSelect: (vote: InterestVote) => void;
}

function VoteButton({ label, vote, selected, onSelect }: VoteButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => {
        onSelect(vote);
      }}
      className={cn(
        "rounded-full border px-3 py-0.5 text-xs font-medium transition-colors",
        selected
          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
          : "border-zinc-300 bg-background text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800",
      )}
    >
      {label}
    </button>
  );
}

export function VoteRow(props: VoteRowProps) {
  const { counts, value } = props;
  return (
    <div className="flex flex-col gap-1">
      <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
        {VOTE_ROW_COPY.aggregateCounts(counts.yes, counts.maybe, counts.no)}
      </p>
      {!props.hideButtons && (
        <div className="flex gap-2">
          <VoteButton
            label={VOTE_ROW_COPY.yesLabel}
            vote={InterestVote.Yes}
            selected={value === InterestVote.Yes}
            onSelect={props.onChange}
          />
          <VoteButton
            label={VOTE_ROW_COPY.maybeLabel}
            vote={InterestVote.Maybe}
            selected={value === InterestVote.Maybe}
            onSelect={props.onChange}
          />
          <VoteButton
            label={VOTE_ROW_COPY.noLabel}
            vote={InterestVote.No}
            selected={value === InterestVote.No}
            onSelect={props.onChange}
          />
        </div>
      )}
    </div>
  );
}
