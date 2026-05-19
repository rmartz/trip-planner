import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ExpenseLinkedEntityType } from "@/lib/types/expense";
import {
  ExpenseEntryCategory,
  ExpenseEntryFormView,
  type ExpenseEntryInput,
} from "../ExpenseEntryFormView";
import { EXPENSE_ENTRY_FORM_COPY } from "../ExpenseEntryFormView.copy";
import { DEFAULT_LINKED, DEFAULT_MEMBERS } from "./test-helpers";

afterEach(cleanup);

describe("ExpenseEntryFormView — submit", () => {
  it("calls onSubmit with parsed payload when form is valid", () => {
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
      {
        target: { value: "42.50" },
      },
    );
    fireEvent.submit(screen.getByTestId("expense-entry-form"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0]?.[0] as ExpenseEntryInput;
    expect(payload.amountCents).toBe(4250);
    expect(payload.payerMemberId).toBe("member-alice");
    expect(payload.currency).toBe("USD");
    expect(payload.category).toBe(ExpenseEntryCategory.Food);
    expect(payload.participantMemberIds).toEqual([
      "member-alice",
      "member-bob",
      "member-carol",
    ]);
  });

  it("includes description in payload when provided", () => {
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
      {
        target: { value: "100" },
      },
    );
    fireEvent.change(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.descriptionLabel),
      {
        target: { value: "Group dinner" },
      },
    );
    fireEvent.submit(screen.getByTestId("expense-entry-form"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0]?.[0] as ExpenseEntryInput;
    expect(payload.description).toBe("Group dinner");
  });

  it("includes linked entity in payload when selected", () => {
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
      {
        target: { value: "30" },
      },
    );
    fireEvent.change(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.linkedEntityLabel),
      { target: { value: "stop:stop-paris" } },
    );
    fireEvent.submit(screen.getByTestId("expense-entry-form"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0]?.[0] as ExpenseEntryInput;
    expect(payload.linkedEntity).toEqual({
      entityId: "stop-paris",
      label: "Paris stop",
      type: ExpenseLinkedEntityType.Stop,
    });
  });

  it("excludes deselected members from participantMemberIds", () => {
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
      {
        target: { value: "30" },
      },
    );
    fireEvent.click(screen.getByLabelText("Bob"));
    fireEvent.submit(screen.getByTestId("expense-entry-form"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0]?.[0] as ExpenseEntryInput;
    expect(payload.participantMemberIds).toEqual([
      "member-alice",
      "member-carol",
    ]);
  });
});
