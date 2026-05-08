"use client";

import { CLAIM_PAGE_COPY } from "./ClaimPageView.copy";

export interface ClaimContext {
  memberName: string;
  tripName: string;
  plannerName: string;
  dateRange: string;
}

export interface ClaimPageViewProps {
  claimContext: ClaimContext | undefined;
  onClaim: () => void;
  onNotMe: () => void;
}

export function ClaimPageView({
  claimContext,
  onClaim,
  onNotMe,
}: ClaimPageViewProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      {!claimContext ? (
        <>
          <h1 className="text-2xl font-bold">
            {CLAIM_PAGE_COPY.invalidTokenHeading}
          </h1>
          <p className="max-w-sm text-zinc-500 dark:text-zinc-400">
            {CLAIM_PAGE_COPY.invalidTokenDescription}
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {CLAIM_PAGE_COPY.addedAsLabel}
          </p>
          <p className="text-3xl font-bold">
            &quot;{claimContext.memberName}&quot;
          </p>
          <p className="max-w-sm text-zinc-600 dark:text-zinc-400">
            {CLAIM_PAGE_COPY.contextPrefix} {claimContext.tripName} (
            {claimContext.dateRange}). {claimContext.plannerName}{" "}
            {CLAIM_PAGE_COPY.contextMiddle}
          </p>

          <div className="w-full max-w-sm rounded-lg border border-zinc-200 p-4 text-left dark:border-zinc-800">
            <p className="mb-2 text-sm font-semibold">
              {CLAIM_PAGE_COPY.inheritHeading}
            </p>
            <ul className="list-inside list-disc text-sm text-zinc-500 dark:text-zinc-400">
              <li>Lodging status</li>
              <li>Votes cast</li>
              <li>Expenses owed</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <button
              className="rounded-md bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              onClick={onClaim}
            >
              {CLAIM_PAGE_COPY.claimButton}
            </button>
            <button
              className="rounded-md border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              onClick={onNotMe}
            >
              {CLAIM_PAGE_COPY.notMeButton}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
