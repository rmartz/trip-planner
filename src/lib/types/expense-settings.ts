import { createEnumGuard } from "@/lib/enum-guard";

export enum ExpenseSettingsCategory {
  Activities = "activities",
  Food = "food",
  Lodging = "lodging",
  Other = "other",
  Transport = "transport",
}

export enum ExpenseUnitModel {
  PerUnit = "per_unit",
  SharedBucket = "shared_bucket",
  UsageShare = "usage_share",
}

export const isExpenseUnitModel = createEnumGuard(ExpenseUnitModel);

export interface ExpenseCategorySettings {
  defaultParticipantMemberIds: string[] | null;
  unitModel: ExpenseUnitModel;
}

export type ExpenseSettingsMap = Record<
  ExpenseSettingsCategory,
  ExpenseCategorySettings
>;
