import { describe, it, expect } from "vitest";
import { Timestamp } from "firebase/firestore";
import { TripRole } from "@/lib/types/trip";
import {
  firebaseToTrip,
  firebaseToTripMember,
  firebaseToStop,
  firebaseToLeg,
} from "../trip";

// Minimal valid base data for each deserializer so we can focus assertions
// purely on the memberUids field behaviour.

const TIMESTAMP = Timestamp.fromDate(new Date("2025-06-01T00:00:00Z"));

function makeTripData(memberUids: unknown) {
  return {
    name: "Test Trip",
    startDate: TIMESTAMP,
    endDate: TIMESTAMP,
    createdAt: TIMESTAMP,
    createdBy: "uid-owner",
    memberUids,
  };
}

function makeMemberData(memberUids: unknown) {
  return {
    role: TripRole.Guest,
    joinedAt: TIMESTAMP,
    memberUids,
  };
}

function makeStopData(memberUids: unknown) {
  return {
    name: "Paris",
    startDate: TIMESTAMP,
    endDate: TIMESTAMP,
    order: 1,
    memberUids,
  };
}

function makeLegData(memberUids: unknown) {
  return {
    fromStopId: "stop-a",
    toStopId: "stop-b",
    order: 1,
    memberUids,
  };
}

describe("toMemberUids via firebaseToTrip", () => {
  it("returns [] when memberUids is missing", () => {
    const trip = firebaseToTrip("t1", {
      name: "x",
      startDate: TIMESTAMP,
      endDate: TIMESTAMP,
      createdAt: TIMESTAMP,
      createdBy: "uid-x",
    });
    expect(trip.memberUids).toEqual([]);
  });

  it("returns [] when memberUids is null", () => {
    const trip = firebaseToTrip("t1", makeTripData(null));
    expect(trip.memberUids).toEqual([]);
  });

  it("returns [] when memberUids is a string", () => {
    const trip = firebaseToTrip("t1", makeTripData("uid-1"));
    expect(trip.memberUids).toEqual([]);
  });

  it("returns [] when memberUids is a number", () => {
    const trip = firebaseToTrip("t1", makeTripData(42));
    expect(trip.memberUids).toEqual([]);
  });

  it("returns [] when memberUids is an object", () => {
    const trip = firebaseToTrip("t1", makeTripData({ uid: "uid-1" }));
    expect(trip.memberUids).toEqual([]);
  });

  it("returns [] when memberUids is an empty array", () => {
    const trip = firebaseToTrip("t1", makeTripData([]));
    expect(trip.memberUids).toEqual([]);
  });

  it("filters out non-string values from a mixed array", () => {
    const trip = firebaseToTrip(
      "t1",
      makeTripData(["uid-1", 99, null, undefined, true, "uid-2"]),
    );
    expect(trip.memberUids).toEqual(["uid-1", "uid-2"]);
  });

  it("returns all strings from a valid string array", () => {
    const trip = firebaseToTrip(
      "t1",
      makeTripData(["uid-a", "uid-b", "uid-c"]),
    );
    expect(trip.memberUids).toEqual(["uid-a", "uid-b", "uid-c"]);
  });
});

describe("toMemberUids via firebaseToTripMember", () => {
  it("returns [] when memberUids is missing", () => {
    const member = firebaseToTripMember("uid-x", "trip-1", {
      role: TripRole.Guest,
      joinedAt: TIMESTAMP,
    });
    expect(member.memberUids).toEqual([]);
  });

  it("returns [] when memberUids is null", () => {
    const member = firebaseToTripMember(
      "uid-x",
      "trip-1",
      makeMemberData(null),
    );
    expect(member.memberUids).toEqual([]);
  });

  it("returns [] when memberUids is not an array", () => {
    const member = firebaseToTripMember(
      "uid-x",
      "trip-1",
      makeMemberData("not-an-array"),
    );
    expect(member.memberUids).toEqual([]);
  });

  it("returns [] when memberUids is an empty array", () => {
    const member = firebaseToTripMember("uid-x", "trip-1", makeMemberData([]));
    expect(member.memberUids).toEqual([]);
  });

  it("filters out non-string values from a mixed array", () => {
    const member = firebaseToTripMember(
      "uid-x",
      "trip-1",
      makeMemberData(["uid-1", 0, false, "uid-2"]),
    );
    expect(member.memberUids).toEqual(["uid-1", "uid-2"]);
  });

  it("returns all strings from a valid string array", () => {
    const member = firebaseToTripMember(
      "uid-x",
      "trip-1",
      makeMemberData(["uid-a", "uid-b"]),
    );
    expect(member.memberUids).toEqual(["uid-a", "uid-b"]);
  });
});

describe("toMemberUids via firebaseToStop", () => {
  it("returns [] when memberUids is missing", () => {
    const stop = firebaseToStop("stop-1", "trip-1", {
      name: "x",
      startDate: TIMESTAMP,
      endDate: TIMESTAMP,
      order: 1,
    });
    expect(stop.memberUids).toEqual([]);
  });

  it("returns [] when memberUids is null", () => {
    const stop = firebaseToStop("stop-1", "trip-1", makeStopData(null));
    expect(stop.memberUids).toEqual([]);
  });

  it("returns [] when memberUids is not an array", () => {
    const stop = firebaseToStop("stop-1", "trip-1", makeStopData(123));
    expect(stop.memberUids).toEqual([]);
  });

  it("returns [] when memberUids is an empty array", () => {
    const stop = firebaseToStop("stop-1", "trip-1", makeStopData([]));
    expect(stop.memberUids).toEqual([]);
  });

  it("filters out non-string values from a mixed array", () => {
    const stop = firebaseToStop(
      "stop-1",
      "trip-1",
      makeStopData([{}, "uid-1", null, "uid-2"]),
    );
    expect(stop.memberUids).toEqual(["uid-1", "uid-2"]);
  });

  it("returns all strings from a valid string array", () => {
    const stop = firebaseToStop(
      "stop-1",
      "trip-1",
      makeStopData(["uid-a", "uid-b"]),
    );
    expect(stop.memberUids).toEqual(["uid-a", "uid-b"]);
  });
});

describe("toMemberUids via firebaseToLeg", () => {
  it("returns [] when memberUids is missing", () => {
    const leg = firebaseToLeg("leg-1", "trip-1", {
      fromStopId: "stop-a",
      toStopId: "stop-b",
      order: 1,
    });
    expect(leg.memberUids).toEqual([]);
  });

  it("returns [] when memberUids is null", () => {
    const leg = firebaseToLeg("leg-1", "trip-1", makeLegData(null));
    expect(leg.memberUids).toEqual([]);
  });

  it("returns [] when memberUids is not an array", () => {
    const leg = firebaseToLeg("leg-1", "trip-1", makeLegData(false));
    expect(leg.memberUids).toEqual([]);
  });

  it("returns [] when memberUids is an empty array", () => {
    const leg = firebaseToLeg("leg-1", "trip-1", makeLegData([]));
    expect(leg.memberUids).toEqual([]);
  });

  it("filters out non-string values from a mixed array", () => {
    const leg = firebaseToLeg(
      "leg-1",
      "trip-1",
      makeLegData(["uid-1", undefined, 7, "uid-2"]),
    );
    expect(leg.memberUids).toEqual(["uid-1", "uid-2"]);
  });

  it("returns all strings from a valid string array", () => {
    const leg = firebaseToLeg(
      "leg-1",
      "trip-1",
      makeLegData(["uid-a", "uid-b"]),
    );
    expect(leg.memberUids).toEqual(["uid-a", "uid-b"]);
  });
});
