import { describe, expect, it } from "vitest";
import { toDateKey } from "./dates";

describe("toDateKey — formats a Date to YYYY-MM-DD using local time", () => {
  it("returns a zero-padded month", () => {
    expect(toDateKey(new Date(2026, 0, 15))).toBe("2026-01-15");
  });

  it("returns a zero-padded day", () => {
    expect(toDateKey(new Date(2026, 5, 3))).toBe("2026-06-03");
  });

  it("handles December (month index 11)", () => {
    expect(toDateKey(new Date(2026, 11, 31))).toBe("2026-12-31");
  });

  it("handles a double-digit month and double-digit day without extra padding", () => {
    expect(toDateKey(new Date(2026, 9, 20))).toBe("2026-10-20");
  });
});
