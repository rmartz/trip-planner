"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  ExpenseLinkedEntity,
  ExpenseLinkedEntityType,
} from "@/lib/types/expense";
import type { ExpenseUnitModel } from "@/lib/types/expense-settings";
import { EXPENSE_ENTRY_FORM_COPY } from "./ExpenseEntryFormView.copy";
import {
  ExpenseUnitModelField,
  UNIT_MODEL_CATEGORY_DEFAULT,
} from "./ExpenseUnitModelField";

const COPY = EXPENSE_ENTRY_FORM_COPY;

export enum ExpenseEntryCategory {
  Activities = "activities",
  Food = "food",
  Lodging = "lodging",
  Other = "other",
  Transport = "transport",
}

export interface ExpenseEntryMemberOption {
  memberId: string;
  name: string;
  nonAccount?: boolean;
}

export interface ExpenseEntryLinkedEntityOption {
  entityId: string;
  label: string;
  type: ExpenseLinkedEntityType;
}

export interface ExpenseEntryInput {
  amountCents: number;
  category: ExpenseEntryCategory;
  currency: string;
  description?: string;
  linkedEntity?: ExpenseLinkedEntity;
  participantMemberIds: string[];
  payerMemberId: string;
  unitModel?: ExpenseUnitModel;
}

export interface ExpenseEntryFormViewProps {
  initialLinkedEntity?: Pick<ExpenseLinkedEntity, "entityId" | "type">;
  initialParticipantIds?: string[];
  initialPayerId?: string;
  initialUnitModel?: ExpenseUnitModel;
  isSubmitting?: boolean;
  linkedEntityOptions: ExpenseEntryLinkedEntityOption[];
  memberOptions: ExpenseEntryMemberOption[];
  onCancel: () => void;
  onSubmit: (input: ExpenseEntryInput) => void;
  submitError?: string;
}

const CATEGORY_OPTIONS: { label: string; value: ExpenseEntryCategory }[] = [
  {
    label: COPY.categoryOptionActivities,
    value: ExpenseEntryCategory.Activities,
  },
  { label: COPY.categoryOptionFood, value: ExpenseEntryCategory.Food },
  { label: COPY.categoryOptionLodging, value: ExpenseEntryCategory.Lodging },
  { label: COPY.categoryOptionOther, value: ExpenseEntryCategory.Other },
  {
    label: COPY.categoryOptionTransport,
    value: ExpenseEntryCategory.Transport,
  },
];

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "JPY"];

