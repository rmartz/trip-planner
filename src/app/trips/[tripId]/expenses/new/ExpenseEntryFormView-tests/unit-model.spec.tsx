import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ExpenseUnitModel } from "@/lib/types/expense-settings";
import {
  ExpenseEntryFormView,
  type ExpenseEntryInput,
} from "../ExpenseEntryFormView";
import { EXPENSE_ENTRY_FORM_COPY } from "../ExpenseEntryFormView.copy";
import { DEFAULT_LINKED, DEFAULT_MEMBERS } from "./test-helpers";

afterEach(cleanup);

describe("ExpenseEntryFormView — unit model override field", () => {
  it("renders a unit model field", () => {
    render(
      <ExpenseEntryFormView
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.unitModelLabel),
    ).toBeDefined();
  });

  it("offers the category-default option plus each explicit unit model", () => {
    const { container } = render(
      <ExpenseEntryFormView
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    const select = container.querySelector<HTMLSelectElement>(
      "#expense-unit-model",
    );
    const optionLabels = Array.from(select?.options ?? []).map(
      (o) => o.textContent,
    );

    expect(optionLabels).toEqual([
      EXPENSE_ENTRY_FORM_COPY.unitModelCategoryDefaultOption,
      EXPENSE_ENTRY_FORM_COPY.unitModelOptionPerUnit,
      EXPENSE_ENTRY_FORM_COPY.unitModelOptionSharedBucket,
      EXPENSE_ENTRY_FORM_COPY.unitModelOptionUsageShare,
    ]);
  });
});

describe("ExpenseEntryFormView — unit model override in payload", () => {
  it("omits unitModel from the payload when category default is selected", () => {
    const onSubmit = vi.fn();
    render(
      <ExpenseEntryFormView
        initialPayerId="member-alice"
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.change(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.amountLabel),
      { target: { value: "42.50" } },
    );
    fireEvent.submit(screen.getByTestId("expense-entry-form"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0]?.[0] as ExpenseEntryInput;
    expect(payload.unitModel).toBeUndefined();
  });

  it("includes the chosen unitModel in the payload when overridden", () => {
    const onSubmit = vi.fn();
    render(
      <ExpenseEntryFormView
        initialPayerId="member-alice"
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.change(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.amountLabel),
      { target: { value: "42.50" } },
    );
    fireEvent.change(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.unitModelLabel),
      { target: { value: ExpenseUnitModel.SharedBucket } },
    );
    fireEvent.submit(screen.getByTestId("expense-entry-form"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0]?.[0] as ExpenseEntryInput;
    expect(payload.unitModel).toBe(ExpenseUnitModel.SharedBucket);
  });
});

describe("ExpenseEntryFormView — unit model initial override", () => {
  it("pre-selects an initial unit model override when provided", () => {
    const onSubmit = vi.fn();
    const { container } = render(
      <ExpenseEntryFormView
        initialPayerId="member-alice"
        initialUnitModel={ExpenseUnitModel.UsageShare}
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    const select = container.querySelector<HTMLSelectElement>(
      "#expense-unit-model",
    );
    expect(select?.value).toBe(ExpenseUnitModel.UsageShare);

    fireEvent.change(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.amountLabel),
      { target: { value: "10" } },
    );
    fireEvent.submit(screen.getByTestId("expense-entry-form"));

    const payload = onSubmit.mock.calls[0]?.[0] as ExpenseEntryInput;
    expect(payload.unitModel).toBe(ExpenseUnitModel.UsageShare);
  });
});
