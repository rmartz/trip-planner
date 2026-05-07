"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Stop } from "@/lib/types/trip";
import { LEG_FORM_COPY } from "./LegFormView.copy";

export interface LegFormViewProps {
  stops: Stop[];
  onSubmit: (input: {
    fromStopId: string;
    toStopId: string;
    name: string;
    notes?: string;
  }) => void;
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
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [fromError, setFromError] = useState<string | undefined>();
  const [toError, setToError] = useState<string | undefined>();
  const [nameError, setNameError] = useState<string | undefined>();

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setFromError(undefined);
    setToError(undefined);
    setNameError(undefined);

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
    if (!name.trim()) {
      setNameError(LEG_FORM_COPY.errorNameRequired);
      valid = false;
    }
    if (!valid) return;

    onSubmit({
      fromStopId,
      toStopId,
      name,
      ...(notes.trim() !== "" && { notes: notes.trim() }),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 p-4 border rounded-lg"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="leg-from-stop">{LEG_FORM_COPY.fromStopLabel}</Label>
        <Select
          value={fromStopId}
          onValueChange={(v) => {
            setFromStopId(v ?? "");
          }}
        >
          <SelectTrigger id="leg-from-stop">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {stops.map((stop) => (
              <SelectItem key={stop.stopId} value={stop.stopId}>
                {stop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fromError && <p className="text-sm text-destructive">{fromError}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="leg-to-stop">{LEG_FORM_COPY.toStopLabel}</Label>
        <Select
          value={toStopId}
          onValueChange={(v) => {
            setToStopId(v ?? "");
          }}
        >
          <SelectTrigger id="leg-to-stop">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {stops.map((stop) => (
              <SelectItem key={stop.stopId} value={stop.stopId}>
                {stop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {toError && <p className="text-sm text-destructive">{toError}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="leg-name">{LEG_FORM_COPY.nameLabel}</Label>
        <Input
          id="leg-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        {nameError && <p className="text-sm text-destructive">{nameError}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="leg-notes">{LEG_FORM_COPY.notesLabel}</Label>
        <Textarea
          id="leg-notes"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
          }}
        />
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
