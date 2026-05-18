import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ExpenseEntryFormView } from "../ExpenseEntryFormView";
import { EXPENSE_ENTRY_FORM_COPY } from "../ExpenseEntryFormView.copy";
import { DEFAULT_LINKED, DEFAULT_MEMBERS } from "./test-helpers";

afterEach(cleanup);

describe("ExpenseEntryFormView — submitError", () => {
  it("renders submitError when provided", () => {
    render(
      <ExpenseEntryFormView
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        submitError={EXPENSE_ENTRY_FORM_COPY.submitError}
      />,
    );

    expect(screen.getByText(EXPENSE_ENTRY_FORM_COPY.submitError)).toBeDefined();
  });

  it("does not render a submit error when submitError is undefined", () => {
    render(
      <ExpenseEntryFormView
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.queryByText(EXPENSE_ENTRY_FORM_COPY.submitError)).toBeNull();
  });
});
