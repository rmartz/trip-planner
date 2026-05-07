"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Stop } from "@/lib/types/trip";
import { LEG_FORM_COPY } from "./copy";

export interface LegFormViewProps {
  stops: Stop[];
  onSubmit: (input: { fromStopId: string; toStopId: string }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function LegFormView({
  stops,
  onSubmit,
  onCancel,
  isSubmitting,
}: LegFormViewProps) {
  const [fromStopId, setFromStopId] = useState("");
  const [toStopId, setToStopId] = useState("");
  const [fromError, setFromError] = useState<string | undefined>();
  const [toError, setToError] = useState<string | undefined>();

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setFromError(undefined);
    setToError(undefined);

    let valid = true;
    if (!fromStopId) {
      setFromError(LEG_FORM_COPY.errorFromStopRequired);
      valid = false;
    }
    if (!toStopId) {
      setToError(LEG_FORM_COPY.errorToStopRequired);
      valid = false;
    } else if (fromStopId && fromStopId === toStopId) {
      setToError(LEG_FORM_COPY.errorSameStop);
      valid = false;
    }
    if (!valid) return;

    onSubmit({ fromStopId, toStopId });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 p-4 border rounded-lg"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="leg-from-stop">{LEG_FORM_COPY.fromStopLabel}</Label>
        <select
          id="leg-from-stop"
          value={fromStopId}
          onChange={(e) => {
            setFromStopId(e.target.value);
          }}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="" />
          {stops.map((stop) => (
            <option key={stop.stopId} value={stop.stopId}>
              {stop.name}
            </option>
          ))}
        </select>
        {fromError && <p className="text-sm text-destructive">{fromError}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="leg-to-stop">{LEG_FORM_COPY.toStopLabel}</Label>
        <select
          id="leg-to-stop"
          value={toStopId}
          onChange={(e) => {
            setToStopId(e.target.value);
          }}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="" />
          {stops.map((stop) => (
            <option key={stop.stopId} value={stop.stopId}>
              {stop.name}
            </option>
          ))}
        </select>
        {toError && <p className="text-sm text-destructive">{toError}</p>}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {LEG_FORM_COPY.submitAddLeg}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {LEG_FORM_COPY.cancelEdit}
        </Button>
      </div>
    </form>
  );
}