export function ExpenseEntryFormView({
  initialLinkedEntity,
  initialParticipantIds,
  initialPayerId,
  initialUnitModel,
  isSubmitting = false,
  linkedEntityOptions,
  memberOptions,
  onCancel,
  onSubmit,
  submitError,
}: ExpenseEntryFormViewProps) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [category, setCategory] = useState<ExpenseEntryCategory>(
    ExpenseEntryCategory.Food,
  );
  const [payerMemberId, setPayerMemberId] = useState(initialPayerId ?? "");
  const validMemberIds = new Set(memberOptions.map((m) => m.memberId));
  const [participantIds, setParticipantIds] = useState<string[]>(
    initialParticipantIds !== undefined
      ? [
          ...new Set(
            initialParticipantIds.filter((id) => validMemberIds.has(id)),
          ),
        ]
      : memberOptions.map((m) => m.memberId),
  );
  const [description, setDescription] = useState("");
  const linkedEntityByKey = new Map(
    linkedEntityOptions.map((option) => [
      `${option.type}:${option.entityId}`,
      option,
    ]),
  );
  const [linkedEntityKey, setLinkedEntityKey] = useState(
    initialLinkedEntity !== undefined &&
      linkedEntityByKey.has(
        `${initialLinkedEntity.type}:${initialLinkedEntity.entityId}`,
      )
      ? `${initialLinkedEntity.type}:${initialLinkedEntity.entityId}`
      : "",
  );
  const [unitModelValue, setUnitModelValue] = useState<string>(
    initialUnitModel ?? UNIT_MODEL_CATEGORY_DEFAULT,
  );
  const [amountError, setAmountError] = useState<string | undefined>();
  const [payerError, setPayerError] = useState<string | undefined>();

  function handleParticipantToggle(memberId: string) {
    setParticipantIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setAmountError(undefined);
    setPayerError(undefined);

    let hasError = false;

    if (amount.trim() === "") {
      setAmountError(COPY.errorAmountRequired);
      hasError = true;
    } else {
      const amountNum = Number(amount);
      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        setAmountError(COPY.errorAmountInvalid);
        hasError = true;
      }
    }

    if (payerMemberId === "") {
      setPayerError(COPY.errorPayerRequired);
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const amountCents = Math.round(Number(amount) * 100);

    const selectedLinkedEntity = linkedEntityByKey.get(linkedEntityKey);

    onSubmit({
      amountCents,
      category,
      currency,
      ...(description.trim() !== "" ? { description: description.trim() } : {}),
      ...(selectedLinkedEntity !== undefined
        ? {
            linkedEntity: {
              entityId: selectedLinkedEntity.entityId,
              label: selectedLinkedEntity.label,
              type: selectedLinkedEntity.type,
            },
          }
        : {}),
      participantMemberIds: participantIds,
      payerMemberId,
      ...(unitModelValue !== UNIT_MODEL_CATEGORY_DEFAULT
        ? { unitModel: unitModelValue as ExpenseUnitModel }
        : {}),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4"
      data-testid="expense-entry-form"
    >
      <h2 className="text-lg font-semibold">{COPY.formHeading}</h2>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="expense-amount">{COPY.amountLabel}</Label>
          <Input
            id="expense-amount"
            type="number"
            min={0.01}
            step={0.01}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
            }}
          />
          {amountError !== undefined && (
            <p className="text-sm text-destructive">{amountError}</p>
          )}
        </div>
        <div className="flex w-28 flex-col gap-1.5">
          <Label htmlFor="expense-currency">{COPY.currencyLabel}</Label>
          <select
            id="expense-currency"
            value={currency}
            onChange={(e) => {
              setCurrency(e.target.value);
            }}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="expense-category">{COPY.categoryLabel}</Label>
        <select
          id="expense-category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as ExpenseEntryCategory);
          }}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {CATEGORY_OPTIONS.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <ExpenseUnitModelField
        value={unitModelValue}
        onChange={setUnitModelValue}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="expense-payer">{COPY.payerLabel}</Label>
        <select
          id="expense-payer"
          value={payerMemberId}
          onChange={(e) => {
            setPayerMemberId(e.target.value);
          }}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">{COPY.payerPlaceholder}</option>
          {memberOptions.map(({ memberId, name }) => (
            <option key={memberId} value={memberId}>
              {name}
            </option>
          ))}
        </select>
        {payerError !== undefined && (
          <p className="text-sm text-destructive">{payerError}</p>
        )}
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-medium leading-none">
          {COPY.participantsLabel}
        </legend>
        <div className="mt-1 flex flex-wrap gap-3">
          {memberOptions.map(({ memberId, name, nonAccount }) => (
            <label key={memberId} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                value={memberId}
                checked={participantIds.includes(memberId)}
                onChange={() => {
                  handleParticipantToggle(memberId);
                }}
              />
              {nonAccount === true ? `${name}*` : name}
            </label>
          ))}
        </div>
        {memberOptions.some((m) => m.nonAccount === true) && (
          <p className="text-xs text-muted-foreground">
            {COPY.nonAccountCaption}
          </p>
        )}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="expense-description">{COPY.descriptionLabel}</Label>
        <Textarea
          id="expense-description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          placeholder={COPY.descriptionPlaceholder}
          rows={2}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="expense-linked-entity">{COPY.linkedEntityLabel}</Label>
        <select
          id="expense-linked-entity"
          value={linkedEntityKey}
          onChange={(e) => {
            setLinkedEntityKey(e.target.value);
          }}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">{COPY.linkedEntityNoneOption}</option>
          {linkedEntityOptions.map(({ entityId, label, type }) => (
            <option key={`${type}:${entityId}`} value={`${type}:${entityId}`}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {COPY.submitButton}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {COPY.cancelButton}
        </Button>
      </div>
      {submitError !== undefined && (
        <p className="text-sm text-destructive">{submitError}</p>
      )}
    </form>
  );
}
