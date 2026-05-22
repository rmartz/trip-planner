import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ExpenseLinkedEntityType } from "@/lib/types/expense";
import {
  ExpenseEntryFormView,
  type ExpenseEntryLinkedEntityOption,
  type ExpenseEntryMemberOption,
} from "../ExpenseEntryFormView";
import { EXPENSE_ENTRY_FORM_COPY } from "../ExpenseEntryFormView.copy";

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
    type: ExpenseLinkedEntityType.Stop,
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

  it("filters out invalid participant ids not present in memberOptions", () => {
    const onSubmit = vi.fn();
    render(
      <ExpenseEntryFormView
        initialPayerId="member-alice"
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        initialParticipantIds={["member-alice", "member-unknown"]}
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

  it("de-duplicates repeated participant ids from initialParticipantIds", () => {
    const onSubmit = vi.fn();
    render(
      <ExpenseEntryFormView
        initialPayerId="member-alice"
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        initialParticipantIds={["member-alice", "member-alice", "member-bob"]}
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
    expect(payload.participantMemberIds).toEqual([
      "member-alice",
      "member-bob",
    ]);
  });
});

describe("ExpenseEntryFormView — initial linked entity pre-fill", () => {
  it("pre-selects the linked entity when initialLinkedEntity is provided", () => {
    render(
      <ExpenseEntryFormView
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        initialLinkedEntity={{
          entityId: "stop-paris",
          type: ExpenseLinkedEntityType.Stop,
        }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.linkedEntityLabel),
    ).toHaveProperty("value", "stop:stop-paris");
  });

  it("includes the pre-filled linked entity in the submitted payload", () => {
    const onSubmit = vi.fn();
    render(
      <ExpenseEntryFormView
        initialPayerId="member-alice"
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        initialLinkedEntity={{
          entityId: "lodging-1",
          type: ExpenseLinkedEntityType.Stop,
        }}
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
    const payload = (onSubmit.mock.calls[0] as [{ linkedEntity?: unknown }])[0];
    expect(payload.linkedEntity).toEqual({
      entityId: "lodging-1",
      label: "Lyon hotel",
      type: ExpenseLinkedEntityType.Stop,
    });
  });

  it("falls back to no linked entity when initialLinkedEntity is not in linkedEntityOptions", () => {
    const onSubmit = vi.fn();
    render(
      <ExpenseEntryFormView
        initialPayerId="member-alice"
        memberOptions={DEFAULT_MEMBERS}
        linkedEntityOptions={DEFAULT_LINKED}
        initialLinkedEntity={{
          entityId: "entity-unknown",
          type: ExpenseLinkedEntityType.Leg,
        }}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );
    fireEvent.change(
      screen.getByLabelText(EXPENSE_ENTRY_FORM_COPY.amountLabel),
      { target: { value: "20" } },
    );
    fireEvent.submit(screen.getByTestId("expense-entry-form"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = (
      onSubmit.mock.calls[0] as [{ linkedEntity?: { entityId?: string } }]
    )[0];
    expect(payload.linkedEntity).toBeUndefined();
  });
});
