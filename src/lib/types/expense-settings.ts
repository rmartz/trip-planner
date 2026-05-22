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

export interface ExpenseCategorySettings {
  defaultParticipantMemberIds: string[];
  unitModel: ExpenseUnitModel;
}

export type ExpenseSettingsMap = Record<
  ExpenseSettingsCategory,
  ExpenseCategorySettings
>;
