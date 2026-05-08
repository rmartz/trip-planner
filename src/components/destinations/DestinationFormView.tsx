"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DESTINATION_FORM_COPY } from "./DestinationFormView.copy";

export interface DestinationFormInput {
  name: string;
  seasonality: string | undefined;
}

interface DestinationFormViewCreateProps {
  mode: "create";
  initialName?: undefined;
  initialSeasonality?: undefined;
  onSubmit: (input: DestinationFormInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface DestinationFormViewEditProps {
  mode: "edit";
  initialName: string;
  initialSeasonality: string | undefined;
  onSubmit: (input: DestinationFormInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export type DestinationFormViewProps =
  | DestinationFormViewCreateProps
  | DestinationFormViewEditProps;

export function DestinationFormView({
  mode,
  initialName,
  initialSeasonality,
  onSubmit,
  onCancel,
  isSubmitting,
}: DestinationFormViewProps) {
  const [name, setName] = useState(initialName ?? "");
  const [seasonality, setSeasonality] = useState(initialSeasonality ?? "");
  const [nameError, setNameError] = useState<string | undefined>();

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setNameError(undefined);

    if (!name.trim()) {
      setNameError(DESTINATION_FORM_COPY.errorNameRequired);
      return;
    }

    onSubmit({
      name: name.trim(),
      seasonality: seasonality.trim() || undefined,
    });
  }

  const heading =
    mode === "create"
      ? DESTINATION_FORM_COPY.createHeading
      : DESTINATION_FORM_COPY.editHeading;

  const submitLabel =
    mode === "create"
      ? DESTINATION_FORM_COPY.submitCreateButton
      : DESTINATION_FORM_COPY.submitEditButton;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md p-6">
      <h2 className="text-xl font-bold">{heading}</h2>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dest-name">{DESTINATION_FORM_COPY.nameLabel}</Label>
        <Input
          id="dest-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          placeholder={DESTINATION_FORM_COPY.namePlaceholder}
        />
        {nameError && <p className="text-sm text-destructive">{nameError}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dest-seasonality">
          {DESTINATION_FORM_COPY.seasonalityLabel}
        </Label>
        <Input
          id="dest-seasonality"
          value={seasonality}
          onChange={(e) => {
            setSeasonality(e.target.value);
          }}
          placeholder={DESTINATION_FORM_COPY.seasonalityPlaceholder}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {DESTINATION_FORM_COPY.cancelButton}
        </Button>
      </div>
    </form>
  );
}
