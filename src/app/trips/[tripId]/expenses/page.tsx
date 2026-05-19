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
  // ActivityRsvp and LodgingUnit shortcuts are omitted here because activity
  // and lodging records each carry their own IDs (activityId, lodgingId) that
  // are distinct from the stop they belong to. Using stop.stopId as the entity
  // ID would produce a type/ID mismatch in persisted expenses. These options
  // will be wired once the activity and lodging hooks expose their entity IDs
  // directly (tracked in #57).
  const stopPreFillOptions: ExpensePreFillOption[] = (
    stopsData?.stops ?? []
  ).map((stop) => ({
    // stop.memberUids mirrors the trip's full membership list (scaffold); no
    // per-stop attendance tracking is available yet (#57).
    entityId: stop.stopId,
    label: `${EXPENSES_LIST_PAGE_COPY.preFillStopAttendanceLabel}: ${stop.name}`,
    participantMemberIds: [...new Set(stop.memberUids)],
    type: ExpensePreFillType.StopAttendance,
  }));
  const legPreFillOptions: ExpensePreFillOption[] = (legsData?.legs ?? []).map(
    (leg) => ({
      // leg.memberUids mirrors the trip's full membership list (scaffold); no
      // per-leg rider list is available yet (#57).
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
    switch (type) {
      case ExpensePreFillType.StopAttendance:
        return ExpenseLinkedEntityType.Stop;
      case ExpensePreFillType.TransportLeg:
        return ExpenseLinkedEntityType.Leg;
      case ExpensePreFillType.ActivityRsvp:
      case ExpensePreFillType.LodgingUnit:
        // Not yet wired — real entity IDs are not exposed by the stop record.
        // Update this function when #57 lands.
        throw new Error(
          `${type} is not yet mapped to an ExpenseLinkedEntityType. See #57`,
        );
      default: {
        const _exhaustive: never = type;
        throw new Error(`Unhandled ExpensePreFillType: ${String(_exhaustive)}`);
      }
    }
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
    </AppShell>
  );
}
