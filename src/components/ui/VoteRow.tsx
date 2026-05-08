"use client";

import { cn } from "@/lib/utils";
import { InterestVote } from "@/lib/types/interest-vote";
import { VOTE_ROW_COPY } from "./VoteRow.copy";

interface VoteCounts {
  yes: number;
  maybe: number;
  no: number;
}

export interface VoteRowProps {
  value: InterestVote | undefined;
  counts: VoteCounts;
  onChange: (vote: InterestVote) => void;
}

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

export function VoteRow({ value, counts, onChange }: VoteRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
        {VOTE_ROW_COPY.aggregateCounts(counts.yes, counts.maybe, counts.no)}
      </p>
      <div className="flex gap-2">
        <VoteButton
          label={VOTE_ROW_COPY.yesLabel}
          vote={InterestVote.Yes}
          selected={value === InterestVote.Yes}
          onSelect={onChange}
        />
        <VoteButton
          label={VOTE_ROW_COPY.maybeLabel}
          vote={InterestVote.Maybe}
          selected={value === InterestVote.Maybe}
          onSelect={onChange}
        />
        <VoteButton
          label={VOTE_ROW_COPY.noLabel}
          vote={InterestVote.No}
          selected={value === InterestVote.No}
          onSelect={onChange}
        />
      </div>
    </div>
  );
}
