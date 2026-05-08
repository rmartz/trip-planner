import { describe, it, expect } from "vitest";
import { firebaseToLeg, legToFirebase } from "../trip";

const MEMBER_UIDS = ["uid-1", "uid-2"];

describe("firebaseToLeg — isActive", () => {
  it("maps isActive true when field is true", () => {
    const leg = firebaseToLeg("leg-1", "trip-1", {
      fromStopId: "stop-a",
      toStopId: "stop-b",
      order: 1,
      isActive: true,
    });
    expect(leg.isActive).toBe(true);
  });

  it("maps isActive false when field is false", () => {
    const leg = firebaseToLeg("leg-1", "trip-1", {
      fromStopId: "stop-a",
      toStopId: "stop-b",
      order: 1,
      isActive: false,
    });
    expect(leg.isActive).toBe(false);
  });

  it("defaults isActive to true when field is absent", () => {
    const leg = firebaseToLeg("leg-1", "trip-1", {
      fromStopId: "stop-a",
      toStopId: "stop-b",
      order: 1,
    });
    expect(leg.isActive).toBe(true);
  });
});

describe("legToFirebase — isActive", () => {
  it("maps isActive true", () => {
    const data = legToFirebase({
      fromStopId: "stop-a",
      toStopId: "stop-b",
      name: "London to Paris",
      order: 1,
      memberUids: MEMBER_UIDS,
      isActive: true,
    });
    expect(data.isActive).toBe(true);
  });

  it("maps isActive false", () => {
    const data = legToFirebase({
      fromStopId: "stop-a",
      toStopId: "stop-b",
      name: "London to Paris",
      order: 1,
      memberUids: MEMBER_UIDS,
      isActive: false,
    });
    expect(data.isActive).toBe(false);
  });
});
