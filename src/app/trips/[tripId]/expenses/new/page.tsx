"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
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
  { entityId: "stop-paris", label: "Paris stop" },
  { entityId: "lodging-1", label: "Lyon hotel" },
  { entityId: "transport-1", label: "Paris → Lyon train" },
];

export default function NewExpensePage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const tripId = params.tripId;

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
        initialPayerId={STUB_MEMBERS[0]?.memberId}
        memberOptions={STUB_MEMBERS}
        linkedEntityOptions={STUB_LINKED_ENTITIES}
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
