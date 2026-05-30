"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { useLegs } from "@/hooks/use-legs";
import { useStops } from "@/hooks/use-stops";
import { useTrip } from "@/hooks/use-trip";
import { useExpenses } from "@/hooks/use-expenses";
import { useTripMembers } from "@/hooks/use-trip-members";
import { ExpenseLinkedEntityType } from "@/lib/types/expense";
import {
  type ExpenseListItem,
  type ExpensePreFillOption,
  ExpensePreFillType,
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
  const { data: legsData } = useLegs(tripId);
  const { data: stopsData } = useStops(tripId);

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

  // ActivityRsvp and LodgingUnit shortcuts are omitted here because activity
  // and lodging records each carry their own IDs (activityId, lodgingId) that
  // are distinct from the stop they belong to. Using stop.stopId as the entity
  // ID would produce a type/ID mismatch in persisted expenses. These options
  // will be wired once the activity and lodging hooks expose their entity IDs
  // directly.
  const stopPreFillOptions: ExpensePreFillOption[] = (
    stopsData?.stops ?? []
  ).map((stop) => ({
    entityId: stop.stopId,
    label: `${EXPENSES_LIST_PAGE_COPY.preFillStopAttendanceLabel}: ${stop.name}`,
    participantMemberIds: [...new Set(stop.memberUids)],
    type: ExpensePreFillType.StopAttendance,
  }));
  const legPreFillOptions: ExpensePreFillOption[] = (legsData?.legs ?? []).map(
    (leg) => ({
      entityId: leg.legId,
      label: `${EXPENSES_LIST_PAGE_COPY.preFillTransportLegLabel}: ${leg.name}`,
      participantMemberIds: [...new Set(leg.memberUids)],
      type: ExpensePreFillType.TransportLeg,
    }),
  );
  const preFillOptions = [...stopPreFillOptions, ...legPreFillOptions];

  function toLinkedEntityType(
    type: ExpensePreFillType,
  ): ExpenseLinkedEntityType {
    if (type === ExpensePreFillType.TransportLeg) {
      return ExpenseLinkedEntityType.Leg;
    }

    return ExpenseLinkedEntityType.Stop;
  }

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
        preFillOptions={preFillOptions}
        onAddExpenseWithPrefill={(option: ExpensePreFillOption) => {
          const preFillSearchParams = new URLSearchParams({
            linkedEntityId: option.entityId,
            linkedEntityLabel: option.label,
            linkedEntityType: toLinkedEntityType(option.type),
            participantMemberIds: option.participantMemberIds.join(","),
          });
          router.push(
            `/trips/${tripId}/expenses/new?${preFillSearchParams.toString()}`,
          );
        }}
        onAddExpense={() => {
          router.push(`/trips/${tripId}/expenses/new`);
        }}
      />
    </AppShell>
  );
}
