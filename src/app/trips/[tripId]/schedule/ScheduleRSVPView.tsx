"use client";

import { SCHEDULE_RSVP_COPY } from "./ScheduleRSVPView.copy";

const COPY = SCHEDULE_RSVP_COPY;

export enum ScheduleRSVPStatus {
  Confirmed = "confirmed",
  Skipped = "skipped",
}

export interface ScheduleRSVPActivity {
  activityId: string;
  name: string;
  timeLabel: string;
  rsvp?: ScheduleRSVPStatus;
}

export interface ScheduleRSVPViewProps {
  activities: ScheduleRSVPActivity[];
  onRsvp: (activityId: string, status: ScheduleRSVPStatus) => void;
}

interface ActivityRSVPCardProps {
  activity: ScheduleRSVPActivity;
  onRsvp: (activityId: string, status: ScheduleRSVPStatus) => void;
}

function ActivityRSVPCard({ activity, onRsvp }: ActivityRSVPCardProps) {
  const isConfirmed = activity.rsvp === ScheduleRSVPStatus.Confirmed;
  const isSkipped = activity.rsvp === ScheduleRSVPStatus.Skipped;

  return (
    <li
      data-testid="rsvp-activity-card"
      className="flex flex-col gap-2 rounded-lg border bg-card p-3"
    >
      <span className="font-mono text-xs text-muted-foreground">
        {activity.timeLabel}
      </span>
      <span className="text-sm font-semibold">{activity.name}</span>
      <div className="flex gap-2">
        <button
          type="button"
          aria-pressed={isConfirmed}
          data-active={isConfirmed ? "true" : undefined}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium ${
            isConfirmed
              ? "bg-primary text-primary-foreground"
              : "border border-input bg-background text-foreground"
          }`}
          onClick={() => {
            onRsvp(activity.activityId, ScheduleRSVPStatus.Confirmed);
          }}
        >
          {COPY.confirmButton}
        </button>
        <button
          type="button"
          aria-pressed={isSkipped}
          data-active={isSkipped ? "true" : undefined}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium ${
            isSkipped
              ? "bg-primary text-primary-foreground"
              : "border border-input bg-background text-foreground"
          }`}
          onClick={() => {
            onRsvp(activity.activityId, ScheduleRSVPStatus.Skipped);
          }}
        >
          {COPY.skipButton}
        </button>
      </div>
    </li>
  );
}

export function ScheduleRSVPView({
  activities,
  onRsvp,
}: ScheduleRSVPViewProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-col gap-0.5 border-b px-4 py-3">
        <h1 className="text-lg font-semibold">{COPY.heading}</h1>
        <p className="font-mono text-xs text-muted-foreground">
          {COPY.publishedSubline}
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4">
        {activities.length === 0 ? (
          <p className="font-mono text-sm text-muted-foreground">
            {COPY.emptyState}
          </p>
        ) : (
          <ol className="flex flex-col gap-3">
            {activities.map((activity) => (
              <ActivityRSVPCard
                key={activity.activityId}
                activity={activity}
                onRsvp={onRsvp}
              />
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}
