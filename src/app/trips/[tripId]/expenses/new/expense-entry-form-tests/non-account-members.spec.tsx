import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import {
  ExpenseEntryFormView,
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

describe("Non-account members show * suffix in participant list", () => {
  it("renders the name with * suffix for a non-account member checkbox", () => {
    render(
      <ExpenseEntryFormView
        memberOptions={[
          makeMember({ memberId: "m-ben", name: "Ben", nonAccount: true }),
        ]}
        linkedEntityOptions={[]}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText("Ben*")).toBeDefined();
  });

  it("renders the name without * suffix for a regular member", () => {
    render(
      <ExpenseEntryFormView
        memberOptions={[makeMember({ memberId: "m-alice", name: "Alice" })]}
        linkedEntityOptions={[]}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    // Alice appears in both the participant checkbox and payer dropdown — use getAllByText
    expect(screen.getAllByText("Alice").length).toBeGreaterThan(0);
    expect(screen.queryByText("Alice*")).toBeNull();
  });

  it("renders * suffix only for non-account members when mixed with regular members", () => {
    render(
      <ExpenseEntryFormView
        memberOptions={[
          makeMember({ memberId: "m-alice", name: "Alice" }),
          makeMember({ memberId: "m-ben", name: "Ben", nonAccount: true }),
        ]}
        linkedEntityOptions={[]}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    // Alice (regular) should not have * suffix; Ben (non-account) should
    expect(screen.queryByText("Alice*")).toBeNull();
    expect(screen.getAllByText("Alice").length).toBeGreaterThan(0);
    expect(screen.getByText("Ben*")).toBeDefined();
  });
});

describe("Non-account member caption shows when non-account members are present", () => {
  it("shows the non-account caption when at least one non-account member is in the list", () => {
    render(
      <ExpenseEntryFormView
        memberOptions={[
          makeMember({ memberId: "m-alice", name: "Alice" }),
          makeMember({ memberId: "m-ben", name: "Ben", nonAccount: true }),
        ]}
        linkedEntityOptions={[]}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(
      screen.getByText(EXPENSE_ENTRY_FORM_COPY.nonAccountCaption),
    ).toBeDefined();
  });

  it("does not show the non-account caption when all members have accounts", () => {
    render(
      <ExpenseEntryFormView
        memberOptions={[
          makeMember({ memberId: "m-alice", name: "Alice" }),
          makeMember({ memberId: "m-bob", name: "Bob" }),
        ]}
        linkedEntityOptions={[]}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(
      screen.queryByText(EXPENSE_ENTRY_FORM_COPY.nonAccountCaption),
    ).toBeNull();
  });

  it("does not show the non-account caption when the member list is empty", () => {
    render(
      <ExpenseEntryFormView
        memberOptions={[]}
        linkedEntityOptions={[]}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(
      screen.queryByText(EXPENSE_ENTRY_FORM_COPY.nonAccountCaption),
    ).toBeNull();
  });
});
