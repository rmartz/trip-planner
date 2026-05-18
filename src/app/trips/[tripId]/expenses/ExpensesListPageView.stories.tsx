import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import {
  ExpenseCategory,
  type ExpenseListItem,
  ExpensesListPageView,
} from "./ExpensesListPageView";

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

const meta: Meta<typeof ExpensesListPageView> = {
  component: ExpensesListPageView,
  args: {
    expenses: [
      makeExpense({
        expenseId: "e-1",
        title: "Dinner at Le Marais",
        amountCents: 4250,
        category: ExpenseCategory.Food,
        payerName: "Alice",
        linkedEntityLabel: "Paris — Day 2",
      }),
      makeExpense({
        expenseId: "e-2",
        title: "Train tickets",
        amountCents: 12000,
        category: ExpenseCategory.Transport,
        payerName: "Bob",
        linkedEntityLabel: "Paris → Lyon",
      }),
      makeExpense({
        expenseId: "e-3",
        title: "Hotel night",
        amountCents: 32000,
        category: ExpenseCategory.Lodging,
        payerName: "Carol",
        linkedEntityLabel: "Lyon",
      }),
      makeExpense({
        expenseId: "e-4",
        title: "Museum tickets",
        amountCents: 2500,
        category: ExpenseCategory.Activity,
        payerName: "Alice",
      }),
    ],
    isLoading: false,
    isError: false,
    onAddExpense: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof ExpensesListPageView>;

export const Loaded: Story = {};

export const Empty: Story = {
  args: {
    expenses: [],
  },
};

export const Loading: Story = {
  args: {
    expenses: [],
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    expenses: [],
    isError: true,
  },
};
