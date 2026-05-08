import { describe, it, expect } from "vitest";
import {
  getUnreadCountPath,
  parseUnreadCount,
  serializeUnreadCount,
} from "./unread-count";

// criterion 3: RTDB unread count helpers for users/{uid}/unreadCount path

describe("getUnreadCountPath — returns RTDB path for user", () => {
  it("returns path for a given uid", () => {
    expect(getUnreadCountPath("uid-abc")).toBe("users/uid-abc/unreadCount");
  });

  it("returns distinct paths for different uids", () => {
    const path1 = getUnreadCountPath("uid-1");
    const path2 = getUnreadCountPath("uid-2");
    expect(path1).not.toBe(path2);
  });
});

describe("parseUnreadCount — converts RTDB value to number", () => {
  it("returns the numeric value when given a number", () => {
    expect(parseUnreadCount(5)).toBe(5);
  });

  it("returns 0 when value is null", () => {
    expect(parseUnreadCount(null)).toBe(0);
  });

  it("returns 0 when value is undefined", () => {
    expect(parseUnreadCount(undefined)).toBe(0);
  });

  it("returns 0 when value is negative", () => {
    expect(parseUnreadCount(-3)).toBe(0);
  });

  it("floors non-integer values", () => {
    expect(parseUnreadCount(2.9)).toBe(2);
  });
});

describe("serializeUnreadCount — validates value before writing to RTDB", () => {
  it("returns a non-negative integer as-is", () => {
    expect(serializeUnreadCount(3)).toBe(3);
  });

  it("returns 0 for 0", () => {
    expect(serializeUnreadCount(0)).toBe(0);
  });

  it("clamps negative values to 0", () => {
    expect(serializeUnreadCount(-1)).toBe(0);
  });

  it("floors non-integer values", () => {
    expect(serializeUnreadCount(4.7)).toBe(4);
  });
});
