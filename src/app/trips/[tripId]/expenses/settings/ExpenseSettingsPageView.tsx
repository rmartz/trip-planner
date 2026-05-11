"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EXPENSE_SETTINGS_PAGE_COPY } from "./ExpenseSettingsPageView.copy";

const COPY = EXPENSE_SETTINGS_PAGE_COPY;

export enum ExpenseSettingsCategory {
  Activities = "activities",
  Food = "food",
  Lodging = "lodging",
  Other = "other",
  Transport = "transport",
}

export enum ExpenseUnitModel {
  PerUnit = "per_unit",
  SharedBucket = "shared_bucket",
  UsageShare = "usage_share",
}

export interface ExpenseSettingsMemberOption {
  memberId: string;
  name: string;
}

export interface ExpenseSettingsCategoryConfig {
  category: ExpenseSettingsCategory;
  categoryLabel: string;
  defaultParticipantMemberIds: string[];
  unitModel: ExpenseUnitModel;
}

export interface ExpenseSettingsPageViewProps {
  initialCategories: ExpenseSettingsCategoryConfig[];
  isSubmitting?: boolean;
  memberOptions: ExpenseSettingsMemberOption[];
  onCancel: () => void;
  onSave: (categories: ExpenseSettingsCategoryConfig[]) => void;
}

const UNIT_MODEL_OPTIONS: { label: string; value: ExpenseUnitModel }[] = [
  { label: COPY.unitModelOptionPerUnit, value: ExpenseUnitModel.PerUnit },
  {
    label: COPY.unitModelOptionSharedBucket,
    value: ExpenseUnitModel.SharedBucket,
  },
  { label: COPY.unitModelOptionUsageShare, value: ExpenseUnitModel.UsageShare },
];

interface ExpenseSettingsCategoryRowProps {
  config: ExpenseSettingsCategoryConfig;
  memberOptions: ExpenseSettingsMemberOption[];
  onChangeParticipants: (memberIds: string[]) => void;
  onChangeUnitModel: (unitModel: ExpenseUnitModel) => void;
}

function ExpenseSettingsCategoryRow({
  config,
  memberOptions,
  onChangeParticipants,
  onChangeUnitModel,
}: ExpenseSettingsCategoryRowProps) {
  function handleParticipantToggle(memberId: string) {
    const next = config.defaultParticipantMemberIds.includes(memberId)
      ? config.defaultParticipantMemberIds.filter((id) => id !== memberId)
      : [...config.defaultParticipantMemberIds, memberId];
    onChangeParticipants(next);
  }

  return (
    <li
      data-testid="expense-settings-category-row"
      className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{config.categoryLabel}</span>
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor={`unit-model-${config.category}`}
          className="text-xs text-zinc-500 dark:text-zinc-400"
        >
          {COPY.unitModelColumnHeading}
        </label>
        <select
          id={`unit-model-${config.category}`}
          value={config.unitModel}
          onChange={(e) => {
            onChangeUnitModel(e.target.value as ExpenseUnitModel);
          }}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {UNIT_MODEL_OPTIONS.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="flex flex-col gap-1">
        <legend className="text-xs text-zinc-500 dark:text-zinc-400">
          {COPY.defaultParticipantsColumnHeading}
        </legend>
        <div className="mt-1 flex flex-wrap gap-3">
          {memberOptions.map(({ memberId, name }) => (
            <label key={memberId} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                value={memberId}
                checked={config.defaultParticipantMemberIds.includes(memberId)}
                onChange={() => {
                  handleParticipantToggle(memberId);
                }}
              />
              {name}
            </label>
          ))}
        </div>
      </fieldset>
    </li>
  );
}

export function ExpenseSettingsPageView({
  initialCategories,
  isSubmitting = false,
  memberOptions,
  onCancel,
  onSave,
}: ExpenseSettingsPageViewProps) {
  const [categories, setCategories] = useState(initialCategories);

  function updateCategory(
    category: ExpenseSettingsCategory,
    patch: Partial<ExpenseSettingsCategoryConfig>,
  ) {
    setCategories((prev) =>
      prev.map((c) => (c.category === category ? { ...c, ...patch } : c)),
    );
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    onSave(categories);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-screen flex-col"
      data-testid="expense-settings-form"
    >
      <header className="flex flex-col gap-0.5 border-b px-4 py-3">
        <h1 className="text-lg font-semibold">{COPY.pageHeading}</h1>
        <p className="font-mono text-xs text-muted-foreground">
          {COPY.headingSubtext}
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4">
        <ul
          data-testid="expense-settings-category-list"
          className="flex flex-col gap-3"
        >
          {categories.map((config) => (
            <ExpenseSettingsCategoryRow
              key={config.category}
              config={config}
              memberOptions={memberOptions}
              onChangeParticipants={(memberIds) => {
                updateCategory(config.category, {
                  defaultParticipantMemberIds: memberIds,
                });
              }}
              onChangeUnitModel={(unitModel) => {
                updateCategory(config.category, { unitModel });
              }}
            />
          ))}
        </ul>
      </main>

      <footer className="flex gap-2 border-t px-4 py-3">
        <Button type="submit" disabled={isSubmitting}>
          {COPY.saveButton}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {COPY.cancelButton}
        </Button>
      </footer>
    </form>
  );
}
