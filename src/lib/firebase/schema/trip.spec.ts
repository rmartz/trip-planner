import { describe, it, expect } from "vitest";
import { Timestamp } from "firebase/firestore";
import { TripRole } from "@/lib/types/trip";
import {
  firebaseToTrip,
  tripToFirebase,
  firebaseToTripMember,
  tripMemberToFirebase,
  firebaseToStop,
  stopToFirebase,
  firebaseToLeg,
  legToFirebase,
} from "./trip";

// Fixtures
function makeTimestamp(iso: string) {
  return Timestamp.fromDate(new Date(iso));
}

const START = "2025-06-01T00:00:00Z";
const END = "2025-06-08T00:00:00Z";
const CREATED_AT = "2025-01-15T12:00:00Z";
const JOINED_AT = "2025-02-20T09:00:00Z";
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
    });
    expect(data.memberUids).toEqual(MEMBER_UIDS);
  });
});

describe("firebaseToTripMember", () => {
  it("maps uid from argument", () => {
    const member = firebaseToTripMember("uid-abc", "trip-1", {
      role: TripRole.Planner,
      joinedAt: makeTimestamp(JOINED_AT),
    });
    expect(member.uid).toBe("uid-abc");
  });

  it("maps tripId from argument", () => {
    const member = firebaseToTripMember("uid-x", "trip-xyz", {
      role: TripRole.Guest,
      joinedAt: makeTimestamp(JOINED_AT),
    });
    expect(member.tripId).toBe("trip-xyz");
  });

  it("maps planner role", () => {
    const member = firebaseToTripMember("uid-x", "trip-1", {
      role: TripRole.Planner,
      joinedAt: makeTimestamp(JOINED_AT),
    });
    expect(member.role).toBe(TripRole.Planner);
  });

  it("maps guest role", () => {
    const member = firebaseToTripMember("uid-x", "trip-1", {
      role: TripRole.Guest,
      joinedAt: makeTimestamp(JOINED_AT),
    });
    expect(member.role).toBe(TripRole.Guest);
  });

  it("converts joinedAt Timestamp to Date", () => {
    const member = firebaseToTripMember("uid-x", "trip-1", {
      role: TripRole.Guest,
      joinedAt: makeTimestamp(JOINED_AT),
    });
    expect(member.joinedAt.toISOString()).toBe(
      new Date(JOINED_AT).toISOString(),
    );
  });

  it("maps memberUids", () => {
    const member = firebaseToTripMember("uid-x", "trip-1", {
      role: TripRole.Guest,
      joinedAt: makeTimestamp(JOINED_AT),
      memberUids: MEMBER_UIDS,
    });
    expect(member.memberUids).toEqual(MEMBER_UIDS);
  });
});

describe("tripMemberToFirebase", () => {
  it("maps role", () => {
    const data = tripMemberToFirebase({
      uid: "user-1",
      role: TripRole.Planner,
      joinedAt: new Date(JOINED_AT),
      memberUids: MEMBER_UIDS,
    });
    expect(data.role).toBe(TripRole.Planner);
  });

  it("maps uid", () => {
    const data = tripMemberToFirebase({
      uid: "user-2",
      role: TripRole.Guest,
      joinedAt: new Date(JOINED_AT),
      memberUids: MEMBER_UIDS,
    });
    expect(data.uid).toBe("user-2");
  });

  it("converts joinedAt to Timestamp", () => {
    const date = new Date(JOINED_AT);
    const data = tripMemberToFirebase({
      uid: "user-1",
      role: TripRole.Guest,
      joinedAt: date,
      memberUids: MEMBER_UIDS,
    });
    expect(data.joinedAt.toDate().toISOString()).toBe(date.toISOString());
  });

  it("maps memberUids", () => {
    const data = tripMemberToFirebase({
      uid: "user-1",
      role: TripRole.Guest,
      joinedAt: new Date(JOINED_AT),
      memberUids: MEMBER_UIDS,
    });
    expect(data.memberUids).toEqual(MEMBER_UIDS);
  });
});

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

describe("firebaseToLeg", () => {
  it("maps legId from argument", () => {
    const leg = firebaseToLeg("leg-1", "trip-1", {
      fromStopId: "stop-a",
      toStopId: "stop-b",
      order: 1,
    });
    expect(leg.legId).toBe("leg-1");
  });

  it("maps tripId from argument", () => {
    const leg = firebaseToLeg("leg-1", "trip-xyz", {
      fromStopId: "stop-a",
      toStopId: "stop-b",
      order: 1,
    });
    expect(leg.tripId).toBe("trip-xyz");
  });

  it("maps fromStopId", () => {
    const leg = firebaseToLeg("leg-1", "trip-1", {
      fromStopId: "stop-origin",
      toStopId: "stop-dest",
      order: 1,
    });
    expect(leg.fromStopId).toBe("stop-origin");
  });

  it("maps toStopId", () => {
    const leg = firebaseToLeg("leg-1", "trip-1", {
      fromStopId: "stop-a",
      toStopId: "stop-destination",
      order: 1,
    });
    expect(leg.toStopId).toBe("stop-destination");
  });

  it("maps order", () => {
    const leg = firebaseToLeg("leg-1", "trip-1", {
      fromStopId: "stop-a",
      toStopId: "stop-b",
      order: 2,
    });
    expect(leg.order).toBe(2);
  });

  it("maps memberUids", () => {
    const leg = firebaseToLeg("leg-1", "trip-1", {
      fromStopId: "stop-a",
      toStopId: "stop-b",
      order: 2,
      memberUids: MEMBER_UIDS,
    });
    expect(leg.memberUids).toEqual(MEMBER_UIDS);
  });
});

describe("legToFirebase", () => {
  it("maps fromStopId", () => {
    const data = legToFirebase({
      fromStopId: "stop-src",
      toStopId: "stop-dst",
      name: "London to Paris",
      order: 1,
      memberUids: MEMBER_UIDS,
    });
    expect(data.fromStopId).toBe("stop-src");
  });

  it("maps toStopId", () => {
    const data = legToFirebase({
      fromStopId: "stop-src",
      toStopId: "stop-dst",
      name: "London to Paris",
      order: 1,
      memberUids: MEMBER_UIDS,
    });
    expect(data.toStopId).toBe("stop-dst");
  });

  it("maps order", () => {
    const data = legToFirebase({
      fromStopId: "stop-a",
      toStopId: "stop-b",
      name: "London to Paris",
      order: 5,
      memberUids: MEMBER_UIDS,
    });
    expect(data.order).toBe(5);
  });

  it("maps memberUids", () => {
    const data = legToFirebase({
      fromStopId: "stop-a",
      toStopId: "stop-b",
      name: "London to Paris",
      order: 5,
      memberUids: MEMBER_UIDS,
    });
    expect(data.memberUids).toEqual(MEMBER_UIDS);
  });
});
