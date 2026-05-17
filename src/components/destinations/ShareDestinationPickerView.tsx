"use client";

import { Button } from "@/components/ui/button";
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
            <Button
              key={planner.uid}
              type="button"
              variant="outline"
              className="w-full justify-start whitespace-normal"
              onClick={() => {
                onSelectPlanner(planner);
              }}
              disabled={isSubmitting}
            >
              {planner.displayName}
            </Button>
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-500">
          {SHARE_DESTINATION_PICKER_COPY.errorText}
        </p>
      )}

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {SHARE_DESTINATION_PICKER_COPY.cancelButton}
        </Button>
      </div>
    </div>
  );
}
