import { afterEach, describe, expect, it, vi } from "vitest";
import { TimeOfDaySlot, TimeOfDaySlotType } from "@/lib/types/activity";
import { ExpenseLinkedEntityType } from "@/lib/types/expense";
import {
  toDate,
  toEnumOrUndefined,
  toEnumWithDefault,
  toGroupSize,
  toLinkedEntity,
  toStringArray,
  toTimeOfDaySlot,
} from "./helpers";

// Local enum stand-in to exercise the generic enum helpers with controlled values.
enum SampleEnum {
  Alpha = "alpha",
  Beta = "beta",
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("toStringArray", () => {
  it("keeps only string members of an array", () => {
    expect(toStringArray(["a", 1, "b", null, "c"])).toEqual(["a", "b", "c"]);
  });

  it("returns an empty array for a non-array value", () => {
    expect(toStringArray("not-an-array")).toEqual([]);
  });

  it("returns an empty array for an absent value without warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(toStringArray(undefined, "confirmedParticipantUids")).toEqual([]);
    expect(warn).not.toHaveBeenCalled();
  });

  it("warns when a present value is not an array", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    toStringArray(42, "participantUids");
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toContain("participantUids");
  });
});

describe("toEnumWithDefault", () => {
  it("returns the value when it is a valid enum member", () => {
    expect(toEnumWithDefault(SampleEnum, "beta", SampleEnum.Alpha)).toBe(
      SampleEnum.Beta,
    );
  });

  it("falls back to the default for an invalid enum value", () => {
    expect(toEnumWithDefault(SampleEnum, "gamma", SampleEnum.Alpha)).toBe(
      SampleEnum.Alpha,
    );
  });

  it("falls back to the default for an absent value without warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(
      toEnumWithDefault(SampleEnum, undefined, SampleEnum.Beta, "status"),
    ).toBe(SampleEnum.Beta);
    expect(warn).not.toHaveBeenCalled();
  });

  it("warns when a present value is not a valid enum member", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    toEnumWithDefault(SampleEnum, "gamma", SampleEnum.Alpha, "status");
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toContain("status");
  });
});

describe("toEnumOrUndefined", () => {
  it("returns the value when it is a valid enum member", () => {
    expect(toEnumOrUndefined(SampleEnum, "alpha")).toBe(SampleEnum.Alpha);
  });

  it("returns undefined for an invalid enum value", () => {
    expect(toEnumOrUndefined(SampleEnum, "gamma")).toBeUndefined();
  });

  it("returns undefined for an absent value without warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(
      toEnumOrUndefined(SampleEnum, undefined, "unitModel"),
    ).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
  });

  it("warns when a present value is not a valid enum member", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    toEnumOrUndefined(SampleEnum, "gamma", "unitModel");
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toContain("unitModel");
  });
});

describe("toDate", () => {
  it("converts a Timestamp-like value via toDate()", () => {
    const expected = new Date("2026-01-02T03:04:05Z");
    expect(toDate({ toDate: () => expected })).toBe(expected);
  });

  it("falls back to a fresh Date for an absent value", () => {
    const before = Date.now();
    const result = toDate(undefined);
    expect(result.getTime()).toBeGreaterThanOrEqual(before);
  });

  it("falls back to a fresh Date for null", () => {
    expect(toDate(null)).toBeInstanceOf(Date);
  });
});

describe("toLinkedEntity", () => {
  it("parses a valid linked entity", () => {
    const parsed = toLinkedEntity({
      type: ExpenseLinkedEntityType.Stop,
      entityId: "stop-1",
      label: "Wimberley",
    });
    expect(parsed).toEqual({
      type: ExpenseLinkedEntityType.Stop,
      entityId: "stop-1",
      label: "Wimberley",
    });
  });

  it("returns undefined for an absent value without warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(toLinkedEntity(undefined)).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
  });

  it("returns undefined and warns when the entity is missing a field", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(
      toLinkedEntity({ type: ExpenseLinkedEntityType.Stop, entityId: "s-1" }),
    ).toBeUndefined();
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toContain("linkedEntity");
  });

  it("returns undefined for an invalid entity type", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(
      toLinkedEntity({ type: "bogus", entityId: "s-1", label: "L" }),
    ).toBeUndefined();
    expect(warn).toHaveBeenCalledOnce();
  });
});

describe("toTimeOfDaySlot", () => {
  it("parses a valid time-of-day slot", () => {
    const parsed = toTimeOfDaySlot({
      type: TimeOfDaySlotType.PreferredIn,
      slots: [TimeOfDaySlot.Morning, TimeOfDaySlot.Evening],
    });
    expect(parsed).toEqual({
      type: TimeOfDaySlotType.PreferredIn,
      slots: [TimeOfDaySlot.Morning, TimeOfDaySlot.Evening],
    });
  });

  it("returns undefined for an absent value without warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(toTimeOfDaySlot(undefined)).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
  });

  it("returns undefined and warns for an invalid slot type", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(
      toTimeOfDaySlot({ type: "bogus", slots: [TimeOfDaySlot.Morning] }),
    ).toBeUndefined();
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toContain("timeOfDaySlot");
  });

  it("returns undefined and warns when a slot member is invalid", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(
      toTimeOfDaySlot({
        type: TimeOfDaySlotType.MustOccurIn,
        slots: ["not-a-slot"],
      }),
    ).toBeUndefined();
    expect(warn).toHaveBeenCalledOnce();
  });
});

describe("toGroupSize", () => {
  it("parses a valid group size with both bounds", () => {
    expect(toGroupSize({ min: 2, max: 6 })).toEqual({ min: 2, max: 6 });
  });

  it("parses a group size with only a min", () => {
    expect(toGroupSize({ min: 4 })).toEqual({ min: 4 });
  });

  it("returns undefined for an absent value without warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(toGroupSize(undefined)).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
  });

  it("returns undefined and warns for a non-numeric bound", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(toGroupSize({ min: "lots", max: 6 })).toBeUndefined();
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toContain("groupSize");
  });
});
