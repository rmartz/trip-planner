"use client";

import { SCHEDULE_PAGE_COPY } from "./SchedulePageView.copy";

const COPY = SCHEDULE_PAGE_COPY;

export interface ScheduledActivity {
  activityId: string;
  name: string;
  timeSlot: string;
  order: number;
}

export interface ScheduleDay {
  dayKey: string;
  label: string;
  activities: ScheduledActivity[];
}

export interface SchedulePageViewProps {
  days: ScheduleDay[];
}

interface DaySectionProps {
  day: ScheduleDay;
}

function DaySection({ day }: DaySectionProps) {
  const sorted = [...day.activities].sort((a, b) => a.order - b.order);

  return (
    <section data-testid="schedule-day-section" className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold">{day.label}</h2>
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">{COPY.emptyDayMessage}</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {sorted.map((activity) => (
            <li
              key={activity.activityId}
              data-testid="schedule-activity-block"
              className="flex items-start gap-3 rounded-lg border bg-card p-3"
            >
              <span className="font-mono text-xs text-muted-foreground">
                {COPY.timeSlotLabel(activity.timeSlot)}
              </span>
              <span className="text-sm font-medium">{activity.name}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function SchedulePageView({ days }: SchedulePageViewProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-col gap-0.5 border-b px-4 py-3">
        <h1 className="text-lg font-semibold">{COPY.heading}</h1>
        <p className="font-mono text-xs text-muted-foreground">
          {COPY.headingSubtext}
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-6 p-4">
        {days.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {COPY.emptyScheduleMessage}
          </p>
        ) : (
          days.map((day) => <DaySection key={day.dayKey} day={day} />)
        )}
      </main>
    </div>
  );
}
