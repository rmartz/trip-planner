"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { Button } from "@/components/ui/button";
import { useActivities } from "@/hooks/use-activities";
import { useCreateExpense } from "@/hooks/use-create-expense";
import { useLegs } from "@/hooks/use-legs";
import { useStops } from "@/hooks/use-stops";
import { useTrip } from "@/hooks/use-trip";
import { useTripMembers } from "@/hooks/use-trip-members";
import {
  ExpenseCategory,
  ExpenseLinkedEntityType,
  ExpenseSplitMethod,
} from "@/lib/types/expense";
import {
  ExpenseEntryCategory,
  ExpenseEntryFormView,
  type ExpenseEntryLinkedEntityOption,
  type ExpenseEntryMemberOption,
} from "./ExpenseEntryFormView";
import { EXPENSE_ENTRY_FORM_COPY } from "./ExpenseEntryFormView.copy";

function toExpenseLinkedEntityType(
  rawType: string | null,
): ExpenseLinkedEntityType | undefined {
  if (
    rawType !== ExpenseLinkedEntityType.Activity &&
    rawType !== ExpenseLinkedEntityType.Leg &&
    rawType !== ExpenseLinkedEntityType.Stop
  ) {
    return undefined;
  }

  return rawType;
}

function toExpenseCategory(category: ExpenseEntryCategory): ExpenseCategory {
  if (category === ExpenseEntryCategory.Activities) {
    return ExpenseCategory.Activity;
  }
  if (category === ExpenseEntryCategory.Lodging) {
    return ExpenseCategory.Lodging;
  }
  if (category === ExpenseEntryCategory.Food) {
    return ExpenseCategory.Food;
  }
  if (category === ExpenseEntryCategory.Transport) {
    return ExpenseCategory.Transport;
  }
  return ExpenseCategory.Other;
}

export default function NewExpensePage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = params.tripId;

  const initialParticipantIds = searchParams
    .get("participantMemberIds")
    ?.split(",")
    .filter((id) => id.trim().length > 0);
  const initialLinkedEntityId = searchParams.get("linkedEntityId");
  const initialLinkedEntityLabel = searchParams.get("linkedEntityLabel");
  const initialLinkedEntityType = toExpenseLinkedEntityType(
    searchParams.get("linkedEntityType"),
  );
  const initialLinkedEntity =
    initialLinkedEntityId !== null && initialLinkedEntityType !== undefined
      ? { entityId: initialLinkedEntityId, type: initialLinkedEntityType }
      : undefined;

  const { data: trip } = useTrip(tripId);
  const {
    data: members,
    isError: membersError,
    refetch: refetchMembers,
  } = useTripMembers(tripId);
  const { data: stopsData } = useStops(tripId);
  const { data: legsData } = useLegs(tripId);
  const { data: activitiesData } = useActivities(tripId);
  const createExpense = useCreateExpense(tripId);

  const memberOptions: ExpenseEntryMemberOption[] = (members ?? []).map(
    (m) => ({
      memberId: m.uid,
      name: m.displayName ?? m.uid,
    }),
  );

  const stopById = new Map((stopsData?.stops ?? []).map((s) => [s.stopId, s]));

  const realLinkedEntityOptions: ExpenseEntryLinkedEntityOption[] = [
    ...(stopsData?.stops ?? []).map((s) => ({
      entityId: s.stopId,
      label: s.name,
      type: ExpenseLinkedEntityType.Stop,
    })),
    ...(legsData?.legs ?? []).map((l) => ({
      entityId: l.legId,
      label: l.name,
      type: ExpenseLinkedEntityType.Leg,
    })),
    ...(activitiesData ?? []).map((a) => {
      const stop = stopById.get(a.stopId);
      const label = stop !== undefined ? `${stop.name}: ${a.name}` : a.name;
      return {
        entityId: a.activityId,
        label,
        type: ExpenseLinkedEntityType.Activity,
      };
    }),
  ];

  const linkedEntityOptions =
    initialLinkedEntity !== undefined &&
    !realLinkedEntityOptions.some(
      ({ entityId, type }) =>
        entityId === initialLinkedEntity.entityId &&
        type === initialLinkedEntity.type,
    )
      ? [
          ...realLinkedEntityOptions,
          {
            entityId: initialLinkedEntity.entityId,
            label: initialLinkedEntityLabel ?? initialLinkedEntity.entityId,
            type: initialLinkedEntity.type,
          },
        ]
      : realLinkedEntityOptions;

  const initialPayerId = members?.[0]?.uid;

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: trip?.name ?? EXPENSE_ENTRY_FORM_COPY.pageTitle,
        onBack: () => {
          router.push(`/trips/${tripId}/expenses`);
        },
      }}
    >
      {membersError && (
        <div className="flex flex-col gap-3 p-4">
          <p className="text-sm text-destructive">
            {EXPENSE_ENTRY_FORM_COPY.membersLoadError}
          </p>
          <Button
            type="button"
            variant="outline"
            className="w-fit"
            onClick={() => {
              void refetchMembers();
            }}
          >
            {EXPENSE_ENTRY_FORM_COPY.retryMembersButton}
          </Button>
        </div>
      )}
      {!membersError && members !== undefined && (
        <ExpenseEntryFormView
          initialLinkedEntity={initialLinkedEntity}
          initialParticipantIds={initialParticipantIds}
          initialPayerId={initialPayerId}
          isSubmitting={createExpense.isPending}
          memberOptions={memberOptions}
          linkedEntityOptions={linkedEntityOptions}
          submitError={
            createExpense.isError
              ? EXPENSE_ENTRY_FORM_COPY.submitError
              : undefined
          }
          onSubmit={(input) => {
            const trimmedDescription = input.description?.trim();
            createExpense.mutate(
              {
                name:
                  trimmedDescription !== undefined && trimmedDescription !== ""
                    ? trimmedDescription
                    : "Expense",
                amount: input.amountCents / 100,
                currency: input.currency,
                category: toExpenseCategory(input.category),
                payerUid: input.payerMemberId,
                participantUids: input.participantMemberIds,
                splitMethod: ExpenseSplitMethod.Even,
                ...(input.linkedEntity !== undefined
                  ? { linkedEntity: input.linkedEntity }
                  : {}),
              },
              {
                onSuccess: () => {
                  router.push(`/trips/${tripId}/expenses`);
                },
              },
            );
          }}
          onCancel={() => {
            router.push(`/trips/${tripId}/expenses`);
          }}
        />
      )}
    </AppShell>
  );
}
