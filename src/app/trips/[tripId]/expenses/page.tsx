"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { useTrip } from "@/hooks/use-trip";
import { useExpenses } from "@/hooks/use-expenses";
import { useTripMembers } from "@/hooks/use-trip-members";
import {
  type ExpenseListItem,
  ExpensesListPageView,
} from "./ExpensesListPageView";
import { EXPENSES_LIST_PAGE_COPY } from "./ExpensesListPageView.copy";

export default function ExpensesPage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const tripId = params.tripId;

  const {
    data: trip,
    isLoading: tripLoading,
    isError: tripError,
  } = useTrip(tripId);
  const {
    data: expenses,
    isLoading: expensesLoading,
    isError: expensesError,
  } = useExpenses(tripId);
  const { data: members } = useTripMembers(tripId);

  const memberNameById = new Map(
    members?.map((m) => [m.uid, m.displayName ?? m.uid]) ?? [],
  );

  const isLoading = tripLoading || expensesLoading;
  const isError = tripError || expensesError;

  const expenseItems: ExpenseListItem[] = (expenses ?? []).map((expense) => ({
    amountCents: Math.round(expense.amount * 100),
    category: expense.category,
    currency: expense.currency,
    expenseId: expense.expenseId,
    linkedEntityLabel: expense.linkedEntity?.label,
    payerName: memberNameById.get(expense.payerUid) ?? expense.payerUid,
    title: expense.name,
  }));

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
        expenses={expenseItems}
        isLoading={isLoading}
        isError={isError}
        onAddExpense={() => {
          router.push(`/trips/${tripId}/expenses/new`);
        }}
      />
    </AppShell>
  );
}
