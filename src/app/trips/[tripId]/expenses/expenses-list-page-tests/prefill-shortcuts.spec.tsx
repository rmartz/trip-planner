import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  type ExpensePreFillOption,
  ExpensePreFillType,
  ExpensesListPageView,
} from "../ExpensesListPageView";
import { EXPENSES_LIST_PAGE_COPY } from "../ExpensesListPageView.copy";

afterEach(cleanup);

function makePreFillOption(
  overrides: Partial<ExpensePreFillOption> = {},
): ExpensePreFillOption {
  return {
    entityId: "lodging-1",
    label: "Lyon Hotel",
    participantMemberIds: ["member-alice", "member-bob"],
    type: ExpensePreFillType.LodgingUnit,
    ...overrides,
  };
}

describe("ExpensesListPageView — pre-fill shortcuts", () => {
  it("renders the pre-fill section heading when options are provided", () => {
    render(
      <ExpensesListPageView
        expenses={[]}
        isLoading={false}
        isError={false}
        onAddExpense={vi.fn()}
        preFillOptions={[makePreFillOption()]}
        onAddExpenseWithPrefill={vi.fn()}
      />,
    );
    expect(
      screen.getByText(EXPENSES_LIST_PAGE_COPY.preFillHeading),
    ).toBeDefined();
  });

  it("does not render the pre-fill section when preFillOptions is empty", () => {
    render(
      <ExpensesListPageView
        expenses={[]}
        isLoading={false}
        isError={false}
        onAddExpense={vi.fn()}
        preFillOptions={[]}
        onAddExpenseWithPrefill={vi.fn()}
      />,
    );
    expect(
      screen.queryByText(EXPENSES_LIST_PAGE_COPY.preFillHeading),
    ).toBeNull();
  });

  it("does not render the pre-fill section when preFillOptions is undefined", () => {
    render(
      <ExpensesListPageView
        expenses={[]}
        isLoading={false}
        isError={false}
        onAddExpense={vi.fn()}
      />,
    );
    expect(
      screen.queryByText(EXPENSES_LIST_PAGE_COPY.preFillHeading),
    ).toBeNull();
  });

  it("renders a pill for each pre-fill option", () => {
    render(
      <ExpensesListPageView
        expenses={[]}
        isLoading={false}
        isError={false}
        onAddExpense={vi.fn()}
        preFillOptions={[
          makePreFillOption({ entityId: "e-1", label: "Lyon Hotel" }),
          makePreFillOption({ entityId: "e-2", label: "Paris Train" }),
        ]}
        onAddExpenseWithPrefill={vi.fn()}
      />,
    );
    expect(screen.getByText("Lyon Hotel")).toBeDefined();
    expect(screen.getByText("Paris Train")).toBeDefined();
  });

  it("calls onAddExpenseWithPrefill with the option when a pill is clicked", () => {
    const onAddExpenseWithPrefill = vi.fn();
    const option = makePreFillOption({
      entityId: "lodging-1",
      label: "Lyon Hotel",
    });
    render(
      <ExpensesListPageView
        expenses={[]}
        isLoading={false}
        isError={false}
        onAddExpense={vi.fn()}
        preFillOptions={[option]}
        onAddExpenseWithPrefill={onAddExpenseWithPrefill}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Lyon Hotel" }));
    expect(onAddExpenseWithPrefill).toHaveBeenCalledWith(option);
  });
});
