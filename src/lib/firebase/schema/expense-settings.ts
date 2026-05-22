import type { DocumentData } from "firebase/firestore";
import {
  ExpenseSettingsCategory,
  ExpenseUnitModel,
} from "@/lib/types/expense-settings";
import type {
  ExpenseCategorySettings,
  ExpenseSettingsMap,
} from "@/lib/types/expense-settings";

const UNIT_MODEL_VALUES = new Set(Object.values(ExpenseUnitModel));

function isExpenseUnitModel(value: unknown): value is ExpenseUnitModel {
  return UNIT_MODEL_VALUES.has(value as ExpenseUnitModel);
}

function toUids(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function parseCategorySettings(
  raw: unknown,
  defaultModel: ExpenseUnitModel,
): ExpenseCategorySettings {
  if (raw === null || raw === undefined || typeof raw !== "object") {
    return { unitModel: defaultModel, defaultParticipantMemberIds: [] };
  }
  const obj = raw as Record<string, unknown>;
  const unitModel = isExpenseUnitModel(obj["unitModel"])
    ? obj["unitModel"]
    : defaultModel;
  return {
    unitModel,
    defaultParticipantMemberIds: toUids(obj["defaultParticipantMemberIds"]),
  };
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
  { unitModel: string; defaultParticipantMemberIds: string[] }
> {
  const result: Record<
    string,
    { unitModel: string; defaultParticipantMemberIds: string[] }
  > = {};
  for (const [category, config] of Object.entries(settings)) {
    result[category] = {
      unitModel: config.unitModel,
      defaultParticipantMemberIds: config.defaultParticipantMemberIds,
    };
  }
  return result;
}
