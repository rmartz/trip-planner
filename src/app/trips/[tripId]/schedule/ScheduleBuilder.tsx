"use client";

import { useState } from "react";
import {
  PublishScheduleForbiddenError,
  usePublishSchedule,
} from "@/hooks/use-publish-schedule";
import { useActivities } from "@/hooks/use-activities";
import type { Activity } from "@/lib/types/activity";
import { ScheduleBuilderView } from "./ScheduleBuilderView";
import type { ProposedActivityItem } from "./ScheduleBuilderView";
import { SCHEDULE_BUILDER_COPY } from "./ScheduleBuilderView.copy";

export function toProposedActivityItems(
  activities: Activity[],
): ProposedActivityItem[] {
  return activities.map((activity, index) => ({
    activityId: activity.activityId,
    name: activity.name,
    pinned: activity.pinned ?? false,
    timeOfDaySlot: activity.pinnedSlot ?? activity.timeOfDaySlot?.slots[0],
    order: index,
  }));
}

export interface ScheduleBuilderProps {
  tripId: string;
  stopId: string;
  stopName: string;
}

export function ScheduleBuilder({
  tripId,
  stopId,
  stopName,
}: ScheduleBuilderProps) {
  const { data: activities } = useActivities(tripId);
  const publish = usePublishSchedule(tripId, stopId);
  const [errorMessage, setErrorMessage] = useState<string>();

  const stopActivities = toProposedActivityItems(
    (activities ?? []).filter((activity) => activity.stopId === stopId),
  );

  function handlePublish(orderedActivityIds: string[]) {
    setErrorMessage(undefined);
    publish.mutate(orderedActivityIds, {
      onError: (error) => {
        setErrorMessage(
          error instanceof PublishScheduleForbiddenError
            ? SCHEDULE_BUILDER_COPY.forbiddenError
            : SCHEDULE_BUILDER_COPY.genericError,
        );
      },
    });
  }

  return (
    <ScheduleBuilderView
      stopName={stopName}
      activities={stopActivities}
      onReorder={() => undefined}
      onPublish={handlePublish}
      isPublishing={publish.isPending}
      isPublished={publish.isSuccess}
      errorMessage={errorMessage}
    />
  );
}
