"use client";

import { TransportationStatus } from "@/lib/types/transportation";
import { TRANSPORTATION_STATUS_PICKER_COPY } from "./TransportationStatusPickerView.copy";

const COPY = TRANSPORTATION_STATUS_PICKER_COPY;

const STATUS_ORDER: TransportationStatus[] = [
  TransportationStatus.Driving,
  TransportationStatus.NeedTransportation,
  TransportationStatus.DrivingWithSeats,
  TransportationStatus.FlyingOrOther,
  TransportationStatus.RidingWith,
];

export interface TransportationStatusPickerViewProps {
  legId: string;
  routeName: string;
  departureLabel: string;
  value: TransportationStatus;
  onChange: (status: TransportationStatus) => void;
}

export function TransportationStatusPickerView({
  legId,
  routeName,
  departureLabel,
  value,
  onChange,
}: TransportationStatusPickerViewProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {routeName} · {departureLabel}
      </p>
      <div className="flex flex-col gap-1">
        {STATUS_ORDER.map((status) => {
          const inputId = `transport-${legId}-${status}`;
          return (
            <label
              key={status}
              htmlFor={inputId}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                value === status
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              }`}
            >
              <input
                id={inputId}
                type="radio"
                name={`transport-${legId}`}
                value={status}
                checked={value === status}
                onChange={() => {
                  onChange(status);
                }}
                className="sr-only"
              />
              <span className="text-sm font-medium">
                {COPY.statusLabels[status]}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
