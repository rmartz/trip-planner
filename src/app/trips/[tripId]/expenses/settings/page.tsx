"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/nav/AppShell";
import { useTrip } from "@/hooks/use-trip";
import { useTripMembers } from "@/hooks/use-trip-members";
import {
  useExpenseSettings,
  useUpdateExpenseSettings,
} from "@/hooks/use-expense-settings";
import {
  ExpenseSettingsCategory,
  type ExpenseSettingsCategoryConfig,
  type ExpenseSettingsMemberOption,
  ExpenseSettingsPageView,
  ExpenseUnitModel,
} from "./ExpenseSettingsPageView";
import { EXPENSE_SETTINGS_PAGE_COPY } from "./ExpenseSettingsPageView.copy";

const COPY = EXPENSE_SETTINGS_PAGE_COPY;

const CATEGORY_LABELS: Record<ExpenseSettingsCategory, string> = {
  [ExpenseSettingsCategory.Activities]: COPY.categoryLabelActivities,
  [ExpenseSettingsCategory.Food]: COPY.categoryLabelFood,
  [ExpenseSettingsCategory.Lodging]: COPY.categoryLabelLodging,
  [ExpenseSettingsCategory.Other]: COPY.categoryLabelOther,
  [ExpenseSettingsCategory.Transport]: COPY.categoryLabelTransport,
};

const CATEGORY_ORDER: ExpenseSettingsCategory[] = [
  ExpenseSettingsCategory.Activities,
  ExpenseSettingsCategory.Food,
  ExpenseSettingsCategory.Lodging,
  ExpenseSettingsCategory.Other,
  ExpenseSettingsCategory.Transport,
];

export default function ExpenseSettingsPage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const tripId = params.tripId;

  const { data: trip } = useTrip(tripId);
  const { data: members, isLoading: isMembersLoading } = useTripMembers(tripId);
  const { data: settings, isLoading, isError } = useExpenseSettings(tripId);
  const { mutateAsync: updateSettings, isPending: isSubmitting } =
    useUpdateExpenseSettings(tripId);

  const [saveError, setSaveError] = useState<string | null>(null);

  const memberOptions: ExpenseSettingsMemberOption[] =
    members?.map((m) => ({
      memberId: m.uid,
      name: m.displayName ?? m.uid,
    })) ?? [];

  const allMemberIds = memberOptions.map((m) => m.memberId);

  const initialCategories: ExpenseSettingsCategoryConfig[] = CATEGORY_ORDER.map(
    (category) => {
      const stored = settings?.[category];
      return {
        category,
        categoryLabel: CATEGORY_LABELS[category],
        unitModel: stored?.unitModel ?? ExpenseUnitModel.SharedBucket,
        // null means "inherit all members"; [] means explicitly no participants
        defaultParticipantMemberIds:
          stored?.defaultParticipantMemberIds ?? allMemberIds,
      };
    },
  );

  const isPageLoading = isLoading || isMembersLoading;

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: trip?.name ?? COPY.pageTitle,
        onBack: () => {
          router.push(`/trips/${tripId}/expenses`);
        },
      }}
    >
      {isPageLoading && (
        <p className="p-4 text-sm text-zinc-500">{COPY.loadingText}</p>
      )}
      {isError && !isPageLoading && (
        <p className="p-4 text-sm text-red-500">{COPY.errorText}</p>
      )}
      {!isPageLoading && !isError && (
        <ExpenseSettingsPageView
          initialCategories={initialCategories}
          isSubmitting={isSubmitting}
          memberOptions={memberOptions}
          onSave={(categories) => {
            const allMemberIdSet = new Set(allMemberIds);
            const settingsMap = Object.fromEntries(
              categories.map((c) => {
                const ids = c.defaultParticipantMemberIds;
                const isAllMembers =
                  ids.length === allMemberIdSet.size &&
                  ids.every((id) => allMemberIdSet.has(id));
                return [
                  c.category,
                  {
                    defaultParticipantMemberIds: isAllMembers ? null : ids,
                    unitModel: c.unitModel,
                  },
                ];
              }),
            ) as Parameters<typeof updateSettings>[0];
            setSaveError(null);
            updateSettings(settingsMap).then(
              () => {
                router.push(`/trips/${tripId}/expenses`);
              },
              (err: unknown) => {
                console.error("Failed to save expense settings", err);
                setSaveError(COPY.saveErrorText);
              },
            );
          }}
          onCancel={() => {
            router.push(`/trips/${tripId}/expenses`);
          }}
        />
      )}
      {saveError !== null && (
        <p className="p-4 text-sm text-red-500">{saveError}</p>
      )}
    </AppShell>
  );
}
