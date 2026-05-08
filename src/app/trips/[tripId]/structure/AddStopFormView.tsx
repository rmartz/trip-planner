"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TRIP_STRUCTURE_COPY } from "./copy";

export interface AddStopFormViewProps {
  onSubmit: (input: { name: string; startDate: Date; endDate: Date }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  initialName?: string;
  initialStartDate?: string;
  initialEndDate?: string;
}

export function AddStopFormView({
  onSubmit,
  onCancel,
  isSubmitting,
  initialName = "",
  initialStartDate = "",
  initialEndDate = "",
}: AddStopFormViewProps) {
  const [name, setName] = useState(initialName);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [nameError, setNameError] = useState<string | undefined>();
  const [dateError, setDateError] = useState<string | undefined>();

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setNameError(undefined);
    setDateError(undefined);

    let valid = true;
    if (!name.trim()) {
      setNameError(TRIP_STRUCTURE_COPY.errorNameRequired);
      valid = false;
    }
    if (!startDate) {
      setDateError(TRIP_STRUCTURE_COPY.errorStartDateRequired);
      valid = false;
    } else if (!endDate) {
      setDateError(TRIP_STRUCTURE_COPY.errorEndDateRequired);
      valid = false;
    } else if (
      new Date(`${endDate}T00:00:00`) < new Date(`${startDate}T00:00:00`)
    ) {
      setDateError(TRIP_STRUCTURE_COPY.errorEndBeforeStart);
      valid = false;
    }
    if (!valid) return;

    onSubmit({
      name: name.trim(),
      startDate: new Date(`${startDate}T00:00:00`),
      endDate: new Date(`${endDate}T00:00:00`),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 p-4 border rounded-lg"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="stop-name">{TRIP_STRUCTURE_COPY.nameLabel}</Label>
        <Input
          id="stop-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          placeholder="City or place name"
        />
        {nameError && <p className="text-sm text-destructive">{nameError}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="stop-start-date">
          {TRIP_STRUCTURE_COPY.startDateLabel}
        </Label>
        <Input
          id="stop-start-date"
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="stop-end-date">
          {TRIP_STRUCTURE_COPY.endDateLabel}
        </Label>
        <Input
          id="stop-end-date"
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
          }}
        />
        {dateError && <p className="text-sm text-destructive">{dateError}</p>}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {TRIP_STRUCTURE_COPY.submitAddStop}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {TRIP_STRUCTURE_COPY.cancelEdit}
        </Button>
      </div>
    </form>
  );
}
