"use client";

import { Button } from "@/components/ui/button";
import { VoteRow } from "@/components/ui/VoteRow";
import type { VoteCounts } from "@/components/ui/VoteRow";
import { SCREEN_ACTIVITIES_COPY } from "./ScreenActivities.copy";
import { ActivityCardView } from "./ActivityCardView";
import type { Activity, TimeOfDaySlot } from "@/lib/types/activity";
import type { InterestVote } from "@/lib/types/interest-vote";
import { TripRole } from "@/lib/types/trip";

export interface ActivityVoteEntry {
  counts: VoteCounts;
  userVote: InterestVote | undefined;
}

interface ScreenActivitiesBaseProps {
  activities: Activity[];
  activityVotes: Record<string, ActivityVoteEntry>;
  canPropose: boolean;
  onPropose: () => void;
  onVote: (activityId: string, vote: InterestVote) => void;
  role: TripRole;
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
  ScreenActivitiesWithPinProps | ScreenActivitiesWithoutPinProps;

export function ScreenActivitiesView(props: ScreenActivitiesViewProps) {
  const {
    activities,
    activityVotes,
    canPropose,
    canPin,
    onPropose,
    onVote,
    role,
  } = props;
  const isGuest = role === TripRole.Guest;

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
          {activities.map((activity) => {
            if (canPin) {
              return (
                <ActivityCardView
                  key={activity.activityId}
                  activity={activity}
                  canPin={true}
                  onPin={props.onPin}
                  onPinToSlot={props.onPinToSlot}
                  onUnpin={props.onUnpin}
                />
              );
            }
            const voteEntry = activityVotes[activity.activityId];
            return (
              <li
                key={activity.activityId}
                className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <span className="font-medium">
                  {activity.pinned
                    ? `${SCREEN_ACTIVITIES_COPY.pinnedPrefix}${activity.name}`
                    : activity.name}
                </span>
                {isGuest && voteEntry !== undefined && (
                  <VoteRow
                    value={voteEntry.userVote}
                    counts={voteEntry.counts}
                    onChange={(vote) => {
                      onVote(activity.activityId, vote);
                    }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
