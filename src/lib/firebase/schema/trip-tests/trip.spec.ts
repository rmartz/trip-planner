import { describe, it, expect } from "vitest";
import { Timestamp } from "firebase/firestore";
import { firebaseToTrip, tripToFirebase } from "../trip";

function makeTimestamp(iso: string) {
  return Timestamp.fromDate(new Date(iso));
}

const START = "2025-06-01T00:00:00Z";
const END = "2025-06-08T00:00:00Z";
const CREATED_AT = "2025-01-15T12:00:00Z";
const MEMBER_UIDS = ["uid-1", "uid-2"];

describe("firebaseToTrip", () => {
  it("maps tripId from argument", () => {
    const trip = firebaseToTrip("trip-abc", {
      name: "Paris Trip",
      startDate: makeTimestamp(START),
      endDate: makeTimestamp(END),
      createdAt: makeTimestamp(CREATED_AT),
      createdBy: "uid-123",
    });
    expect(trip.tripId).toBe("trip-abc");
  });

  it("maps name", () => {
    const trip = firebaseToTrip("t1", {
      name: "Alps Adventure",
      startDate: makeTimestamp(START),
      endDate: makeTimestamp(END),
      createdAt: makeTimestamp(CREATED_AT),
      createdBy: "uid-123",
    });
    expect(trip.name).toBe("Alps Adventure");
  });

  it("converts startDate Timestamp to Date", () => {
    const trip = firebaseToTrip("t1", {
      name: "x",
      startDate: makeTimestamp(START),
      endDate: makeTimestamp(END),
      createdAt: makeTimestamp(CREATED_AT),
      createdBy: "uid-x",
    });
    expect(trip.startDate.toISOString()).toBe(new Date(START).toISOString());
  });

  it("converts endDate Timestamp to Date", () => {
    const trip = firebaseToTrip("t1", {
      name: "x",
      startDate: makeTimestamp(START),
      endDate: makeTimestamp(END),
      createdAt: makeTimestamp(CREATED_AT),
      createdBy: "uid-x",
    });
    expect(trip.endDate.toISOString()).toBe(new Date(END).toISOString());
  });

  it("maps createdBy", () => {
    const trip = firebaseToTrip("t1", {
      name: "x",
      startDate: makeTimestamp(START),
      endDate: makeTimestamp(END),
      createdAt: makeTimestamp(CREATED_AT),
      createdBy: "uid-owner",
    });
    expect(trip.createdBy).toBe("uid-owner");
  });

  it("maps memberUids", () => {
    const trip = firebaseToTrip("t1", {
      name: "x",
      startDate: makeTimestamp(START),
      endDate: makeTimestamp(END),
      createdAt: makeTimestamp(CREATED_AT),
      createdBy: "uid-owner",
      memberUids: MEMBER_UIDS,
    });
    expect(trip.memberUids).toEqual(MEMBER_UIDS);
  });

  it("falls back to current time when startDate is absent", () => {
    const before = Date.now();
    const trip = firebaseToTrip("t1", { name: "x", createdBy: "uid-x" });
    const after = Date.now();
    expect(trip.startDate.getTime()).toBeGreaterThanOrEqual(before);
    expect(trip.startDate.getTime()).toBeLessThanOrEqual(after);
  });
});

describe("tripToFirebase", () => {
  it("maps name", () => {
    const data = tripToFirebase({
      name: "Road Trip",
      startDate: new Date(START),
      endDate: new Date(END),
      createdAt: new Date(CREATED_AT),
      createdBy: "uid-x",
      memberUids: MEMBER_UIDS,
      inviteToken: "tok-1",
    });
    expect(data.name).toBe("Road Trip");
  });

  it("converts startDate to Timestamp", () => {
    const date = new Date(START);
    const data = tripToFirebase({
      name: "x",
      startDate: date,
      endDate: new Date(END),
      createdAt: new Date(CREATED_AT),
      createdBy: "uid-x",
      memberUids: MEMBER_UIDS,
      inviteToken: "tok-1",
    });
    expect(data.startDate.toDate().toISOString()).toBe(date.toISOString());
  });

  it("maps createdBy", () => {
    const data = tripToFirebase({
      name: "x",
      startDate: new Date(START),
      endDate: new Date(END),
      createdAt: new Date(CREATED_AT),
      createdBy: "uid-owner",
      memberUids: MEMBER_UIDS,
      inviteToken: "tok-1",
    });
    expect(data.createdBy).toBe("uid-owner");
  });

  it("maps memberUids", () => {
    const data = tripToFirebase({
      name: "x",
      startDate: new Date(START),
      endDate: new Date(END),
      createdAt: new Date(CREATED_AT),
      createdBy: "uid-owner",
      memberUids: MEMBER_UIDS,
      inviteToken: "tok-1",
    });
    expect(data.memberUids).toEqual(MEMBER_UIDS);
  });
});
