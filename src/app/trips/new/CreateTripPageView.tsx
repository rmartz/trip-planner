"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CREATE_TRIP_PAGE_COPY } from "./copy";

export interface CreateTripPageViewProps {
  onSubmit: (input: { name: string; startDate: Date; endDate: Date }) => void;
  isSubmitting: boolean;
}

export function CreateTripPageView({
  onSubmit,
  isSubmitting,
}: CreateTripPageViewProps) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const [dateError, setDateError] = useState<string | undefined>();

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setNameError(undefined);
    setDateError(undefined);

    let valid = true;
    if (!name.trim()) {
      setNameError(CREATE_TRIP_PAGE_COPY.errorNameRequired);
      valid = false;
    }
    if (!startDate) {
      setDateError(CREATE_TRIP_PAGE_COPY.errorStartDateRequired);
      valid = false;
    } else if (!endDate) {
      setDateError(CREATE_TRIP_PAGE_COPY.errorEndDateRequired);
      valid = false;
    } else if (
      new Date(`${endDate}T00:00:00`) < new Date(`${startDate}T00:00:00`)
    ) {
      setDateError(CREATE_TRIP_PAGE_COPY.errorEndBeforeStart);
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md p-6">
      <h1 className="text-2xl font-bold">{CREATE_TRIP_PAGE_COPY.heading}</h1>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{CREATE_TRIP_PAGE_COPY.nameLabel}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          placeholder={CREATE_TRIP_PAGE_COPY.namePlaceholder}
        />
        {nameError && <p className="text-sm text-destructive">{nameError}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="startDate">
          {CREATE_TRIP_PAGE_COPY.startDateLabel}
        </Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="endDate">{CREATE_TRIP_PAGE_COPY.endDateLabel}</Label>
        <Input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
          }}
        />
        {dateError && <p className="text-sm text-destructive">{dateError}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {CREATE_TRIP_PAGE_COPY.submitButton}
      </Button>
    </form>
  );
}
