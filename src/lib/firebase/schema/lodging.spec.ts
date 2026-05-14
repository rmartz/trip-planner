import { describe, expect, it } from "vitest";
import { Timestamp } from "firebase/firestore";
import { firebaseToLodging, lodgingToFirebase } from "./lodging";
import { LodgingStatus } from "@/lib/types/lodging";

describe("firebaseToLodging — maps uid and stopId from arguments", () => {
  it("maps uid from argument", () => {
    const record = firebaseToLodging("user-99", "stop-1", {
      status: LodgingStatus.NeedLodging,
      updatedAt: Timestamp.fromDate(new Date("2025-06-01T00:00:00Z")),
    });
    expect(record.uid).toBe("user-99");
  });

  it("maps stopId from argument", () => {
    const record = firebaseToLodging("user-1", "stop-42", {
      status: LodgingStatus.NeedLodging,
      updatedAt: Timestamp.fromDate(new Date("2025-06-01T00:00:00Z")),
    });
    expect(record.stopId).toBe("stop-42");
  });
});

describe("firebaseToLodging — maps status enum", () => {
  it("maps NeedLodging status", () => {
    const record = firebaseToLodging("user-1", "stop-1", {
      status: "need_lodging",
      updatedAt: Timestamp.fromDate(new Date("2025-06-01T00:00:00Z")),
    });
    expect(record.status).toBe(LodgingStatus.NeedLodging);
  });

  it("maps SecuredPrivate status", () => {
    const record = firebaseToLodging("user-1", "stop-1", {
      status: "secured_private",
      updatedAt: Timestamp.fromDate(new Date("2025-06-01T00:00:00Z")),
    });
    expect(record.status).toBe(LodgingStatus.SecuredPrivate);
  });

  it("maps SecuredCapacity status", () => {
    const record = firebaseToLodging("user-1", "stop-1", {
      status: "secured_capacity",
      updatedAt: Timestamp.fromDate(new Date("2025-06-01T00:00:00Z")),
    });
    expect(record.status).toBe(LodgingStatus.SecuredCapacity);
  });

  it("maps SharingWith status", () => {
    const record = firebaseToLodging("user-1", "stop-1", {
      status: "sharing_with",
      updatedAt: Timestamp.fromDate(new Date("2025-06-01T00:00:00Z")),
    });
    expect(record.status).toBe(LodgingStatus.SharingWith);
  });

  it("defaults to NeedLodging when status is absent", () => {
    const record = firebaseToLodging("user-1", "stop-1", {
      updatedAt: Timestamp.fromDate(new Date("2025-06-01T00:00:00Z")),
    });
    expect(record.status).toBe(LodgingStatus.NeedLodging);
  });

  it("defaults to NeedLodging when status is invalid", () => {
    const record = firebaseToLodging("user-1", "stop-1", {
      status: "not_a_real_status",
      updatedAt: Timestamp.fromDate(new Date("2025-06-01T00:00:00Z")),
    });
    expect(record.status).toBe(LodgingStatus.NeedLodging);
  });
});

describe("firebaseToLodging — maps optional fields", () => {
  it("maps guestCount when present", () => {
    const record = firebaseToLodging("user-1", "stop-1", {
      status: LodgingStatus.SecuredCapacity,
      guestCount: 3,
      updatedAt: Timestamp.fromDate(new Date("2025-06-01T00:00:00Z")),
    });
    expect(record.guestCount).toBe(3);
  });

  it("leaves guestCount undefined when absent", () => {
    const record = firebaseToLodging("user-1", "stop-1", {
      status: LodgingStatus.SecuredPrivate,
      updatedAt: Timestamp.fromDate(new Date("2025-06-01T00:00:00Z")),
    });
    expect(record.guestCount).toBeUndefined();
  });

  it("maps sharingWithUid when present", () => {
    const record = firebaseToLodging("user-1", "stop-1", {
      status: LodgingStatus.SharingWith,
      sharingWithUid: "user-host",
      updatedAt: Timestamp.fromDate(new Date("2025-06-01T00:00:00Z")),
    });
    expect(record.sharingWithUid).toBe("user-host");
  });

  it("leaves sharingWithUid undefined when absent", () => {
    const record = firebaseToLodging("user-1", "stop-1", {
      status: LodgingStatus.NeedLodging,
      updatedAt: Timestamp.fromDate(new Date("2025-06-01T00:00:00Z")),
    });
    expect(record.sharingWithUid).toBeUndefined();
  });
});

describe("firebaseToLodging — requires updatedAt", () => {
  it("throws when updatedAt is missing", () => {
    expect(() =>
      firebaseToLodging("user-1", "stop-1", {
        status: LodgingStatus.NeedLodging,
      }),
    ).toThrow("Lodging record is missing a valid updatedAt Timestamp.");
  });

  it("throws when updatedAt is not a Timestamp", () => {
    expect(() =>
      firebaseToLodging("user-1", "stop-1", {
        status: LodgingStatus.NeedLodging,
        updatedAt: "2025-06-01T00:00:00Z",
      }),
    ).toThrow("Lodging record is missing a valid updatedAt Timestamp.");
  });
});

describe("lodgingToFirebase — serializes status and optional fields", () => {
  it("serializes status", () => {
    const data = lodgingToFirebase({
      uid: "user-1",
      stopId: "stop-1",
      status: LodgingStatus.SecuredPrivate,
      updatedAt: new Date("2025-06-01T00:00:00Z"),
    });
    expect(data.status).toBe(LodgingStatus.SecuredPrivate);
  });

  it("includes guestCount when defined", () => {
    const data = lodgingToFirebase({
      uid: "user-1",
      stopId: "stop-1",
      status: LodgingStatus.SecuredCapacity,
      guestCount: 2,
      updatedAt: new Date("2025-06-01T00:00:00Z"),
    });
    expect(data.guestCount).toBe(2);
  });

  it("omits guestCount when undefined", () => {
    const data = lodgingToFirebase({
      uid: "user-1",
      stopId: "stop-1",
      status: LodgingStatus.SecuredPrivate,
      updatedAt: new Date("2025-06-01T00:00:00Z"),
    });
    expect("guestCount" in data).toBe(false);
  });

  it("includes sharingWithUid when defined", () => {
    const data = lodgingToFirebase({
      uid: "user-1",
      stopId: "stop-1",
      status: LodgingStatus.SharingWith,
      sharingWithUid: "user-host",
      updatedAt: new Date("2025-06-01T00:00:00Z"),
    });
    expect(data.sharingWithUid).toBe("user-host");
  });

  it("omits sharingWithUid when undefined", () => {
    const data = lodgingToFirebase({
      uid: "user-1",
      stopId: "stop-1",
      status: LodgingStatus.NeedLodging,
      updatedAt: new Date("2025-06-01T00:00:00Z"),
    });
    expect("sharingWithUid" in data).toBe(false);
  });

  it("serializes updatedAt as Timestamp", () => {
    const date = new Date("2025-06-01T00:00:00Z");
    const data = lodgingToFirebase({
      uid: "user-1",
      stopId: "stop-1",
      status: LodgingStatus.NeedLodging,
      updatedAt: date,
    });
    expect(data.updatedAt.toDate().toISOString()).toBe(date.toISOString());
  });
});
