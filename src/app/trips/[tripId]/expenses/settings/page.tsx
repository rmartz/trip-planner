"use client";

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
  const { data: members } = useTripMembers(tripId);
  const { data: settings, isLoading, isError } = useExpenseSettings(tripId);
  const { mutateAsync: updateSettings, isPending: isSubmitting } =
    useUpdateExpenseSettings(tripId);

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
        defaultParticipantMemberIds:
          stored !== undefined && stored.defaultParticipantMemberIds.length > 0
            ? stored.defaultParticipantMemberIds
            : allMemberIds,
      };
    },
  );

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
      {isLoading && (
        <p className="p-4 text-sm text-zinc-500">{COPY.loadingText}</p>
      )}
      {isError && <p className="p-4 text-sm text-red-500">{COPY.errorText}</p>}
      {!isLoading && !isError && (
        <ExpenseSettingsPageView
          initialCategories={initialCategories}
          isSubmitting={isSubmitting}
          memberOptions={memberOptions}
          onSave={(categories) => {
            const settingsMap = Object.fromEntries(
              categories.map((c) => [
                c.category,
                {
                  defaultParticipantMemberIds: c.defaultParticipantMemberIds,
                  unitModel: c.unitModel,
                },
              ]),
            ) as Parameters<typeof updateSettings>[0];
            void updateSettings(settingsMap).then(() => {
              router.push(`/trips/${tripId}/expenses`);
            });
          }}
          onCancel={() => {
            router.push(`/trips/${tripId}/expenses`);
          }}
        />
      )}
    </AppShell>
  );
}
