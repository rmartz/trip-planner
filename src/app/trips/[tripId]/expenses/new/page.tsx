"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { ExpenseLinkedEntityType } from "@/lib/types/expense";
import { useTrip } from "@/hooks/use-trip";
import {
  ExpenseEntryFormView,
  type ExpenseEntryLinkedEntityOption,
  type ExpenseEntryMemberOption,
} from "./ExpenseEntryFormView";
import { EXPENSE_ENTRY_FORM_COPY } from "./ExpenseEntryFormView.copy";

const STUB_MEMBERS: ExpenseEntryMemberOption[] = [
  { memberId: "member-alice", name: "Alice" },
  { memberId: "member-bob", name: "Bob" },
  { memberId: "member-carol", name: "Carol" },
];

const STUB_LINKED_ENTITIES: ExpenseEntryLinkedEntityOption[] = [
  {
    entityId: "stop-paris",
    label: "Paris stop",
    type: ExpenseLinkedEntityType.Stop,
  },
  {
    entityId: "lodging-1",
    label: "Lyon hotel",
    type: ExpenseLinkedEntityType.Stop,
  },
  {
    entityId: "transport-1",
    label: "Paris → Lyon train",
    type: ExpenseLinkedEntityType.Leg,
  },
];

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

export default function NewExpensePage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = params.tripId;
  const initialParticipantIds = searchParams
    .get("participantMemberIds")
    ?.split(",")
    .filter((id) => id.length > 0);
  const initialLinkedEntityId = searchParams.get("linkedEntityId");
  const initialLinkedEntityLabel = searchParams.get("linkedEntityLabel");
  const initialLinkedEntityType = toExpenseLinkedEntityType(
    searchParams.get("linkedEntityType"),
  );
  const initialLinkedEntity =
    initialLinkedEntityId !== null && initialLinkedEntityType !== undefined
      ? { entityId: initialLinkedEntityId, type: initialLinkedEntityType }
      : undefined;
  const linkedEntityOptions =
    initialLinkedEntity !== undefined &&
    !STUB_LINKED_ENTITIES.some(
      ({ entityId, type }) =>
        entityId === initialLinkedEntity.entityId &&
        type === initialLinkedEntity.type,
    )
      ? [
          ...STUB_LINKED_ENTITIES,
          {
            entityId: initialLinkedEntity.entityId,
            label: initialLinkedEntityLabel ?? initialLinkedEntity.entityId,
            type: initialLinkedEntity.type,
          },
        ]
      : STUB_LINKED_ENTITIES;

  const { data: trip } = useTrip(tripId);

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
        initialLinkedEntity={initialLinkedEntity}
        initialParticipantIds={initialParticipantIds}
        initialPayerId={STUB_MEMBERS[0]?.memberId}
        memberOptions={STUB_MEMBERS}
        linkedEntityOptions={linkedEntityOptions}
        onSubmit={(input) => {
          // Persistence is out of scope for this scaffold (#57).
          void input;
          router.push(`/trips/${tripId}/expenses`);
        }}
        onCancel={() => {
          router.push(`/trips/${tripId}/expenses`);
        }}
      />
    </AppShell>
  );
}
