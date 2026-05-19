"use client";

import { Button } from "@/components/ui/button";
import { ExpenseCategory } from "@/lib/types/expense";
import { EXPENSES_LIST_PAGE_COPY } from "./ExpensesListPageView.copy";

export { ExpenseCategory };

const COPY = EXPENSES_LIST_PAGE_COPY;

export enum ExpensePreFillType {
  ActivityRsvp = "activity_rsvp",
  LodgingUnit = "lodging_unit",
  StopAttendance = "stop_attendance",
  TransportLeg = "transport_leg",
}

export interface ExpenseListItem {
  amountCents: number;
  category: ExpenseCategory;
  currency: string;
  expenseId: string;
  linkedEntityLabel?: string;
  payerName: string;
  title: string;
}

export interface ExpensePreFillOption {
  entityId: string;
  label: string;
  participantMemberIds: string[];
  type: ExpensePreFillType;
}

interface ExpensesListPageViewBaseProps {
  expenses: ExpenseListItem[];
  isError: boolean;
  isLoading: boolean;
  onAddExpense: () => void;
}

interface ExpensesListPageViewWithPreFillProps extends ExpensesListPageViewBaseProps {
  onAddExpenseWithPrefill: (option: ExpensePreFillOption) => void;
  preFillOptions: ExpensePreFillOption[];
}

interface ExpensesListPageViewWithoutPreFillProps extends ExpensesListPageViewBaseProps {
  onAddExpenseWithPrefill?: undefined;
  preFillOptions?: undefined;
}

export type ExpensesListPageViewProps =
  | ExpensesListPageViewWithPreFillProps
  | ExpensesListPageViewWithoutPreFillProps;

interface ExpenseRowProps {
  expense: ExpenseListItem;
}

function formatAmount(amountCents: number, currency: string): string {
  const amount = amountCents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function categoryLabel(category: ExpenseCategory): string {
  if (category === ExpenseCategory.Activity) return "Activity";
  if (category === ExpenseCategory.Food) return "Food";
  if (category === ExpenseCategory.Lodging) return "Lodging";
  if (category === ExpenseCategory.Transport) return "Transport";
  return "Other";
}

function ExpenseRow({ expense }: ExpenseRowProps) {
  return (
    <li
      data-testid="expense-row"
      className="flex flex-col gap-1 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium">{expense.title}</span>
        <span className="font-mono text-sm tabular-nums">
          {formatAmount(expense.amountCents, expense.currency)}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          {COPY.payerLabel} {expense.payerName}
        </span>
        <span>
          {COPY.categoryLabel} {categoryLabel(expense.category)}
        </span>
        {expense.linkedEntityLabel !== undefined && (
          <span>
            {COPY.linkedEntityLabel} {expense.linkedEntityLabel}
          </span>
        )}
      </div>
    </li>
  );
}

export function ExpensesListPageView({
  expenses,
  isError,
  isLoading,
  onAddExpense,
  onAddExpenseWithPrefill,
  preFillOptions,
}: ExpensesListPageViewProps) {
  const showList = !isLoading && !isError && expenses.length > 0;
  const showEmpty = !isLoading && !isError && expenses.length === 0;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-semibold">{COPY.heading}</h1>
          <p className="font-mono text-xs text-muted-foreground">
            {COPY.headingSubtext}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={onAddExpense}
          data-testid="add-expense-button"
        >
          {COPY.addExpenseButton}
        </Button>
      </header>

      {preFillOptions !== undefined && preFillOptions.length > 0 && (
        <section
          className="flex flex-col gap-2 border-b px-4 py-3"
          data-testid="prefill-shortcuts"
        >
          <p className="text-xs font-medium text-muted-foreground">
            {COPY.preFillHeading}
          </p>
          <div className="flex flex-wrap gap-2">
            {preFillOptions.map((option) => (
              <Button
                key={`${option.type}-${option.entityId}`}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onAddExpenseWithPrefill(option);
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </section>
      )}

      <main className="flex flex-1 flex-col gap-4 p-4">
        {isLoading && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {COPY.loadingText}
          </p>
        )}
        {!isLoading && isError && (
          <p className="text-sm text-red-500 dark:text-red-400">
            {COPY.errorText}
          </p>
        )}
        {showEmpty && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {COPY.emptyText}
          </p>
        )}
        {showList && (
          <ul data-testid="expense-list" className="flex flex-col gap-3">
            {expenses.map((expense) => (
              <ExpenseRow key={expense.expenseId} expense={expense} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
