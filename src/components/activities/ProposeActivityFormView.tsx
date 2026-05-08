"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SCREEN_ACTIVITIES_COPY } from "./ScreenActivities.copy";
import {
  TimeOfDaySlot,
  TimeOfDaySlotType,
  TransportationMode,
} from "@/lib/types/activity";
import type {
  ActivityGroupSize,
  ActivityTimeOfDaySlot,
} from "@/lib/types/activity";

export interface ActivityProposalInput {
  name: string;
  description?: string;
  estimatedDurationMinutes: number;
  timeOfDaySlot?: ActivityTimeOfDaySlot;
  groupSize?: ActivityGroupSize;
  costPerPerson?: number;
  transportationRequired?: TransportationMode;
}

export interface ProposeActivityFormViewProps {
  onSubmit: (input: ActivityProposalInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const TIME_OF_DAY_OPTIONS: { value: TimeOfDaySlot; label: string }[] = [
  { value: TimeOfDaySlot.EarlyMorning, label: "Early Morning" },
  { value: TimeOfDaySlot.Morning, label: "Morning" },
  { value: TimeOfDaySlot.Afternoon, label: "Afternoon" },
  { value: TimeOfDaySlot.Evening, label: "Evening" },
  { value: TimeOfDaySlot.LateEvening, label: "Late Evening" },
];

const TRANSPORT_OPTIONS: {
  value: TransportationMode | "";
  label: string;
}[] = [
  { value: "", label: "None" },
  {
    value: TransportationMode.Walking,
    label: SCREEN_ACTIVITIES_COPY.transportWalking,
  },
  {
    value: TransportationMode.PublicTransit,
    label: SCREEN_ACTIVITIES_COPY.transportPublicTransit,
  },
  {
    value: TransportationMode.Private,
    label: SCREEN_ACTIVITIES_COPY.transportPrivate,
  },
];

export function ProposeActivityFormView({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ProposeActivityFormViewProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [selectedSlots, setSelectedSlots] = useState<TimeOfDaySlot[]>([]);
  const [slotType, setSlotType] = useState<TimeOfDaySlotType>(
    TimeOfDaySlotType.PreferredIn,
  );
  const [groupSizeMin, setGroupSizeMin] = useState("");
  const [groupSizeMax, setGroupSizeMax] = useState("");
  const [costPerPerson, setCostPerPerson] = useState("");
  const [transport, setTransport] = useState<TransportationMode | "">("");
  const [nameError, setNameError] = useState<string | undefined>();
  const [durationError, setDurationError] = useState<string | undefined>();

  function handleSlotToggle(slot: TimeOfDaySlot) {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot],
    );
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setNameError(undefined);
    setDurationError(undefined);

    let hasError = false;

    if (!name.trim()) {
      setNameError(SCREEN_ACTIVITIES_COPY.nameRequired);
      hasError = true;
    }

    const durationNum = durationMinutes !== "" ? Number(durationMinutes) : 0;
    if (durationNum < 1) {
      setDurationError(SCREEN_ACTIVITIES_COPY.durationRequired);
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const timeOfDaySlot =
      selectedSlots.length > 0
        ? { type: slotType, slots: selectedSlots }
        : undefined;

    const minNum = groupSizeMin !== "" ? Number(groupSizeMin) : undefined;
    const maxNum = groupSizeMax !== "" ? Number(groupSizeMax) : undefined;
    const groupSize =
      minNum !== undefined || maxNum !== undefined
        ? { min: minNum, max: maxNum }
        : undefined;

    const costNum = costPerPerson !== "" ? Number(costPerPerson) : undefined;

    onSubmit({
      name: name.trim(),
      ...(description.trim() !== "" ? { description: description.trim() } : {}),
      estimatedDurationMinutes: durationNum,
      ...(timeOfDaySlot !== undefined ? { timeOfDaySlot } : {}),
      ...(groupSize !== undefined ? { groupSize } : {}),
      ...(costNum !== undefined ? { costPerPerson: costNum } : {}),
      ...(transport !== "" ? { transportationRequired: transport } : {}),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <h2 className="text-lg font-semibold">
        {SCREEN_ACTIVITIES_COPY.proposalFormTitle}
      </h2>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="activity-name">
          {SCREEN_ACTIVITIES_COPY.nameLabel}
        </Label>
        <Input
          id="activity-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          placeholder={SCREEN_ACTIVITIES_COPY.namePlaceholder}
        />
        {nameError && <p className="text-sm text-destructive">{nameError}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="activity-description">
          {SCREEN_ACTIVITIES_COPY.descriptionLabel}
        </Label>
        <Input
          id="activity-description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          placeholder={SCREEN_ACTIVITIES_COPY.descriptionPlaceholder}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="activity-duration">
          {SCREEN_ACTIVITIES_COPY.durationLabel}
        </Label>
        <Input
          id="activity-duration"
          type="number"
          min={1}
          value={durationMinutes}
          onChange={(e) => {
            setDurationMinutes(e.target.value);
          }}
        />
        {durationError && (
          <p className="text-sm text-destructive">{durationError}</p>
        )}
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-medium leading-none">
          {SCREEN_ACTIVITIES_COPY.timeOfDayLabel}
        </legend>
        <div className="flex gap-2 mt-1">
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="radio"
              name="slot-type"
              value={TimeOfDaySlotType.PreferredIn}
              checked={slotType === TimeOfDaySlotType.PreferredIn}
              onChange={() => {
                setSlotType(TimeOfDaySlotType.PreferredIn);
              }}
            />
            {SCREEN_ACTIVITIES_COPY.timeOfDayTypePreferred}
          </label>
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="radio"
              name="slot-type"
              value={TimeOfDaySlotType.MustOccurIn}
              checked={slotType === TimeOfDaySlotType.MustOccurIn}
              onChange={() => {
                setSlotType(TimeOfDaySlotType.MustOccurIn);
              }}
            />
            {SCREEN_ACTIVITIES_COPY.timeOfDayTypeMust}
          </label>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          {TIME_OF_DAY_OPTIONS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                value={value}
                checked={selectedSlots.includes(value)}
                onChange={() => {
                  handleSlotToggle(value);
                }}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="group-size-min">
            {SCREEN_ACTIVITIES_COPY.groupSizeMinLabel}
          </Label>
          <Input
            id="group-size-min"
            type="number"
            min={1}
            value={groupSizeMin}
            onChange={(e) => {
              setGroupSizeMin(e.target.value);
            }}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="group-size-max">
            {SCREEN_ACTIVITIES_COPY.groupSizeMaxLabel}
          </Label>
          <Input
            id="group-size-max"
            type="number"
            min={1}
            value={groupSizeMax}
            onChange={(e) => {
              setGroupSizeMax(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cost-per-person">
          {SCREEN_ACTIVITIES_COPY.costLabel}
        </Label>
        <Input
          id="cost-per-person"
          type="number"
          min={0}
          step={0.01}
          value={costPerPerson}
          onChange={(e) => {
            setCostPerPerson(e.target.value);
          }}
        />
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-medium leading-none">
          {SCREEN_ACTIVITIES_COPY.transportLabel}
        </legend>
        <div className="flex flex-col gap-1 mt-1">
          {TRANSPORT_OPTIONS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="transport"
                value={value}
                checked={transport === value}
                onChange={() => {
                  setTransport(value);
                }}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {SCREEN_ACTIVITIES_COPY.submitButton}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {SCREEN_ACTIVITIES_COPY.cancelButton}
        </Button>
      </div>
    </form>
  );
}
