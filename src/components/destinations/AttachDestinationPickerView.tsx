"use client";

import { Button } from "@/components/ui/button";
import { ATTACH_DESTINATION_PICKER_COPY } from "./AttachDestinationPickerView.copy";
import type { Destination } from "@/lib/types/destination";
import type { Stop, Trip } from "@/lib/types/trip";

interface StopRowProps {
  stop: Stop;
  trip: Trip;
  onSelectStop: (trip: Trip, stop: Stop) => void;
}

function StopRow({ stop, trip, onSelectStop }: StopRowProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-auto w-full justify-start whitespace-normal"
      onClick={() => {
        onSelectStop(trip, stop);
      }}
    >
      {stop.name}
    </Button>
  );
}

interface TripSectionProps {
  trip: Trip;
  stops: Stop[];
  onSelectStop: (trip: Trip, stop: Stop) => void;
}

function TripSection({ trip, stops, onSelectStop }: TripSectionProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {trip.name}
      </p>
      {stops.length === 0 ? (
        <p className="text-xs text-zinc-400">
          {ATTACH_DESTINATION_PICKER_COPY.noStopsText}
        </p>
      ) : (
        stops.map((stop) => (
          <StopRow
            key={stop.stopId}
            stop={stop}
            trip={trip}
            onSelectStop={onSelectStop}
          />
        ))
      )}
    </div>
  );
}

export interface AttachDestinationPickerViewProps {
  destination: Destination;
  trips: Trip[];
  stopsForTrip: Record<string, Stop[]>;
  isLoading: boolean;
  isSubmitting: boolean;
  isError: boolean;
  onSelectStop: (trip: Trip, stop: Stop) => void;
  onCancel: () => void;
}

export function AttachDestinationPickerView({
  destination,
  trips,
  stopsForTrip,
  isLoading,
  isSubmitting,
  isError,
  onSelectStop,
  onCancel,
}: AttachDestinationPickerViewProps) {
  return (
    <div className="flex flex-col gap-4 max-w-md p-6">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold">
          {ATTACH_DESTINATION_PICKER_COPY.heading}
        </h2>
      </div>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {destination.name}
      </p>

      {isLoading && (
        <p className="text-zinc-500 dark:text-zinc-400">
          {ATTACH_DESTINATION_PICKER_COPY.loadingText}
        </p>
      )}

      {!isLoading && trips.length === 0 && (
        <p className="text-zinc-500 dark:text-zinc-400">
          {ATTACH_DESTINATION_PICKER_COPY.noTripsText}
        </p>
      )}

      {!isLoading && trips.length > 0 && (
        <div className="flex flex-col gap-4">
          {trips.map((trip) => (
            <TripSection
              key={trip.tripId}
              trip={trip}
              stops={stopsForTrip[trip.tripId] ?? []}
              onSelectStop={onSelectStop}
            />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-500">Failed to attach destination.</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {ATTACH_DESTINATION_PICKER_COPY.cancelButton}
        </Button>
      </div>
    </div>
  );
}
