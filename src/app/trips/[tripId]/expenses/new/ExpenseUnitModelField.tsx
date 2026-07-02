"use client";

import { Label } from "@/components/ui/label";
import { ExpenseUnitModel } from "@/lib/types/expense-settings";
import { EXPENSE_ENTRY_FORM_COPY } from "./ExpenseEntryFormView.copy";

const COPY = EXPENSE_ENTRY_FORM_COPY;

const UNIT_MODEL_OPTIONS: { label: string; value: ExpenseUnitModel }[] = [
  { label: COPY.unitModelOptionPerUnit, value: ExpenseUnitModel.PerUnit },
  {
    label: COPY.unitModelOptionSharedBucket,
    value: ExpenseUnitModel.SharedBucket,
  },
  { label: COPY.unitModelOptionUsageShare, value: ExpenseUnitModel.UsageShare },
];

export const UNIT_MODEL_CATEGORY_DEFAULT = "";

export interface ExpenseUnitModelFieldProps {
  onChange: (value: string) => void;
  value: string;
}

export function ExpenseUnitModelField({
  onChange,
  value,
}: ExpenseUnitModelFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="expense-unit-model">{COPY.unitModelLabel}</Label>
      <select
        id="expense-unit-model"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
      >
        <option value={UNIT_MODEL_CATEGORY_DEFAULT}>
          {COPY.unitModelCategoryDefaultOption}
        </option>
        {UNIT_MODEL_OPTIONS.map(({ label, value: modelValue }) => (
          <option key={modelValue} value={modelValue}>
            {label}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">{COPY.unitModelHint}</p>
    </div>
  );
}
