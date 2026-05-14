import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import {
  firebaseToUnavailableRange,
  unavailableRangeToFirebase,
} from "./unavailable-range";

const START = "2025-06-01T00:00:00Z";
const END = "2025-06-07T00:00:00Z";

describe("firebaseToUnavailableRange", () => {
  it("maps rangeId from argument", () => {
    const range = firebaseToUnavailableRange("range-1", "user-1", {
      startDate: Timestamp.fromDate(new Date(START)),
      endDate: Timestamp.fromDate(new Date(END)),
    });
    expect(range.rangeId).toBe("range-1");
  });

  it("maps uid from argument", () => {
    const range = firebaseToUnavailableRange("range-1", "user-99", {
      startDate: Timestamp.fromDate(new Date(START)),
      endDate: Timestamp.fromDate(new Date(END)),
    });
    expect(range.uid).toBe("user-99");
  });

  it("converts startDate Timestamp to Date", () => {
    const date = new Date(START);
    const range = firebaseToUnavailableRange("range-1", "user-1", {
      startDate: Timestamp.fromDate(date),
      endDate: Timestamp.fromDate(new Date(END)),
    });
    expect(range.startDate.toISOString()).toBe(date.toISOString());
  });

  it("converts endDate Timestamp to Date", () => {
    const date = new Date(END);
    const range = firebaseToUnavailableRange("range-1", "user-1", {
      startDate: Timestamp.fromDate(new Date(START)),
      endDate: Timestamp.fromDate(date),
    });
    expect(range.endDate.toISOString()).toBe(date.toISOString());
  });

  it("maps note when present", () => {
    const range = firebaseToUnavailableRange("range-1", "user-1", {
      startDate: Timestamp.fromDate(new Date(START)),
      endDate: Timestamp.fromDate(new Date(END)),
      note: "work conference",
    });
    expect(range.note).toBe("work conference");
  });

  it("maps note as undefined when absent", () => {
    const range = firebaseToUnavailableRange("range-1", "user-1", {
      startDate: Timestamp.fromDate(new Date(START)),
      endDate: Timestamp.fromDate(new Date(END)),
    });
    expect(range.note).toBeUndefined();
  });
});

describe("unavailableRangeToFirebase", () => {
  it("passes through startDate as Date", () => {
    const date = new Date(START);
    const data = unavailableRangeToFirebase({
      startDate: date,
      endDate: new Date(END),
    });
    expect(data.startDate.toISOString()).toBe(date.toISOString());
  });

  it("passes through endDate as Date", () => {
    const date = new Date(END);
    const data = unavailableRangeToFirebase({
      startDate: new Date(START),
      endDate: date,
    });
    expect(data.endDate.toISOString()).toBe(date.toISOString());
  });

  it("includes note when defined", () => {
    const data = unavailableRangeToFirebase({
      startDate: new Date(START),
      endDate: new Date(END),
      note: "family trip",
    });
    expect(data.note).toBe("family trip");
  });

  it("omits note when undefined", () => {
    const data = unavailableRangeToFirebase({
      startDate: new Date(START),
      endDate: new Date(END),
    });
    expect("note" in data).toBe(false);
  });
});
