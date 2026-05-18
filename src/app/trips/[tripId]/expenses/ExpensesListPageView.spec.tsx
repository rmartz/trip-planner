import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  ExpenseCategory,
  type ExpenseListItem,
  type ExpensePreFillOption,
  ExpensePreFillType,
  ExpensesListPageView,
} from "./ExpensesListPageView";
import { EXPENSES_LIST_PAGE_COPY } from "./ExpensesListPageView.copy";

afterEach(cleanup);

function makeExpense(
  overrides: Partial<ExpenseListItem> = {},
): ExpenseListItem {
  return {
    amountCents: 4250,
    category: ExpenseCategory.Food,
    currency: "USD",
    expenseId: "exp-1",
    payerName: "Alice",
    title: "Dinner",
    ...overrides,
  };
}

describe("ExpensesListPageView — loading state", () => {
  it("renders loading text when isLoading is true", () => {
    render(
      <ExpensesListPageView
        expenses={[]}
        isLoading={true}
        isError={false}
        onAddExpense={vi.fn()}
      />,
    );
    expect(screen.getByText(EXPENSES_LIST_PAGE_COPY.loadingText)).toBeDefined();
  });

  it("does not render the expense list when loading", () => {
    const { container } = render(
      <ExpensesListPageView
        expenses={[makeExpense()]}
        isLoading={true}
        isError={false}
        onAddExpense={vi.fn()}
      />,
    );
    expect(container.querySelector("[data-testid=expense-list]")).toBeNull();
  });
});

describe("ExpensesListPageView — error state", () => {
  it("renders error text when isError is true", () => {
    render(
      <ExpensesListPageView
        expenses={[]}
        isLoading={false}
        isError={true}
        onAddExpense={vi.fn()}
      />,
    );
    expect(screen.getByText(EXPENSES_LIST_PAGE_COPY.errorText)).toBeDefined();
  });

  it("does not render the expense list when in error state", () => {
    const { container } = render(
      <ExpensesListPageView
        expenses={[makeExpense()]}
        isLoading={false}
        isError={true}
        onAddExpense={vi.fn()}
      />,
    );
    expect(container.querySelector("[data-testid=expense-list]")).toBeNull();
  });
});

describe("ExpensesListPageView — empty state", () => {
  it("renders empty text when no expenses are logged", () => {
    render(
      <ExpensesListPageView
        expenses={[]}
        isLoading={false}
        isError={false}
        onAddExpense={vi.fn()}
      />,
    );
    expect(screen.getByText(EXPENSES_LIST_PAGE_COPY.emptyText)).toBeDefined();
  });
});

describe("ExpensesListPageView — heading", () => {
  it("renders the page heading", () => {
    render(
      <ExpensesListPageView
        expenses={[]}
        isLoading={false}
        isError={false}
        onAddExpense={vi.fn()}
      />,
    );
    expect(screen.getByText(EXPENSES_LIST_PAGE_COPY.heading)).toBeDefined();
  });

  it("renders the heading subtext", () => {
    render(
      <ExpensesListPageView
        expenses={[]}
        isLoading={false}
        isError={false}
        onAddExpense={vi.fn()}
      />,
    );
    expect(
      screen.getByText(EXPENSES_LIST_PAGE_COPY.headingSubtext),
    ).toBeDefined();
  });
});

describe("ExpensesListPageView — loaded state (expense list)", () => {
  it("renders one row per logged expense", () => {
    const { container } = render(
      <ExpensesListPageView
        expenses={[
          makeExpense({ expenseId: "e-1", title: "Lunch" }),
          makeExpense({ expenseId: "e-2", title: "Taxi" }),
          makeExpense({ expenseId: "e-3", title: "Hotel" }),
        ]}
        isLoading={false}
        isError={false}
        onAddExpense={vi.fn()}
      />,
    );
    const list = container.querySelector("[data-testid=expense-list]");
    expect(list?.children.length).toBe(3);
  });

  it("renders each expense's title", () => {
    render(
      <ExpensesListPageView
        expenses={[
          makeExpense({ expenseId: "e-1", title: "Lunch" }),
          makeExpense({ expenseId: "e-2", title: "Taxi" }),
        ]}
        isLoading={false}
        isError={false}
        onAddExpense={vi.fn()}
      />,
    );
    expect(screen.getByText("Lunch")).toBeDefined();
    expect(screen.getByText("Taxi")).toBeDefined();
  });

  it("renders each expense's payer name", () => {
    render(
      <ExpensesListPageView
        expenses={[
          makeExpense({ expenseId: "e-1", payerName: "Alice" }),
          makeExpense({ expenseId: "e-2", payerName: "Bob" }),
        ]}
        isLoading={false}
        isError={false}
        onAddExpense={vi.fn()}
      />,
    );
    expect(screen.getByText(/Alice/)).toBeDefined();
    expect(screen.getByText(/Bob/)).toBeDefined();
  });

  it("renders each expense's formatted amount", () => {
    render(
      <ExpensesListPageView
        expenses={[
          makeExpense({
            expenseId: "e-1",
            amountCents: 4250,
            currency: "USD",
          }),
        ]}
        isLoading={false}
        isError={false}
        onAddExpense={vi.fn()}
      />,
    );
    expect(screen.getByText("$42.50")).toBeDefined();
  });

  it("renders the category for each expense", () => {
    render(
      <ExpensesListPageView
        expenses={[
          makeExpense({ expenseId: "e-1", category: ExpenseCategory.Lodging }),
        ]}
        isLoading={false}
        isError={false}
        onAddExpense={vi.fn()}
      />,
    );
    expect(screen.getByText(/Lodging/)).toBeDefined();
  });

  it("renders the linked entity label when provided", () => {
    render(
      <ExpensesListPageView
        expenses={[
          makeExpense({
            expenseId: "e-1",
            linkedEntityLabel: "Paris — Day 2",
          }),
        ]}
        isLoading={false}
        isError={false}
        onAddExpense={vi.fn()}
      />,
    );
    expect(screen.getByText(/Paris — Day 2/)).toBeDefined();
  });

  it("omits the linked entity row when undefined", () => {
    render(
      <ExpensesListPageView
        expenses={[
          makeExpense({ expenseId: "e-1", linkedEntityLabel: undefined }),
        ]}
        isLoading={false}
        isError={false}
        onAddExpense={vi.fn()}
      />,
    );
    expect(
      screen.queryByText(EXPENSES_LIST_PAGE_COPY.linkedEntityLabel),
    ).toBeNull();
  });
});

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

describe("ExpensesListPageView — add expense entry point", () => {
  it("renders the add-expense button", () => {
    render(
      <ExpensesListPageView
        expenses={[]}
        isLoading={false}
        isError={false}
        onAddExpense={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", {
        name: EXPENSES_LIST_PAGE_COPY.addExpenseButton,
      }),
    ).toBeDefined();
  });

  it("invokes onAddExpense when the add-expense button is clicked", () => {
    const onAddExpense = vi.fn();
    render(
      <ExpensesListPageView
        expenses={[]}
        isLoading={false}
        isError={false}
        onAddExpense={onAddExpense}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: EXPENSES_LIST_PAGE_COPY.addExpenseButton,
      }),
    );
    expect(onAddExpense).toHaveBeenCalledTimes(1);
  });
});
