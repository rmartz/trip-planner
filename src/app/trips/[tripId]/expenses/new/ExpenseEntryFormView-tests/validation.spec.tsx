import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ExpenseEntryFormView } from "../ExpenseEntryFormView";
import { EXPENSE_ENTRY_FORM_COPY } from "../ExpenseEntryFormView.copy";
import { DEFAULT_LINKED, DEFAULT_MEMBERS } from "./test-helpers";

afterEach(cleanup);

describe("ExpenseEntryFormView — amount validation", () => {
  it("shows amount-required error when submitted empty", () => {
    render(
      <ExpenseEntryFormView
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.submit(screen.getByTestId("expense-entry-form"));

    expect(
      screen.getByText(EXPENSE_ENTRY_FORM_COPY.errorAmountRequired),
    ).toBeDefined();
  });

  it("shows amount-invalid error when amount is zero or negative", () => {
    render(
      <ExpenseEntryFormView
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.change(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.amountLabel),
      {
        target: { value: "0" },
      },
    );
    fireEvent.submit(screen.getByTestId("expense-entry-form"));

    expect(
      screen.getByText(EXPENSE_ENTRY_FORM_COPY.errorAmountInvalid),
    ).toBeDefined();
  });

  it("does not call onSubmit when amount is empty", () => {
    const onSubmit = vi.fn();
    render(
      <ExpenseEntryFormView
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.submit(screen.getByTestId("expense-entry-form"));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("ExpenseEntryFormView — payer validation", () => {
  it("shows payer-required error when no payer is selected", () => {
    render(
      <ExpenseEntryFormView
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.change(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.amountLabel),
      {
        target: { value: "42.50" },
      },
    );
    fireEvent.submit(screen.getByTestId("expense-entry-form"));

    expect(
      screen.getByText(EXPENSE_ENTRY_FORM_COPY.errorPayerRequired),
    ).toBeDefined();
  });
});
