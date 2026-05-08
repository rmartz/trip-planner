"use client";

import { Button } from "@/components/ui/button";
import { TripRole } from "@/lib/types/trip";
import { RSVP_PAGE_COPY } from "./RsvpPageView.copy";

const COPY = RSVP_PAGE_COPY;

export enum RsvpStatus {
  Confirmed = "confirmed",
  Declined = "declined",
  Pending = "pending",
}

export interface RsvpScheduledActivity {
  activityId: string;
  name: string;
  status: RsvpStatus;
  timeSlot: string;
}

export interface RsvpPageViewProps {
  activities: RsvpScheduledActivity[];
  isError: boolean;
  isLoading: boolean;
  onConfirm: (activityId: string) => void;
  onDecline: (activityId: string) => void;
  viewerRole: TripRole;
}

interface RsvpRowProps {
  activity: RsvpScheduledActivity;
  onConfirm: (activityId: string) => void;
  onDecline: (activityId: string) => void;
}

function statusLabel(status: RsvpStatus): string {
  if (status === RsvpStatus.Confirmed) return COPY.statusConfirmed;
  if (status === RsvpStatus.Declined) return COPY.statusDeclined;
  return COPY.statusPending;
}

function RsvpRow({ activity, onConfirm, onDecline }: RsvpRowProps) {
  return (
    <li
      data-testid="rsvp-row"
      className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{activity.name}</span>
        <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
          {activity.timeSlot}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {statusLabel(activity.status)}
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={
            activity.status === RsvpStatus.Confirmed ? "default" : "outline"
          }
          onClick={() => {
            onConfirm(activity.activityId);
          }}
        >
          {COPY.confirmButton}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={
            activity.status === RsvpStatus.Declined ? "default" : "outline"
          }
          onClick={() => {
            onDecline(activity.activityId);
          }}
        >
          {COPY.declineButton}
        </Button>
      </div>
    </li>
  );
}

export function RsvpPageView({
  activities,
  isError,
  isLoading,
  onConfirm,
  onDecline,
  viewerRole,
}: RsvpPageViewProps) {
  const isPlanner = viewerRole === TripRole.Planner;
  const showList =
    !isLoading && !isError && !isPlanner && activities.length > 0;
  const showEmpty =
    !isLoading && !isError && !isPlanner && activities.length === 0;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-col gap-0.5 border-b px-4 py-3">
        <h1 className="text-lg font-semibold">{COPY.heading}</h1>
        <p className="font-mono text-xs text-muted-foreground">
          {COPY.headingSubtext}
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4">
        {isLoading && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {COPY.loadingText}
          </p>
        )}
        {!isLoading && isError && (
          <p className="text-sm text-red-500 dark:text-red-400">
            {COPY.errorText}
          </p>
        )}
        {!isLoading && !isError && isPlanner && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {COPY.plannerNoticeText}
          </p>
        )}
        {showEmpty && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {COPY.emptyText}
          </p>
        )}
        {showList && (
          <ul data-testid="rsvp-list" className="flex flex-col gap-3">
            {activities.map((activity) => (
              <RsvpRow
                key={activity.activityId}
                activity={activity}
                onConfirm={onConfirm}
                onDecline={onDecline}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
