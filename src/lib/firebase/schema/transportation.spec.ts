import { describe, expect, it } from "vitest";
import { TransportationStatus } from "@/lib/types/transportation";
import {
  firebaseToTransportationEntry,
  transportationEntryToFirebase,
} from "./transportation";

describe("TransportationStatus enum — five values defined", () => {
  it("defines Driving status", () => {
    expect(TransportationStatus.Driving).toBeDefined();
  });

  it("defines DrivingWithSeats status", () => {
    expect(TransportationStatus.DrivingWithSeats).toBeDefined();
  });

  it("defines RidingWith status", () => {
    expect(TransportationStatus.RidingWith).toBeDefined();
  });

  it("defines NeedTransportation status", () => {
    expect(TransportationStatus.NeedTransportation).toBeDefined();
  });

  it("defines FlyingOrOther status", () => {
    expect(TransportationStatus.FlyingOrOther).toBeDefined();
  });
});

describe("firebaseToTransportationEntry — maps entryId and identifiers", () => {
  it("maps entryId from argument", () => {
    const entry = firebaseToTransportationEntry("entry-1", "leg-1", "uid-1", {
      status: TransportationStatus.Driving,
      routeName: "I-35 caravan",
    });
    expect(entry.entryId).toBe("entry-1");
  });

  it("maps legId from argument", () => {
    const entry = firebaseToTransportationEntry("entry-1", "leg-abc", "uid-1", {
      status: TransportationStatus.NeedTransportation,
      routeName: "Hill Country drive",
    });
    expect(entry.legId).toBe("leg-abc");
  });

  it("maps uid from argument", () => {
    const entry = firebaseToTransportationEntry("entry-1", "leg-1", "uid-xyz", {
      status: TransportationStatus.FlyingOrOther,
      routeName: "Drive to Vegas",
    });
    expect(entry.uid).toBe("uid-xyz");
  });
});

describe("firebaseToTransportationEntry — maps status", () => {
  it("maps Driving status", () => {
    const entry = firebaseToTransportationEntry("e1", "l1", "u1", {
      status: TransportationStatus.Driving,
      routeName: "test route",
    });
    expect(entry.status).toBe(TransportationStatus.Driving);
  });

  it("maps DrivingWithSeats status", () => {
    const entry = firebaseToTransportationEntry("e1", "l1", "u1", {
      status: TransportationStatus.DrivingWithSeats,
      seatCount: 3,
      routeName: "test route",
    });
    expect(entry.status).toBe(TransportationStatus.DrivingWithSeats);
  });

  it("maps RidingWith status", () => {
    const entry = firebaseToTransportationEntry("e1", "l1", "u1", {
      status: TransportationStatus.RidingWith,
      ridingWithUid: "uid-driver",
      routeName: "test route",
    });
    expect(entry.status).toBe(TransportationStatus.RidingWith);
  });

  it("maps NeedTransportation status", () => {
    const entry = firebaseToTransportationEntry("e1", "l1", "u1", {
      status: TransportationStatus.NeedTransportation,
      routeName: "test route",
    });
    expect(entry.status).toBe(TransportationStatus.NeedTransportation);
  });

  it("maps FlyingOrOther status", () => {
    const entry = firebaseToTransportationEntry("e1", "l1", "u1", {
      status: TransportationStatus.FlyingOrOther,
      routeName: "test route",
    });
    expect(entry.status).toBe(TransportationStatus.FlyingOrOther);
  });
});

describe("firebaseToTransportationEntry — status validation fallback", () => {
  it("falls back to NeedTransportation when status is absent", () => {
    const entry = firebaseToTransportationEntry("e1", "l1", "u1", {
      routeName: "test route",
    });
    expect(entry.status).toBe(TransportationStatus.NeedTransportation);
  });

  it("falls back to NeedTransportation when status is an unrecognized string", () => {
    const entry = firebaseToTransportationEntry("e1", "l1", "u1", {
      status: "unknown-value",
      routeName: "test route",
    });
    expect(entry.status).toBe(TransportationStatus.NeedTransportation);
  });
});

