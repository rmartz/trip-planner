import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  ExpenseEntryCategory,
  ExpenseEntryFormView,
  type ExpenseEntryInput,
  type ExpenseEntryLinkedEntityOption,
  type ExpenseEntryMemberOption,
} from "./ExpenseEntryFormView";
import { EXPENSE_ENTRY_FORM_COPY } from "./ExpenseEntryFormView.copy";

afterEach(cleanup);

function makeMember(
  overrides: Partial<ExpenseEntryMemberOption> = {},
): ExpenseEntryMemberOption {
  return {
    memberId: "member-alice",
    name: "Alice",
    ...overrides,
  };
}

function makeLinkedEntity(
  overrides: Partial<ExpenseEntryLinkedEntityOption> = {},
): ExpenseEntryLinkedEntityOption {
  return {
    entityId: "stop-1",
    label: "Paris — Day 2",
    ...overrides,
  };
}

const DEFAULT_MEMBERS: ExpenseEntryMemberOption[] = [
  makeMember({ memberId: "member-alice", name: "Alice" }),
  makeMember({ memberId: "member-bob", name: "Bob" }),
  makeMember({ memberId: "member-carol", name: "Carol" }),
];

const DEFAULT_LINKED: ExpenseEntryLinkedEntityOption[] = [
  makeLinkedEntity({ entityId: "stop-paris", label: "Paris stop" }),
  makeLinkedEntity({ entityId: "lodging-1", label: "Lyon hotel" }),
];

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
      { target: { value: "0" } },
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
      { target: { value: "42.50" } },
    );
    fireEvent.submit(screen.getByTestId("expense-entry-form"));

    expect(
      screen.getByText(EXPENSE_ENTRY_FORM_COPY.errorPayerRequired),
    ).toBeDefined();
  });
});

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
      { target: { value: "42.50" } },
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
      { target: { value: "100" } },
    );
    fireEvent.change(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.descriptionLabel),
      { target: { value: "Group dinner" } },
    );
    fireEvent.submit(screen.getByTestId("expense-entry-form"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0]?.[0] as ExpenseEntryInput;
    expect(payload.description).toBe("Group dinner");
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
      { target: { value: "30" } },
    );
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
      { target: { value: "30" } },
    );
    // Uncheck Bob (all three start checked because initial state pre-fills participants)
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

describe("ExpenseEntryFormView — initial participant pre-fill", () => {
  it("checks only the given initial participants when initialParticipantIds is provided", () => {
    render(
      <ExpenseEntryFormView
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        initialParticipantIds={["member-alice", "member-bob"]}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Alice")).toHaveProperty("checked", true);
    expect(screen.getByLabelText("Bob")).toHaveProperty("checked", true);
    expect(screen.getByLabelText("Carol")).toHaveProperty("checked", false);
  });

  it("submits only the pre-filled participant ids", () => {
    const onSubmit = vi.fn();
    render(
      <ExpenseEntryFormView
        initialPayerId="member-alice"
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        initialParticipantIds={["member-alice"]}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );
    fireEvent.change(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.amountLabel),
      { target: { value: "50" } },
    );
    fireEvent.submit(screen.getByTestId("expense-entry-form"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = (
      onSubmit.mock.calls[0] as [{ participantMemberIds: string[] }]
    )[0];
    expect(payload.participantMemberIds).toEqual(["member-alice"]);
  });
});

describe("ExpenseEntryFormView — initial linked entity pre-fill", () => {
  it("pre-selects the linked entity when initialLinkedEntityId is provided", () => {
    render(
      <ExpenseEntryFormView
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        initialLinkedEntityId="stop-paris"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.linkedEntityLabel),
    ).toHaveProperty("value", "stop-paris");
  });

  it("includes the pre-filled linked entity id in the submitted payload", () => {
    const onSubmit = vi.fn();
    render(
      <ExpenseEntryFormView
        initialPayerId="member-alice"
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        initialLinkedEntityId="lodging-1"
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );
    fireEvent.change(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.amountLabel),
      { target: { value: "80" } },
    );
    fireEvent.submit(screen.getByTestId("expense-entry-form"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = (onSubmit.mock.calls[0] as [{ linkedEntityId: string }])[0];
    expect(payload.linkedEntityId).toBe("lodging-1");
  });
});

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
