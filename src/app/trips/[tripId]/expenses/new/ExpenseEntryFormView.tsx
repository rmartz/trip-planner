"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExpenseCategory } from "@/lib/types/expense";
import { EXPENSE_ENTRY_FORM_COPY } from "./ExpenseEntryFormView.copy";

const COPY = EXPENSE_ENTRY_FORM_COPY;

export interface ExpenseEntryMemberOption {
  memberId: string;
  name: string;
}

export interface ExpenseEntryLinkedEntityOption {
  entityId: string;
  label: string;
}

export interface ExpenseEntryInput {
  amountCents: number;
  category: ExpenseCategory;
  currency: string;
  linkedEntityId?: string;
  name: string;
  participantMemberIds: string[];
  payerMemberId: string;
}

export interface ExpenseEntryFormViewProps {
  initialPayerId?: string;
  isSubmitting?: boolean;
  linkedEntityOptions: ExpenseEntryLinkedEntityOption[];
  memberOptions: ExpenseEntryMemberOption[];
  onCancel: () => void;
  onSubmit: (input: ExpenseEntryInput) => void;
  submitError?: string;
}

const CATEGORY_OPTIONS: { label: string; value: ExpenseCategory }[] = [
  {
    label: COPY.categoryOptionActivities,
    value: ExpenseCategory.Activity,
  },
  { label: COPY.categoryOptionFood, value: ExpenseCategory.Food },
  { label: COPY.categoryOptionLodging, value: ExpenseCategory.Lodging },
  { label: COPY.categoryOptionOther, value: ExpenseCategory.Other },
  {
    label: COPY.categoryOptionTransport,
    value: ExpenseCategory.Transport,
  },
];

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "JPY"];

export function ExpenseEntryFormView({
  initialPayerId,
  isSubmitting = false,
  linkedEntityOptions,
  memberOptions,
  onCancel,
  onSubmit,
  submitError,
}: ExpenseEntryFormViewProps) {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [category, setCategory] = useState<ExpenseCategory>(
    ExpenseCategory.Food,
  );
  const [payerMemberId, setPayerMemberId] = useState(initialPayerId ?? "");
  const [participantIds, setParticipantIds] = useState<string[]>(
    memberOptions.map((m) => m.memberId),
  );
  const [name, setName] = useState("");
  const [linkedEntityId, setLinkedEntityId] = useState("");
  const [amountError, setAmountError] = useState<string | undefined>();
  const [nameError, setNameError] = useState<string | undefined>();
  const [participantError, setParticipantError] = useState<
    string | undefined
  >();
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
    setNameError(undefined);
    setParticipantError(undefined);
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

    if (name.trim() === "") {
      setNameError(COPY.errorNameRequired);
      hasError = true;
    }

    if (payerMemberId === "") {
      setPayerError(COPY.errorPayerRequired);
      hasError = true;
    }

    if (participantIds.length === 0) {
      setParticipantError(COPY.errorParticipantsRequired);
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const amountCents = Math.round(Number(amount) * 100);

    onSubmit({
      amountCents,
      category,
      currency,
      ...(linkedEntityId !== "" ? { linkedEntityId } : {}),
      name: name.trim(),
      participantMemberIds: participantIds,
      payerMemberId,
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
            setCategory(e.target.value as ExpenseCategory);
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
          {memberOptions.map(({ memberId, name }) => (
            <label key={memberId} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                value={memberId}
                checked={participantIds.includes(memberId)}
                onChange={() => {
                  handleParticipantToggle(memberId);
                }}
              />
              {name}
            </label>
          ))}
        </div>
        {participantError !== undefined && (
          <p className="text-sm text-destructive">{participantError}</p>
        )}
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="expense-name">{COPY.nameLabel}</Label>
        <Textarea
          id="expense-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          placeholder={COPY.namePlaceholder}
          rows={2}
        />
        {nameError !== undefined && (
          <p className="text-sm text-destructive">{nameError}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="expense-linked-entity">{COPY.linkedEntityLabel}</Label>
        <select
          id="expense-linked-entity"
          value={linkedEntityId}
          onChange={(e) => {
            setLinkedEntityId(e.target.value);
          }}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">{COPY.linkedEntityNoneOption}</option>
          {linkedEntityOptions.map(({ entityId, label }) => (
            <option key={entityId} value={entityId}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {submitError !== undefined && (
        <p className="text-sm text-destructive">{submitError}</p>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {COPY.submitButton}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {COPY.cancelButton}
        </Button>
      </div>
    </form>
  );
}
