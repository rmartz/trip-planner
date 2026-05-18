"use client";

import { Button } from "@/components/ui/button";
import { SCREEN_ACTIVITIES_COPY } from "./ScreenActivities.copy";
import { ActivityCardView } from "./ActivityCardView";
import type { Activity, TimeOfDaySlot } from "@/lib/types/activity";

interface ScreenActivitiesBaseProps {
  activities: Activity[];
  canPropose: boolean;
  onPropose: () => void;
}

interface ScreenActivitiesWithPinProps extends ScreenActivitiesBaseProps {
  canPin: true;
  onPin: (activityId: string) => void;
  onPinToSlot: (activityId: string, slot: TimeOfDaySlot) => void;
  onUnpin: (activityId: string) => void;
}

interface ScreenActivitiesWithoutPinProps extends ScreenActivitiesBaseProps {
  canPin?: false;
  onPin?: undefined;
  onPinToSlot?: undefined;
  onUnpin?: undefined;
}

export type ScreenActivitiesViewProps =
  | ScreenActivitiesWithPinProps
  | ScreenActivitiesWithoutPinProps;

export function ScreenActivitiesView(props: ScreenActivitiesViewProps) {
  const { activities, canPropose, canPin, onPropose } = props;

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
          {activities.map((activity) =>
            canPin ? (
              <ActivityCardView
                key={activity.activityId}
                activity={activity}
                canPin={true}
                onPin={props.onPin}
                onPinToSlot={props.onPinToSlot}
                onUnpin={props.onUnpin}
              />
            ) : (
              <li
                key={activity.activityId}
                className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium">
                    {activity.pinned
                      ? `${SCREEN_ACTIVITIES_COPY.pinnedPrefix}${activity.name}`
                      : activity.name}
                  </span>
                  <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                    {SCREEN_ACTIVITIES_COPY.votesFormat(0, 0, 0)}
                  </span>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
