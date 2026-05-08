import { describe, it, expect } from "vitest";
import { firebaseToLeg, legToFirebase } from "../trip";

const MEMBER_UIDS = ["uid-1", "uid-2"];

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
