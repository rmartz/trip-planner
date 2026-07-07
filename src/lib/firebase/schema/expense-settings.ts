import type { DocumentData } from "firebase/firestore";
import {
  ExpenseSettingsCategory,
  ExpenseUnitModel,
} from "@/lib/types/expense-settings";
import type {
  ExpenseCategorySettings,
  ExpenseSettingsMap,
} from "@/lib/types/expense-settings";
import { toEnumWithDefault, toStringArray } from "./helpers";

function parseCategorySettings(
  raw: unknown,
  defaultModel: ExpenseUnitModel,
): ExpenseCategorySettings {
  if (raw === null || raw === undefined || typeof raw !== "object") {
    return { unitModel: defaultModel, defaultParticipantMemberIds: null };
  }
  const obj = raw as Record<string, unknown>;
  const unitModel = toEnumWithDefault(
    ExpenseUnitModel,
    obj["unitModel"],
    defaultModel,
    "unitModel",
  );
  const rawIds = obj["defaultParticipantMemberIds"];
  const defaultParticipantMemberIds =
    rawIds === undefined || rawIds === null || !Array.isArray(rawIds)
      ? null
      : toStringArray(rawIds, "defaultParticipantMemberIds");
  return { unitModel, defaultParticipantMemberIds };
}

const CATEGORY_DEFAULTS: Record<ExpenseSettingsCategory, ExpenseUnitModel> = {
  [ExpenseSettingsCategory.Activities]: ExpenseUnitModel.UsageShare,
  [ExpenseSettingsCategory.Food]: ExpenseUnitModel.SharedBucket,
  [ExpenseSettingsCategory.Lodging]: ExpenseUnitModel.PerUnit,
  [ExpenseSettingsCategory.Other]: ExpenseUnitModel.SharedBucket,
  [ExpenseSettingsCategory.Transport]: ExpenseUnitModel.UsageShare,
};

export function firebaseToExpenseSettings(
  data: DocumentData,
): ExpenseSettingsMap {
  return {
    [ExpenseSettingsCategory.Activities]: parseCategorySettings(
      data[ExpenseSettingsCategory.Activities],
      CATEGORY_DEFAULTS[ExpenseSettingsCategory.Activities],
    ),
    [ExpenseSettingsCategory.Food]: parseCategorySettings(
      data[ExpenseSettingsCategory.Food],
      CATEGORY_DEFAULTS[ExpenseSettingsCategory.Food],
    ),
    [ExpenseSettingsCategory.Lodging]: parseCategorySettings(
      data[ExpenseSettingsCategory.Lodging],
      CATEGORY_DEFAULTS[ExpenseSettingsCategory.Lodging],
    ),
    [ExpenseSettingsCategory.Other]: parseCategorySettings(
      data[ExpenseSettingsCategory.Other],
      CATEGORY_DEFAULTS[ExpenseSettingsCategory.Other],
    ),
    [ExpenseSettingsCategory.Transport]: parseCategorySettings(
      data[ExpenseSettingsCategory.Transport],
      CATEGORY_DEFAULTS[ExpenseSettingsCategory.Transport],
    ),
  };
}

export function expenseSettingsToFirebase(
  settings: ExpenseSettingsMap,
): Record<
  string,
  { unitModel: string; defaultParticipantMemberIds?: string[] }
> {
  const result: Record<
    string,
    { unitModel: string; defaultParticipantMemberIds?: string[] }
  > = {};
  for (const category of Object.values(ExpenseSettingsCategory)) {
    const config = settings[category];
    const entry: { unitModel: string; defaultParticipantMemberIds?: string[] } =
      { unitModel: config.unitModel };
    if (config.defaultParticipantMemberIds !== null) {
      entry.defaultParticipantMemberIds = config.defaultParticipantMemberIds;
    }
    result[category] = entry;
  }
  return result;
}
