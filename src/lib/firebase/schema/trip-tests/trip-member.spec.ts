import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import { TripRole } from "@/lib/types/trip";
import { firebaseToTripMember, tripMemberToFirebase } from "../trip";

function makeTimestamp(iso: string) {
  return Timestamp.fromDate(new Date(iso));
}

const JOINED_AT = "2025-02-20T09:00:00Z";
const MEMBER_UIDS = ["uid-1", "uid-2"];

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

  it("does not include displayName in the Firebase document", () => {
    const data = tripMemberToFirebase({
      uid: "user-1",
      role: TripRole.Guest,
      joinedAt: new Date(JOINED_AT),
      memberUids: MEMBER_UIDS,
    });
    expect("displayName" in data).toBe(false);
  });
});
