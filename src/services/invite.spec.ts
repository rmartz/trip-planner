import { describe, expect, it, vi } from "vitest";
import { TripRole } from "@/lib/types/trip";
import type { Trip } from "@/lib/types/trip";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("@/lib/firebase/schema/trip", () => ({ firebaseToTrip: vi.fn() }));
vi.mock("crypto", () => ({ randomBytes: vi.fn() }));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { firebaseToTrip } from "@/lib/firebase/schema/trip";
import { randomBytes } from "crypto";
import {
  getTripByInviteToken,
  acceptInvite,
  regenerateInviteToken,
} from "./invite";

function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    tripId: "trip-1",
    name: "Paris Trip",
    startDate: new Date("2025-06-01T00:00:00Z"),
    endDate: new Date("2025-06-08T00:00:00Z"),
    createdAt: new Date("2025-01-01T00:00:00Z"),
    createdBy: "uid-owner",
    memberUids: ["uid-owner"],
    inviteToken: "tok-abc",
    ...overrides,
  };
}

function makeQueryDb(queryResult: { empty: boolean; docs: unknown[] }) {
  const queryGet = vi.fn().mockResolvedValue(queryResult);
  const queryLimit = vi.fn(() => ({ get: queryGet }));
  const queryWhere2 = vi.fn(() => ({ limit: queryLimit }));
  const queryWhere1 = vi.fn(() => ({ where: queryWhere2 }));
  const colFn = vi.fn(() => ({ where: queryWhere1 }));
  return { collection: colFn };
}

function makeTripsCollectionWithDoc(
  queryResult: { empty: boolean; docs: unknown[] },
  tripDocExtras: Record<string, unknown> = {},
) {
  const queryGet = vi.fn().mockResolvedValue(queryResult);
  const queryLimit = vi.fn(() => ({ get: queryGet }));
  const queryWhere2 = vi.fn(() => ({ limit: queryLimit }));
  const queryWhere1 = vi.fn(() => ({ where: queryWhere2 }));
  const tripDocFn = vi.fn(() => ({ ...tripDocExtras }));
  const colFn = vi.fn(() => ({ where: queryWhere1, doc: tripDocFn }));
  return { db: { collection: colFn }, tripDocFn };
}

describe("getTripByInviteToken — valid token", () => {
  it("returns the trip when the token matches", async () => {
    const snapshot = {
      id: "trip-1",
      exists: true,
      data: () => ({ name: "Paris Trip", inviteToken: "tok-abc" }),
    };
    vi.mocked(getAdminFirestore).mockReturnValue(
      makeQueryDb({ empty: false, docs: [snapshot] }) as unknown as ReturnType<
        typeof getAdminFirestore
      >,
    );
    const trip = makeTrip();
    vi.mocked(firebaseToTrip).mockReturnValue(trip);

    const result = await getTripByInviteToken("tok-abc");
    expect(result).toEqual(trip);
  });
});

describe("getTripByInviteToken — invalid token", () => {
  it("returns undefined when no trip has the token", async () => {
    vi.mocked(getAdminFirestore).mockReturnValue(
      makeQueryDb({ empty: true, docs: [] }) as unknown as ReturnType<
        typeof getAdminFirestore
      >,
    );

    const result = await getTripByInviteToken("bad-token");
    expect(result).toBeUndefined();
  });
});

describe("acceptInvite — new member", () => {
  it("creates a Guest membership and returns the tripId", async () => {
    const memberSetFn = vi.fn().mockResolvedValue(undefined);
    const memberGetFn = vi.fn().mockResolvedValue({ exists: false });
    const memberDocFn = vi.fn(() => ({ get: memberGetFn, set: memberSetFn }));
    const membersColFn = vi.fn(() => ({ doc: memberDocFn }));

    const snapshot = {
      id: "trip-1",
      exists: true,
      data: () => ({ name: "Paris Trip", inviteToken: "tok-abc" }),
    };
    const { db } = makeTripsCollectionWithDoc(
      { empty: false, docs: [snapshot] },
      { collection: membersColFn },
    );
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );
    vi.mocked(firebaseToTrip).mockReturnValue(makeTrip({ tripId: "trip-1" }));

    const result = await acceptInvite("tok-abc", "uid-new");
    expect(result).toEqual({ tripId: "trip-1", alreadyMember: false });
    expect(memberSetFn).toHaveBeenCalledWith(
      expect.objectContaining({ uid: "uid-new", role: TripRole.Guest }),
    );
  });
});

describe("acceptInvite — already a member", () => {
  it("returns the tripId without writing a duplicate member record", async () => {
    const memberSetFn = vi.fn();
    const memberGetFn = vi.fn().mockResolvedValue({ exists: true });
    const memberDocFn = vi.fn(() => ({ get: memberGetFn, set: memberSetFn }));
    const membersColFn = vi.fn(() => ({ doc: memberDocFn }));

    const snapshot = {
      id: "trip-1",
      exists: true,
      data: () => ({ name: "Paris Trip", inviteToken: "tok-abc" }),
    };
    const { db } = makeTripsCollectionWithDoc(
      { empty: false, docs: [snapshot] },
      { collection: membersColFn },
    );
    vi.mocked(getAdminFirestore).mockReturnValue(
      db as unknown as ReturnType<typeof getAdminFirestore>,
    );
    vi.mocked(firebaseToTrip).mockReturnValue(makeTrip({ tripId: "trip-1" }));

    const result = await acceptInvite("tok-abc", "uid-existing");
    expect(result).toEqual({ tripId: "trip-1", alreadyMember: true });
    expect(memberSetFn).not.toHaveBeenCalled();
  });
});

describe("acceptInvite — invalid token", () => {
  it("throws when the token does not match any trip", async () => {
    vi.mocked(getAdminFirestore).mockReturnValue(
      makeQueryDb({ empty: true, docs: [] }) as unknown as ReturnType<
        typeof getAdminFirestore
      >,
    );

    await expect(acceptInvite("bad-token", "uid-x")).rejects.toThrow();
  });
});

describe("regenerateInviteToken", () => {
  it("writes a new token to Firestore and returns it", async () => {
    vi.mocked(randomBytes).mockReturnValue(
      Buffer.from("deadbeef1234", "hex") as unknown as ReturnType<
        typeof randomBytes
      >,
    );

    const updateFn = vi.fn().mockResolvedValue(undefined);
    const tripDocFn = vi.fn(() => ({ update: updateFn }));
    const colFn = vi.fn(() => ({ doc: tripDocFn }));
    vi.mocked(getAdminFirestore).mockReturnValue({
      collection: colFn,
    } as unknown as ReturnType<typeof getAdminFirestore>);

    const newToken = await regenerateInviteToken("trip-1");
    expect(typeof newToken).toBe("string");
    expect(newToken.length).toBeGreaterThan(0);
    expect(updateFn).toHaveBeenCalledWith({ inviteToken: newToken });
  });
});
