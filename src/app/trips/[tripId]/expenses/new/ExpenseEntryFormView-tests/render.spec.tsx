import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ExpenseEntryFormView } from "../ExpenseEntryFormView";
import { EXPENSE_ENTRY_FORM_COPY } from "../ExpenseEntryFormView.copy";
import { DEFAULT_LINKED, DEFAULT_MEMBERS } from "./test-helpers";

afterEach(cleanup);

describe("ExpenseEntryFormView — renders fields", () => {
  it("renders amount, currency, category, payer, description, and linked entity fields", () => {
    render(
      <ExpenseEntryFormView
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.amountLabel),
    ).toBeDefined();
    expect(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.currencyLabel),
    ).toBeDefined();
    expect(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.categoryLabel),
    ).toBeDefined();
    expect(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.payerLabel),
    ).toBeDefined();
    expect(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.descriptionLabel),
    ).toBeDefined();
    expect(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.linkedEntityLabel),
    ).toBeDefined();
  });

  it("renders the participants fieldset legend", () => {
    render(
      <ExpenseEntryFormView
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByText(EXPENSE_ENTRY_FORM_COPY.participantsLabel),
    ).toBeDefined();
  });

  it("renders submit and cancel buttons", () => {
    render(
      <ExpenseEntryFormView
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: EXPENSE_ENTRY_FORM_COPY.submitButton,
      }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", {
        name: EXPENSE_ENTRY_FORM_COPY.cancelButton,
      }),
    ).toBeDefined();
  });

  it("renders one checkbox per member in the participants list", () => {
    render(
      <ExpenseEntryFormView
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("checkbox").length).toBe(DEFAULT_MEMBERS.length);
  });
});
