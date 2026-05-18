"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { useTrip } from "@/hooks/use-trip";
import { useCreateExpense } from "@/hooks/use-create-expense";
import { useLegs } from "@/hooks/use-legs";
import { useStops } from "@/hooks/use-stops";
import { useTripMembers } from "@/hooks/use-trip-members";
import {
  ExpenseCategory,
  ExpenseLinkedEntityType,
  ExpenseSplitMethod,
} from "@/lib/types/expense";
import type { ExpenseLinkedEntity } from "@/lib/types/expense";
import {
  ExpenseEntryFormView,
  type ExpenseEntryLinkedEntityOption,
  type ExpenseEntryMemberOption,
} from "./ExpenseEntryFormView";
import { EXPENSE_ENTRY_FORM_COPY } from "./ExpenseEntryFormView.copy";

interface LinkedEntityMeta {
  entityId: string;
  label: string;
  type: ExpenseLinkedEntityType;
}

export default function NewExpensePage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const tripId = params.tripId;

  const { data: trip } = useTrip(tripId);
  const { data: members } = useTripMembers(tripId);
  const { data: stopsData } = useStops(tripId);
  const { data: legsData } = useLegs(tripId);
  const createExpense = useCreateExpense(tripId);

  const memberOptions: ExpenseEntryMemberOption[] = (members ?? []).map(
    (m) => ({
      memberId: m.uid,
      name: m.displayName ?? m.uid,
    }),
  );

  const linkedEntityMetas: LinkedEntityMeta[] = [
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
  ];

  const linkedEntityOptions: ExpenseEntryLinkedEntityOption[] =
    linkedEntityMetas.map(({ entityId, label }) => ({ entityId, label }));

  function resolveLinkedEntity(
    entityId: string,
  ): ExpenseLinkedEntity | undefined {
    const meta = linkedEntityMetas.find((m) => m.entityId === entityId);
    if (!meta) return undefined;
    return { entityId: meta.entityId, label: meta.label, type: meta.type };
  }

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
      <ExpenseEntryFormView
        initialPayerId={initialPayerId}
        isSubmitting={createExpense.isPending}
        memberOptions={memberOptions}
        linkedEntityOptions={linkedEntityOptions}
        onSubmit={(input) => {
          const linkedEntity =
            input.linkedEntityId !== undefined
              ? resolveLinkedEntity(input.linkedEntityId)
              : undefined;

          createExpense.mutate(
            {
              tripId,
              name: input.description ?? "",
              amount: input.amountCents / 100,
              currency: input.currency,
              category: input.category as unknown as ExpenseCategory,
              payerUid: input.payerMemberId,
              participantUids: input.participantMemberIds,
              splitMethod: ExpenseSplitMethod.Even,
              ...(linkedEntity !== undefined ? { linkedEntity } : {}),
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
    </AppShell>
  );
}
