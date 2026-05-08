import { describe, it, expect } from "vitest";
import { Timestamp } from "firebase/firestore";
import { firebaseToStop, stopToFirebase } from "../trip";

function makeTimestamp(iso: string) {
  return Timestamp.fromDate(new Date(iso));
}

const START = "2025-06-01T00:00:00Z";
const END = "2025-06-08T00:00:00Z";
const MEMBER_UIDS = ["uid-1", "uid-2"];

describe("firebaseToStop", () => {
  it("maps stopId from argument", () => {
    const stop = firebaseToStop("stop-1", "trip-1", {
      name: "London",
      startDate: makeTimestamp(START),
      endDate: makeTimestamp(END),
      order: 1,
    });
    expect(stop.stopId).toBe("stop-1");
  });

  it("maps tripId from argument", () => {
    const stop = firebaseToStop("stop-1", "trip-abc", {
      name: "London",
      startDate: makeTimestamp(START),
      endDate: makeTimestamp(END),
      order: 1,
    });
    expect(stop.tripId).toBe("trip-abc");
  });

  it("maps name", () => {
    const stop = firebaseToStop("stop-1", "trip-1", {
      name: "Paris",
      startDate: makeTimestamp(START),
      endDate: makeTimestamp(END),
      order: 2,
    });
    expect(stop.name).toBe("Paris");
  });

  it("maps order", () => {
    const stop = firebaseToStop("stop-1", "trip-1", {
      name: "x",
      startDate: makeTimestamp(START),
      endDate: makeTimestamp(END),
      order: 3,
    });
    expect(stop.order).toBe(3);
  });

  it("converts startDate Timestamp to Date", () => {
    const stop = firebaseToStop("stop-1", "trip-1", {
      name: "x",
      startDate: makeTimestamp(START),
      endDate: makeTimestamp(END),
      order: 1,
    });
    expect(stop.startDate.toISOString()).toBe(new Date(START).toISOString());
  });

  it("maps memberUids", () => {
    const stop = firebaseToStop("stop-1", "trip-1", {
      name: "x",
      startDate: makeTimestamp(START),
      endDate: makeTimestamp(END),
      order: 1,
      memberUids: MEMBER_UIDS,
    });
    expect(stop.memberUids).toEqual(MEMBER_UIDS);
  });
});

describe("stopToFirebase", () => {
  it("maps name", () => {
    const data = stopToFirebase({
      name: "Amsterdam",
      startDate: new Date(START),
      endDate: new Date(END),
      order: 1,
      memberUids: MEMBER_UIDS,
    });
    expect(data.name).toBe("Amsterdam");
  });

  it("maps order", () => {
    const data = stopToFirebase({
      name: "x",
      startDate: new Date(START),
      endDate: new Date(END),
      order: 4,
      memberUids: MEMBER_UIDS,
    });
    expect(data.order).toBe(4);
  });

  it("converts startDate to Timestamp", () => {
    const date = new Date(START);
    const data = stopToFirebase({
      name: "x",
      startDate: date,
      endDate: new Date(END),
      order: 1,
      memberUids: MEMBER_UIDS,
    });
    expect(data.startDate.toDate().toISOString()).toBe(date.toISOString());
  });

  it("maps memberUids", () => {
    const data = stopToFirebase({
      name: "x",
      startDate: new Date(START),
      endDate: new Date(END),
      order: 1,
      memberUids: MEMBER_UIDS,
    });
    expect(data.memberUids).toEqual(MEMBER_UIDS);
  });
});
