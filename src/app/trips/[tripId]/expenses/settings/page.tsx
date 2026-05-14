"use client";

import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { useTrip } from "@/hooks/use-trip";
import {
  ExpenseSettingsCategory,
  type ExpenseSettingsCategoryConfig,
  type ExpenseSettingsMemberOption,
  ExpenseSettingsPageView,
  ExpenseUnitModel,
} from "./ExpenseSettingsPageView";
import { EXPENSE_SETTINGS_PAGE_COPY } from "./ExpenseSettingsPageView.copy";

const STUB_MEMBERS: ExpenseSettingsMemberOption[] = [
  { memberId: "member-alice", name: "Alice" },
  { memberId: "member-bob", name: "Bob" },
  { memberId: "member-carol", name: "Carol" },
];

const STUB_CATEGORIES: ExpenseSettingsCategoryConfig[] = [
  {
    category: ExpenseSettingsCategory.Activities,
    categoryLabel: "Activities",
    defaultParticipantMemberIds: ["member-alice", "member-bob", "member-carol"],
    unitModel: ExpenseUnitModel.UsageShare,
  },
  {
    category: ExpenseSettingsCategory.Food,
    categoryLabel: "Food",
    defaultParticipantMemberIds: ["member-alice", "member-bob", "member-carol"],
    unitModel: ExpenseUnitModel.SharedBucket,
  },
  {
    category: ExpenseSettingsCategory.Lodging,
    categoryLabel: "Lodging",
    defaultParticipantMemberIds: ["member-alice", "member-bob"],
    unitModel: ExpenseUnitModel.PerUnit,
  },
  {
    category: ExpenseSettingsCategory.Other,
    categoryLabel: "Other",
    defaultParticipantMemberIds: ["member-alice", "member-bob", "member-carol"],
    unitModel: ExpenseUnitModel.SharedBucket,
  },
  {
    category: ExpenseSettingsCategory.Transport,
    categoryLabel: "Transport",
    defaultParticipantMemberIds: ["member-alice"],
    unitModel: ExpenseUnitModel.UsageShare,
  },
];

export default function ExpenseSettingsPage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const tripId = params.tripId;

  const { data: trip } = useTrip(tripId);

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: trip?.name ?? EXPENSE_SETTINGS_PAGE_COPY.pageTitle,
        onBack: () => {
          router.push(`/trips/${tripId}/expenses`);
        },
      }}
    >
      <ExpenseSettingsPageView
        initialCategories={STUB_CATEGORIES}
        memberOptions={STUB_MEMBERS}
        onSave={(categories) => {
          // Persistence is out of scope for this scaffold (#60).
          void categories;
          router.push(`/trips/${tripId}/expenses`);
        }}
        onCancel={() => {
          router.push(`/trips/${tripId}/expenses`);
        }}
      />
    </AppShell>
  );
}
