"use client";

import { SHARE_DESTINATION_PICKER_COPY } from "./ShareDestinationPickerView.copy";
import type { Destination } from "@/lib/types/destination";

export interface ShareablePlanner {
  uid: string;
  displayName: string;
}

export interface ShareDestinationPickerViewProps {
  destination: Destination;
  planners: ShareablePlanner[];
  isLoading: boolean;
  isSubmitting: boolean;
  isError: boolean;
  onSelectPlanner: (planner: ShareablePlanner) => void;
  onCancel: () => void;
}

export function ShareDestinationPickerView({
  destination,
  planners,
  isLoading,
  isSubmitting,
  isError,
  onSelectPlanner,
  onCancel,
}: ShareDestinationPickerViewProps) {
  return (
    <div className="flex flex-col gap-4 max-w-md p-6">
      <h2 className="text-xl font-bold">
        {SHARE_DESTINATION_PICKER_COPY.heading}
      </h2>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {destination.name}
      </p>

      {isLoading && (
        <p className="text-zinc-500 dark:text-zinc-400">
          {SHARE_DESTINATION_PICKER_COPY.loadingText}
        </p>
      )}

      {!isLoading && planners.length === 0 && (
        <p className="text-zinc-500 dark:text-zinc-400">
          {SHARE_DESTINATION_PICKER_COPY.noPlannersText}
        </p>
      )}

      {!isLoading && planners.length > 0 && (
        <div className="flex flex-col gap-2">
          {planners.map((planner) => (
            <button
              key={planner.uid}
              type="button"
              onClick={() => {
                onSelectPlanner(planner);
              }}
              disabled={isSubmitting}
              className="w-full rounded-md border border-zinc-200 px-4 py-2 text-left text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              {planner.displayName}
            </button>
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-500">
          {SHARE_DESTINATION_PICKER_COPY.errorText}
        </p>
      )}

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {SHARE_DESTINATION_PICKER_COPY.cancelButton}
        </button>
      </div>
    </div>
  );
}
