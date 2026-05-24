import { describe, expect, it } from "vitest";
import {
  ExpenseSettingsCategory,
  ExpenseUnitModel,
} from "@/lib/types/expense-settings";
import type { ExpenseCategorySettings } from "@/lib/types/expense-settings";
import {
  expenseSettingsToFirebase,
  firebaseToExpenseSettings,
} from "./expense-settings";

function makeSettings(
  overrides: Partial<ExpenseCategorySettings> = {},
): ExpenseCategorySettings {
  return {
    unitModel: ExpenseUnitModel.SharedBucket,
    defaultParticipantMemberIds: ["uid-a", "uid-b"],
    ...overrides,
  };
}

describe("firebaseToExpenseSettings — defaults when document is empty", () => {
  it("returns usage_share for activities when not stored", () => {
    const result = firebaseToExpenseSettings({});
    expect(result[ExpenseSettingsCategory.Activities].unitModel).toBe(
      ExpenseUnitModel.UsageShare,
    );
  });

  it("returns shared_bucket for food when not stored", () => {
    const result = firebaseToExpenseSettings({});
    expect(result[ExpenseSettingsCategory.Food].unitModel).toBe(
      ExpenseUnitModel.SharedBucket,
    );
  });

  it("returns per_unit for lodging when not stored", () => {
    const result = firebaseToExpenseSettings({});
    expect(result[ExpenseSettingsCategory.Lodging].unitModel).toBe(
      ExpenseUnitModel.PerUnit,
    );
  });

  it("returns shared_bucket for other when not stored", () => {
    const result = firebaseToExpenseSettings({});
    expect(result[ExpenseSettingsCategory.Other].unitModel).toBe(
      ExpenseUnitModel.SharedBucket,
    );
  });

  it("returns usage_share for transport when not stored", () => {
    const result = firebaseToExpenseSettings({});
    expect(result[ExpenseSettingsCategory.Transport].unitModel).toBe(
      ExpenseUnitModel.UsageShare,
    );
  });

  it("returns null for defaultParticipantMemberIds when not stored", () => {
    const result = firebaseToExpenseSettings({});
    expect(
      result[ExpenseSettingsCategory.Food].defaultParticipantMemberIds,
    ).toBeNull();
  });
});

describe("firebaseToExpenseSettings — reads stored values", () => {
  it("reads unitModel from stored document", () => {
    const result = firebaseToExpenseSettings({
      food: { unitModel: "usage_share", defaultParticipantMemberIds: [] },
    });
    expect(result[ExpenseSettingsCategory.Food].unitModel).toBe(
      ExpenseUnitModel.UsageShare,
    );
  });

  it("reads defaultParticipantMemberIds from stored document", () => {
    const result = firebaseToExpenseSettings({
      lodging: {
        unitModel: "per_unit",
        defaultParticipantMemberIds: ["uid-x", "uid-y"],
      },
    });
    expect(
      result[ExpenseSettingsCategory.Lodging].defaultParticipantMemberIds,
    ).toEqual(["uid-x", "uid-y"]);
  });

  it("returns empty array when stored defaultParticipantMemberIds is []", () => {
    const result = firebaseToExpenseSettings({
      food: { unitModel: "shared_bucket", defaultParticipantMemberIds: [] },
    });
    expect(
      result[ExpenseSettingsCategory.Food].defaultParticipantMemberIds,
    ).toEqual([]);
  });

  it("returns null when defaultParticipantMemberIds field is absent from stored entry", () => {
    const result = firebaseToExpenseSettings({
      food: { unitModel: "shared_bucket" },
    });
    expect(
      result[ExpenseSettingsCategory.Food].defaultParticipantMemberIds,
    ).toBeNull();
  });

  it("falls back to default unitModel for invalid stored value", () => {
    const result = firebaseToExpenseSettings({
      food: { unitModel: "totally_invalid", defaultParticipantMemberIds: [] },
    });
    expect(result[ExpenseSettingsCategory.Food].unitModel).toBe(
      ExpenseUnitModel.SharedBucket,
    );
  });

  it("returns null when defaultParticipantMemberIds is a non-array value", () => {
    const result = firebaseToExpenseSettings({
      food: { unitModel: "shared_bucket", defaultParticipantMemberIds: "all" },
    });
    expect(
      result[ExpenseSettingsCategory.Food].defaultParticipantMemberIds,
    ).toBeNull();
  });
});

describe("expenseSettingsToFirebase", () => {
  it("serializes each category's unitModel and defaultParticipantMemberIds", () => {
    const settings = {
      [ExpenseSettingsCategory.Food]: makeSettings({
        unitModel: ExpenseUnitModel.PerUnit,
        defaultParticipantMemberIds: ["uid-1"],
      }),
      [ExpenseSettingsCategory.Lodging]: makeSettings({
        unitModel: ExpenseUnitModel.SharedBucket,
        defaultParticipantMemberIds: ["uid-2", "uid-3"],
      }),
      [ExpenseSettingsCategory.Activities]: makeSettings(),
      [ExpenseSettingsCategory.Other]: makeSettings(),
      [ExpenseSettingsCategory.Transport]: makeSettings(),
    };

    const result = expenseSettingsToFirebase(settings);

    expect(result["food"]).toEqual({
      unitModel: "per_unit",
      defaultParticipantMemberIds: ["uid-1"],
    });
    expect(result["lodging"]).toEqual({
      unitModel: "shared_bucket",
      defaultParticipantMemberIds: ["uid-2", "uid-3"],
    });
  });

  it("omits defaultParticipantMemberIds field when value is null", () => {
    const settings = {
      [ExpenseSettingsCategory.Food]: makeSettings({
        defaultParticipantMemberIds: null,
      }),
      [ExpenseSettingsCategory.Lodging]: makeSettings(),
      [ExpenseSettingsCategory.Activities]: makeSettings(),
      [ExpenseSettingsCategory.Other]: makeSettings(),
      [ExpenseSettingsCategory.Transport]: makeSettings(),
    };

    const result = expenseSettingsToFirebase(settings);

    expect(result["food"]).toEqual({ unitModel: "shared_bucket" });
    expect(result["food"]).not.toHaveProperty("defaultParticipantMemberIds");
  });

  it("only writes known ExpenseSettingsCategory keys", () => {
    const settings = {
      [ExpenseSettingsCategory.Food]: makeSettings(),
      [ExpenseSettingsCategory.Lodging]: makeSettings(),
      [ExpenseSettingsCategory.Activities]: makeSettings(),
      [ExpenseSettingsCategory.Other]: makeSettings(),
      [ExpenseSettingsCategory.Transport]: makeSettings(),
    };

    const result = expenseSettingsToFirebase(settings);

    const knownKeys = new Set(Object.values(ExpenseSettingsCategory));
    for (const key of Object.keys(result)) {
      expect(knownKeys.has(key as ExpenseSettingsCategory)).toBe(true);
    }
  });
});
