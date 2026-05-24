import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ExpenseEntryFormView } from "../ExpenseEntryFormView";
import { EXPENSE_ENTRY_FORM_COPY } from "../ExpenseEntryFormView.copy";
import { DEFAULT_LINKED, DEFAULT_MEMBERS } from "./test-helpers";

afterEach(cleanup);

describe("ExpenseEntryFormView — cancel", () => {
  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(
      <ExpenseEntryFormView
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: EXPENSE_ENTRY_FORM_COPY.cancelButton,
      }),
    );

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