describe("firebaseToTransportationEntry — maps routeName", () => {
  it("maps routeName from data", () => {
    const entry = firebaseToTransportationEntry("e1", "l1", "u1", {
      status: TransportationStatus.Driving,
      routeName: "I-35 caravan",
    });
    expect(entry.routeName).toBe("I-35 caravan");
  });

  it("falls back to empty string when routeName absent", () => {
    const entry = firebaseToTransportationEntry("e1", "l1", "u1", {
      status: TransportationStatus.Driving,
    });
    expect(entry.routeName).toBe("");
  });
});

describe("firebaseToTransportationEntry — maps optional fields", () => {
  it("maps seatCount when present", () => {
    const entry = firebaseToTransportationEntry("e1", "l1", "u1", {
      status: TransportationStatus.DrivingWithSeats,
      seatCount: 4,
      routeName: "caravan",
    });
    expect(entry.seatCount).toBe(4);
  });

  it("leaves seatCount undefined when absent", () => {
    const entry = firebaseToTransportationEntry("e1", "l1", "u1", {
      status: TransportationStatus.Driving,
      routeName: "caravan",
    });
    expect(entry.seatCount).toBeUndefined();
  });

  it("maps ridingWithUid when present", () => {
    const entry = firebaseToTransportationEntry("e1", "l1", "u1", {
      status: TransportationStatus.RidingWith,
      ridingWithUid: "uid-driver",
      routeName: "caravan",
    });
    expect(entry.ridingWithUid).toBe("uid-driver");
  });

  it("leaves ridingWithUid undefined when absent", () => {
    const entry = firebaseToTransportationEntry("e1", "l1", "u1", {
      status: TransportationStatus.NeedTransportation,
      routeName: "caravan",
    });
    expect(entry.ridingWithUid).toBeUndefined();
  });
});

describe("firebaseToTransportationEntry — maps offeredToUids", () => {
  it("maps offeredToUids when all elements are strings", () => {
    const entry = firebaseToTransportationEntry("e1", "l1", "u1", {
      status: TransportationStatus.DrivingWithSeats,
      routeName: "caravan",
      offeredToUids: ["uid-a", "uid-b"],
    });
    expect(entry.offeredToUids).toEqual(["uid-a", "uid-b"]);
  });

  it("leaves offeredToUids undefined when the field is absent", () => {
    const entry = firebaseToTransportationEntry("e1", "l1", "u1", {
      status: TransportationStatus.DrivingWithSeats,
      routeName: "caravan",
    });
    expect(entry.offeredToUids).toBeUndefined();
  });

  it("leaves offeredToUids undefined when the array contains a non-string element", () => {
    const entry = firebaseToTransportationEntry("e1", "l1", "u1", {
      status: TransportationStatus.DrivingWithSeats,
      routeName: "caravan",
      offeredToUids: [1, "uid-b"],
    });
    expect(entry.offeredToUids).toBeUndefined();
  });
});

describe("transportationEntryToFirebase — maps status and routeName", () => {
  it("maps status Driving", () => {
    const data = transportationEntryToFirebase({
      status: TransportationStatus.Driving,
      routeName: "I-35 caravan",
    });
    expect(data.status).toBe(TransportationStatus.Driving);
  });

  it("maps routeName", () => {
    const data = transportationEntryToFirebase({
      status: TransportationStatus.NeedTransportation,
      routeName: "Hill Country drive",
    });
    expect(data.routeName).toBe("Hill Country drive");
  });

  it("maps seatCount when present", () => {
    const data = transportationEntryToFirebase({
      status: TransportationStatus.DrivingWithSeats,
      routeName: "caravan",
      seatCount: 2,
    });
    expect(data.seatCount).toBe(2);
  });

  it("omits seatCount when undefined", () => {
    const data = transportationEntryToFirebase({
      status: TransportationStatus.Driving,
      routeName: "caravan",
    });
    expect("seatCount" in data).toBe(false);
  });

  it("maps ridingWithUid when present", () => {
    const data = transportationEntryToFirebase({
      status: TransportationStatus.RidingWith,
      routeName: "caravan",
      ridingWithUid: "uid-driver",
    });
    expect(data.ridingWithUid).toBe("uid-driver");
  });

  it("omits ridingWithUid when undefined", () => {
    const data = transportationEntryToFirebase({
      status: TransportationStatus.NeedTransportation,
      routeName: "caravan",
    });
    expect("ridingWithUid" in data).toBe(false);
  });
});
