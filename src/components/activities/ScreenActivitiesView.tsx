"use client";

import { Button } from "@/components/ui/button";
import { SCREEN_ACTIVITIES_COPY } from "./ScreenActivities.copy";
import type { Activity } from "@/lib/types/activity";

export interface ScreenActivitiesViewProps {
  activities: Activity[];
  canPropose: boolean;
  onPropose: () => void;
}

export function ScreenActivitiesView({
  activities,
  canPropose,
  onPropose,
}: ScreenActivitiesViewProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{SCREEN_ACTIVITIES_COPY.heading}</h2>
        {canPropose && (
          <Button type="button" size="sm" onClick={onPropose}>
            {SCREEN_ACTIVITIES_COPY.proposeButton}
          </Button>
        )}
      </div>
      {activities.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {SCREEN_ACTIVITIES_COPY.emptyStateText}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {activities.map((activity) => (
            <li
              key={activity.activityId}
              className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium">{activity.name}</span>
                <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                  {SCREEN_ACTIVITIES_COPY.votesFormat(0, 0, 0)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
