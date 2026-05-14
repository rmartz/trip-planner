import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  ExpenseSettingsCategory,
  type ExpenseSettingsCategoryConfig,
  type ExpenseSettingsMemberOption,
  ExpenseSettingsPageView,
  ExpenseUnitModel,
} from "./ExpenseSettingsPageView";
import { EXPENSE_SETTINGS_PAGE_COPY } from "./ExpenseSettingsPageView.copy";

afterEach(cleanup);

function makeMember(
  overrides: Partial<ExpenseSettingsMemberOption> = {},
): ExpenseSettingsMemberOption {
  return { memberId: "member-alice", name: "Alice", ...overrides };
}

const DEFAULT_MEMBERS: ExpenseSettingsMemberOption[] = [
  makeMember({ memberId: "member-alice", name: "Alice" }),
  makeMember({ memberId: "member-bob", name: "Bob" }),
  makeMember({ memberId: "member-carol", name: "Carol" }),
];

const DEFAULT_CATEGORIES: ExpenseSettingsCategoryConfig[] = [
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
    category: ExpenseSettingsCategory.Transport,
    categoryLabel: "Transport",
    defaultParticipantMemberIds: ["member-alice"],
    unitModel: ExpenseUnitModel.UsageShare,
  },
];

describe("ExpenseSettingsPageView — heading", () => {
  it("renders the page heading and subtext", () => {
    render(
      <ExpenseSettingsPageView
        initialCategories={DEFAULT_CATEGORIES}
        memberOptions={DEFAULT_MEMBERS}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByText(EXPENSE_SETTINGS_PAGE_COPY.pageHeading),
    ).toBeDefined();
    expect(
      screen.getByText(EXPENSE_SETTINGS_PAGE_COPY.headingSubtext),
    ).toBeDefined();
  });
});

describe("ExpenseSettingsPageView — category list", () => {
  it("renders one row per category", () => {
    const { container } = render(
      <ExpenseSettingsPageView
        initialCategories={DEFAULT_CATEGORIES}
        memberOptions={DEFAULT_MEMBERS}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    const list = container.querySelector(
      "[data-testid=expense-settings-category-list]",
    );
    expect(list?.children.length).toBe(DEFAULT_CATEGORIES.length);
  });

  it("renders each category's label", () => {
    render(
      <ExpenseSettingsPageView
        initialCategories={DEFAULT_CATEGORIES}
        memberOptions={DEFAULT_MEMBERS}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Food")).toBeDefined();
    expect(screen.getByText("Lodging")).toBeDefined();
    expect(screen.getByText("Transport")).toBeDefined();
  });

  it("submits each category's initial unit model unchanged", () => {
    const onSave = vi.fn();
    render(
      <ExpenseSettingsPageView
        initialCategories={DEFAULT_CATEGORIES}
        memberOptions={DEFAULT_MEMBERS}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.submit(screen.getByTestId("expense-settings-form"));

    expect(onSave).toHaveBeenCalledTimes(1);
    const payload = onSave.mock
      .calls[0]?.[0] as ExpenseSettingsCategoryConfig[];
    const food = payload.find(
      (c) => c.category === ExpenseSettingsCategory.Food,
    );
    const lodging = payload.find(
      (c) => c.category === ExpenseSettingsCategory.Lodging,
    );
    expect(food?.unitModel).toBe(ExpenseUnitModel.SharedBucket);
    expect(lodging?.unitModel).toBe(ExpenseUnitModel.PerUnit);
  });
});

describe("ExpenseSettingsPageView — unit model change", () => {
  it("includes updated unit model in saved payload", () => {
    const onSave = vi.fn();
    render(
      <ExpenseSettingsPageView
        initialCategories={DEFAULT_CATEGORIES}
        memberOptions={DEFAULT_MEMBERS}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.change(
      screen.getByLabelText(EXPENSE_SETTINGS_PAGE_COPY.unitModelColumnHeading, {
        selector: "#unit-model-food",
      }),
      { target: { value: ExpenseUnitModel.UsageShare } },
    );
    fireEvent.submit(screen.getByTestId("expense-settings-form"));

    expect(onSave).toHaveBeenCalledTimes(1);
    const payload = onSave.mock
      .calls[0]?.[0] as ExpenseSettingsCategoryConfig[];
    const food = payload.find(
      (c) => c.category === ExpenseSettingsCategory.Food,
    );
    expect(food?.unitModel).toBe(ExpenseUnitModel.UsageShare);
  });
});

describe("ExpenseSettingsPageView — default participants", () => {
  it("excludes deselected members from saved payload", () => {
    const onSave = vi.fn();
    render(
      <ExpenseSettingsPageView
        initialCategories={DEFAULT_CATEGORIES}
        memberOptions={DEFAULT_MEMBERS}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );

    // Bob is initially in Food's defaults; uncheck him in the Food row.
    const foodRow = screen
      .getAllByTestId("expense-settings-category-row")
      .find((row) => row.textContent.includes("Food"));
    const bobCheckbox = foodRow!.querySelector(
      'input[type=checkbox][value="member-bob"]',
    );
    expect(bobCheckbox).not.toBeNull();
    fireEvent.click(bobCheckbox!);

    fireEvent.submit(screen.getByTestId("expense-settings-form"));

    expect(onSave).toHaveBeenCalledTimes(1);
    const payload = onSave.mock
      .calls[0]?.[0] as ExpenseSettingsCategoryConfig[];
    const food = payload.find(
      (c) => c.category === ExpenseSettingsCategory.Food,
    );
    expect(food?.defaultParticipantMemberIds).toEqual([
      "member-alice",
      "member-carol",
    ]);
  });
});

describe("ExpenseSettingsPageView — save & cancel", () => {
  it("calls onSave with all categories when submitted", () => {
    const onSave = vi.fn();
    render(
      <ExpenseSettingsPageView
        initialCategories={DEFAULT_CATEGORIES}
        memberOptions={DEFAULT_MEMBERS}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.submit(screen.getByTestId("expense-settings-form"));

    expect(onSave).toHaveBeenCalledTimes(1);
    const payload = onSave.mock
      .calls[0]?.[0] as ExpenseSettingsCategoryConfig[];
    expect(payload.length).toBe(DEFAULT_CATEGORIES.length);
  });

  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(
      <ExpenseSettingsPageView
        initialCategories={DEFAULT_CATEGORIES}
        memberOptions={DEFAULT_MEMBERS}
        onSave={vi.fn()}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: EXPENSE_SETTINGS_PAGE_COPY.cancelButton,
      }),
    );

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
