"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { useLegs } from "@/hooks/use-legs";
import { useStops } from "@/hooks/use-stops";
import { useTrip } from "@/hooks/use-trip";
import { ExpenseLinkedEntityType } from "@/lib/types/expense";
import {
  ExpenseCategory,
  type ExpenseListItem,
  type ExpensePreFillOption,
  ExpensePreFillType,
  ExpensesListPageView,
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
  const { data: legsData } = useLegs(tripId);
  const { data: stopsData } = useStops(tripId);
  const stopPreFillOptions: ExpensePreFillOption[] = (
    stopsData?.stops ?? []
  ).flatMap((stop) => {
    const participantMemberIds = [...new Set(stop.memberUids)];
    return [
      {
        entityId: stop.stopId,
        label: `${EXPENSES_LIST_PAGE_COPY.preFillActivityRsvpLabel}: ${stop.name}`,
        participantMemberIds,
        type: ExpensePreFillType.ActivityRsvp,
      },
      {
        entityId: stop.stopId,
        label: `${EXPENSES_LIST_PAGE_COPY.preFillLodgingUnitLabel}: ${stop.name}`,
        participantMemberIds,
        type: ExpensePreFillType.LodgingUnit,
      },
      {
        entityId: stop.stopId,
        label: `${EXPENSES_LIST_PAGE_COPY.preFillStopAttendanceLabel}: ${stop.name}`,
        participantMemberIds,
        type: ExpensePreFillType.StopAttendance,
      },
    ];
  });
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
    if (type === ExpensePreFillType.ActivityRsvp) {
      return ExpenseLinkedEntityType.Activity;
    }
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
      {preFillOptions.length > 0 ? (
        <ExpensesListPageView
          expenses={STUB_EXPENSES}
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
      ) : (
        <ExpensesListPageView
          expenses={STUB_EXPENSES}
          isLoading={isLoading}
          isError={isError}
          onAddExpense={() => {
            router.push(`/trips/${tripId}/expenses/new`);
          }}
        />
      )}
    </AppShell>
  );
}
