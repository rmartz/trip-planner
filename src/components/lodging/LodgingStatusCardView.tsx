"use client";

import { useEffect, useState } from "react";
import { LodgingStatus } from "@/lib/types/lodging";
import type { Stop } from "@/lib/types/trip";
import { LODGING_STATUS_CARD_COPY } from "./LodgingStatusCardView.copy";

const STATUS_LABELS: Record<LodgingStatus, string> = {
  [LodgingStatus.NeedLodging]: LODGING_STATUS_CARD_COPY.needLodgingLabel,
  [LodgingStatus.SecuredPrivate]: LODGING_STATUS_CARD_COPY.securedPrivateLabel,
  [LodgingStatus.SecuredCapacity]:
    LODGING_STATUS_CARD_COPY.securedCapacityLabel,
  [LodgingStatus.SharingWith]: LODGING_STATUS_CARD_COPY.sharingWithLabel,
};

const RADIO_OPTIONS: LodgingStatus[] = [
  LodgingStatus.NeedLodging,
  LodgingStatus.SecuredPrivate,
  LodgingStatus.SharingWith,
  LodgingStatus.SecuredCapacity,
];

export interface LodgingStatusCardViewProps {
  stop: Stop;
  currentStatus: LodgingStatus | undefined;
  onStatusChange: (status: LodgingStatus) => void;
}

export function LodgingStatusCardView({
  stop,
  currentStatus,
  onStatusChange,
}: LodgingStatusCardViewProps) {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentStatus !== undefined) {
      setIsEditing(false);
    }
  }, [currentStatus]);

  const showRadios = currentStatus === undefined || isEditing;

  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h3 className="mb-3 font-medium">{stop.name}</h3>
      {showRadios ? (
        <fieldset>
          <legend className="sr-only">Lodging status for {stop.name}</legend>
          {RADIO_OPTIONS.map((status) => (
            <label
              key={status}
              className="flex cursor-pointer items-center gap-3 py-2"
            >
              <input
                type="radio"
                name={`lodging-${stop.stopId}`}
                value={status}
                checked={currentStatus === status}
                onChange={() => {
                  onStatusChange(status);
                  setIsEditing(false);
                }}
                className="h-5 w-5 rounded-full border-zinc-300 text-zinc-900"
              />
              {STATUS_LABELS[status]}
            </label>
          ))}
        </fieldset>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {LODGING_STATUS_CARD_COPY.statusPrefix}
          </span>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium dark:bg-zinc-800">
            {STATUS_LABELS[currentStatus]}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
            }}
            className="ml-auto text-xs text-zinc-400 underline hover:text-zinc-600"
          >
            {LODGING_STATUS_CARD_COPY.tapToEditLabel}
          </button>
        </div>
      )}
    </div>
  );
}
