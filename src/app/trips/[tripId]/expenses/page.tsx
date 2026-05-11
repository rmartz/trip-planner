"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { useTrip } from "@/hooks/use-trip";
import {
  ExpenseCategory,
  ExpensesListPageView,
  type ExpenseListItem,
} from "./ExpensesListPageView";
import { EXPENSES_LIST_PAGE_COPY } from "./ExpensesListPageView.copy";

const STUB_EXPENSES: ExpenseListItem[] = [
  {
    amountCents: 4250,
    category: ExpenseCategory.Food,
    currency: "USD",
    expenseId: "stub-1",
    linkedEntityLabel: "Paris — Day 2",
    payerName: "Alice",
    title: "Dinner at Le Marais",
  },
  {
    amountCents: 12000,
    category: ExpenseCategory.Transport,
    currency: "USD",
    expenseId: "stub-2",
    linkedEntityLabel: "Paris → Lyon",
    payerName: "Bob",
    title: "Train tickets",
  },
  {
    amountCents: 32000,
    category: ExpenseCategory.Lodging,
    currency: "USD",
    expenseId: "stub-3",
    linkedEntityLabel: "Lyon",
    payerName: "Carol",
    title: "Hotel night",
  },
];

export default function ExpensesPage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const tripId = params.tripId;

  const { data: trip, isLoading, isError } = useTrip(tripId);

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: trip?.name ?? EXPENSES_LIST_PAGE_COPY.pageTitle,
        onBack: () => {
          router.push(`/trips/${tripId}`);
        },
      }}
    >
      <ExpensesListPageView
        expenses={STUB_EXPENSES}
        isLoading={isLoading}
        isError={isError}
        onAddExpense={() => {
          router.push(`/trips/${tripId}/expenses/new`);
        }}
      />
    </AppShell>
  );
}
