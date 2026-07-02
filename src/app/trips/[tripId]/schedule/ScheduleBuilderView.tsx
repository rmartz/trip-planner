"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { TimeOfDaySlot } from "@/lib/types/activity";
import { SCHEDULE_BUILDER_COPY as COPY } from "./ScheduleBuilderView.copy";

export interface ProposedActivityItem {
  activityId: string;
  name: string;
  pinned: boolean;
  timeOfDaySlot?: TimeOfDaySlot;
  order: number;
}

export interface ScheduleBuilderViewProps {
  stopName: string;
  activities: ProposedActivityItem[];
  onReorder: (orderedIds: string[]) => void;
  onPublish: () => void;
}

interface PinnedActivityRowProps {
  activity: ProposedActivityItem;
}

function PinnedActivityRow({ activity }: PinnedActivityRowProps) {
  return (
    <li
      data-testid="pinned-activity-item"
      className="flex items-center gap-3 rounded-lg border border-zinc-900 p-3 dark:border-zinc-100"
    >
      <span className="flex-1 text-sm font-medium">{activity.name}</span>
      {activity.timeOfDaySlot !== undefined && (
        <span className="shrink-0 text-xs text-muted-foreground">
          {COPY.slotLabel(activity.timeOfDaySlot)}
        </span>
      )}
    </li>
  );
}

interface ProposedActivityRowProps {
  activity: ProposedActivityItem;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function ProposedActivityRow({
  activity,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: ProposedActivityRowProps) {
  return (
    <li
      data-testid="proposed-activity-item"
      className="flex items-center gap-3 rounded-lg border bg-card p-3"
    >
      <div className="flex flex-col gap-0.5">
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          aria-label={COPY.moveUpLabel(activity.name)}
          disabled={isFirst}
          onClick={onMoveUp}
        >
          ▲
        </Button>
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          aria-label={COPY.moveDownLabel(activity.name)}
          disabled={isLast}
          onClick={onMoveDown}
        >
          ▼
        </Button>
      </div>
      <span className="flex-1 text-sm font-medium">{activity.name}</span>
      {activity.timeOfDaySlot !== undefined && (
        <span className="shrink-0 text-xs text-muted-foreground">
          {COPY.slotLabel(activity.timeOfDaySlot)}
        </span>
      )}
    </li>
  );
}

export function ScheduleBuilderView({
  stopName,
  activities,
  onReorder,
  onPublish,
}: ScheduleBuilderViewProps) {
  const pinnedActivities = [...activities.filter((a) => a.pinned)].sort(
    (a, b) => a.order - b.order,
  );
  const unpinnedById = new Map(
    activities.filter((a) => !a.pinned).map((a) => [a.activityId, a]),
  );

  // Track ordering by stable activity IDs only; the full objects are
  // re-derived from the current `activities` prop at render time so field
  // updates (name, timeOfDaySlot, …) are always reflected even when the local
  // reorder is preserved across re-renders with the same ID set.
  const [unpinnedOrderIds, setUnpinnedOrderIds] = useState(() =>
    [...activities.filter((a) => !a.pinned)]
      .sort((a, b) => a.order - b.order)
      .map((a) => a.activityId),
  );

  const unpinnedIdsRef = useRef(new Set(unpinnedById.keys()));

  useEffect(() => {
    const newIds = new Set(
      activities.filter((a) => !a.pinned).map((a) => a.activityId),
    );
    const prev = unpinnedIdsRef.current;
    const setsMatch =
      newIds.size === prev.size && [...newIds].every((id) => prev.has(id));
    if (!setsMatch) {
      unpinnedIdsRef.current = newIds;
      setUnpinnedOrderIds(
        [...activities.filter((a) => !a.pinned)]
          .sort((a, b) => a.order - b.order)
          .map((a) => a.activityId),
      );
    }
  }, [activities]);

  const unpinnedActivities = unpinnedOrderIds
    .map((id) => unpinnedById.get(id))
    .filter((a): a is ProposedActivityItem => a !== undefined);

  function moveActivity(fromIndex: number, toIndex: number) {
    if (
      fromIndex < 0 ||
      fromIndex >= unpinnedOrderIds.length ||
      toIndex < 0 ||
      toIndex >= unpinnedOrderIds.length
    ) {
      return;
    }
    const next = [...unpinnedOrderIds];
    next.splice(toIndex, 0, ...next.splice(fromIndex, 1));
    setUnpinnedOrderIds(next);
    onReorder(next);
  }

  const isEmpty =
    pinnedActivities.length === 0 && unpinnedActivities.length === 0;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-col gap-0.5 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{COPY.heading}</h1>
          <span className="rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {COPY.draftBadge}
          </span>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {COPY.headingSubtext}
        </p>
        <p className="text-sm font-medium">{stopName}</p>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-4">
        {isEmpty ? (
          <p className="text-sm text-muted-foreground">{COPY.emptyProposals}</p>
        ) : (
          <>
            {pinnedActivities.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {COPY.pinnedSectionHeading}
                </h2>
                <ol className="flex flex-col gap-2">
                  {pinnedActivities.map((activity) => (
                    <PinnedActivityRow
                      key={activity.activityId}
                      activity={activity}
                    />
                  ))}
                </ol>
              </section>
            )}

            {unpinnedActivities.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {COPY.proposedSectionHeading}
                </h2>
                <ol className="flex flex-col gap-2">
                  {unpinnedActivities.map((activity, index) => (
                    <ProposedActivityRow
                      key={activity.activityId}
                      activity={activity}
                      isFirst={index === 0}
                      isLast={index === unpinnedActivities.length - 1}
                      onMoveUp={() => {
                        moveActivity(index, index - 1);
                      }}
                      onMoveDown={() => {
                        moveActivity(index, index + 1);
                      }}
                    />
                  ))}
                </ol>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="border-t p-4">
        <Button
          type="button"
          className="w-full"
          disabled={isEmpty}
          onClick={onPublish}
        >
          {COPY.publishButton}
        </Button>
      </footer>
    </div>
  );
}
