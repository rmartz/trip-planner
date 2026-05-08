"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { SchedulePageView } from "./SchedulePageView";
import type { ScheduleDay } from "./SchedulePageView";
import { SCHEDULE_PAGE_COPY } from "./SchedulePageView.copy";

const STUB_DAYS: ScheduleDay[] = [
  {
    dayKey: "day-1",
    label: "Day 1",
    activities: [
      {
        activityId: "stub-1-1",
        name: "Welcome breakfast",
        timeSlot: "09:00",
        order: 0,
      },
      {
        activityId: "stub-1-2",
        name: "Walking tour",
        timeSlot: "11:00",
        order: 1,
      },
    ],
  },
  {
    dayKey: "day-2",
    label: "Day 2",
    activities: [
      {
        activityId: "stub-2-1",
        name: "Museum visit",
        timeSlot: "10:00",
        order: 0,
      },
    ],
  },
];

export default function SchedulePage() {
  const router = useRouter();

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: SCHEDULE_PAGE_COPY.pageTitle,
        onBack: () => {
          router.back();
        },
      }}
    >
      <SchedulePageView days={STUB_DAYS} />
    </AppShell>
  );
}
