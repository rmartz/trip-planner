import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ExpenseCategory } from "@/lib/types/expense";
import {
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
    fireEvent.change(screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.nameLabel), {
      target: { value: "Group dinner" },
    });
    fireEvent.submit(screen.getByTestId("expense-entry-form"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0]?.[0] as ExpenseEntryInput;
    expect(payload.amountCents).toBe(4250);
    expect(payload.payerMemberId).toBe("member-alice");
    expect(payload.currency).toBe("USD");
    expect(payload.category).toBe(ExpenseCategory.Food);
    expect(payload.participantMemberIds).toEqual([
      "member-alice",
      "member-bob",
      "member-carol",
    ]);
  });

  it("includes name in payload when provided", () => {
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
    fireEvent.change(screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.nameLabel), {
      target: { value: "Group dinner" },
    });
    fireEvent.submit(screen.getByTestId("expense-entry-form"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0]?.[0] as ExpenseEntryInput;
    expect(payload.name).toBe("Group dinner");
  });

  it("includes linked entity id in payload when selected", () => {
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
    fireEvent.change(screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.nameLabel), {
      target: { value: "Train ticket" },
    });
    fireEvent.change(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.linkedEntityLabel),
      { target: { value: "stop-paris" } },
    );
    fireEvent.submit(screen.getByTestId("expense-entry-form"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0]?.[0] as ExpenseEntryInput;
    expect(payload.linkedEntityId).toBe("stop-paris");
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
    fireEvent.change(screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.nameLabel), {
      target: { value: "Shared taxi" },
    });
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
