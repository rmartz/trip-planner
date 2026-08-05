"use client";

import { useState } from "react";
import { SCREEN_ACTIVITIES_COPY } from "./ScreenActivities.copy";
import { TimeOfDaySlot } from "@/lib/types/activity";
import type { Activity } from "@/lib/types/activity";

type OpenMenu = "main" | "slot-picker" | undefined;

const SLOT_OPTIONS: TimeOfDaySlot[] = [
  TimeOfDaySlot.EarlyMorning,
  TimeOfDaySlot.Morning,
  TimeOfDaySlot.Afternoon,
  TimeOfDaySlot.Evening,
  TimeOfDaySlot.LateEvening,
];

export interface ActivityCardViewProps {
  activity: Activity;
  canPin: boolean;
  onPin: (activityId: string) => void;
  onPinToSlot: (activityId: string, slot: TimeOfDaySlot) => void;
  onUnpin: (activityId: string) => void;
}

export function ActivityCardView({
  activity,
  canPin,
  onPin,
  onPinToSlot,
  onUnpin,
}: ActivityCardViewProps) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(undefined);

  const displayName = activity.pinned
    ? `${SCREEN_ACTIVITIES_COPY.pinnedPrefix}${activity.name}`
    : activity.name;

  return (
    <li className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium">{displayName}</span>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {SCREEN_ACTIVITIES_COPY.votesFormat(0, 0, 0)}
          </span>
          {canPin && (
            <div className="relative">
              <button
                type="button"
                aria-label={SCREEN_ACTIVITIES_COPY.activityMenuLabel(
                  activity.name,
                )}
                className="rounded p-0.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                onClick={() => {
                  setOpenMenu(openMenu === "main" ? undefined : "main");
                }}
              >
                ⋯
              </button>
              {openMenu === "main" && (
                <ul className="absolute right-0 z-10 mt-1 min-w-max rounded-md border border-zinc-200 bg-white py-1 shadow-md dark:border-zinc-700 dark:bg-zinc-900">
                  {activity.pinned ? (
                    <>
                      <li>
                        <button
                          type="button"
                          className="w-full px-3 py-1.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          onClick={() => {
                            setOpenMenu("slot-picker");
                          }}
                        >
                          {SCREEN_ACTIVITIES_COPY.changeSlotOption}
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="w-full px-3 py-1.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          onClick={() => {
                            setOpenMenu(undefined);
                            onUnpin(activity.activityId);
                          }}
                        >
                          {SCREEN_ACTIVITIES_COPY.unpinOption}
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <button
                          type="button"
                          className="w-full px-3 py-1.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          onClick={() => {
                            setOpenMenu(undefined);
                            onPin(activity.activityId);
                          }}
                        >
                          {SCREEN_ACTIVITIES_COPY.pinOption}
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="w-full px-3 py-1.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          onClick={() => {
                            setOpenMenu("slot-picker");
                          }}
                        >
                          {SCREEN_ACTIVITIES_COPY.pinToSlotOption}
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              )}
              {openMenu === "slot-picker" && (
                <ul className="absolute right-0 z-10 mt-1 min-w-max rounded-md border border-zinc-200 bg-white py-1 shadow-md dark:border-zinc-700 dark:bg-zinc-900">
                  {SLOT_OPTIONS.map((slot) => (
                    <li key={slot}>
                      <button
                        type="button"
                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        onClick={() => {
                          setOpenMenu(undefined);
                          onPinToSlot(activity.activityId, slot);
                        }}
                      >
                        {SCREEN_ACTIVITIES_COPY.slotLabel(slot)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
