import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/services/errors";
import { TransportationStatus } from "@/lib/types/transportation";

vi.mock("@/lib/firebase/admin", () => ({ getAdminFirestore: vi.fn() }));
vi.mock("./legs", () => ({ getLegById: vi.fn() }));
vi.mock("./notify-offer", () => ({
  writeNotificationsForTransportOffer: vi.fn().mockResolvedValue(undefined),
}));

import { getAdminFirestore } from "@/lib/firebase/admin";
import { getLegById } from "./legs";
import { writeNotificationsForTransportOffer } from "./notify-offer";
import { getSeatOfferCandidates, setSeatOffer } from "./transportation";

// ── Firestore mock setup ──────────────────────────────────────────────────────

const driverEntryGet = vi.fn();
const legEntriesGet = vi.fn();
const driverEntryUpdate = vi.fn();

const transportationCollection = {
  where: vi.fn(() => ({
    where: vi.fn(() => ({ get: driverEntryGet })),
    get: legEntriesGet,
  })),
};

const tripDoc = vi.fn(() => ({
  collection: (name: string) =>
    name === "transportation" ? transportationCollection : undefined,
}));

const mockDb = {
  collection: vi.fn((name: string) => {
    if (name === "trips") return { doc: tripDoc };
    return { doc: vi.fn() };
  }),
};

function driverEntry(data: Record<string, unknown>) {
  driverEntryGet.mockResolvedValue({
    docs: [{ ref: { update: driverEntryUpdate }, data: () => data }],
  });
}

function legEntries(entries: { uid: string; status: TransportationStatus }[]) {
  legEntriesGet.mockResolvedValue({
    docs: entries.map((entry) => ({ data: () => entry })),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAdminFirestore).mockReturnValue(
    mockDb as unknown as ReturnType<typeof getAdminFirestore>,
  );
  vi.mocked(getLegById).mockResolvedValue({
    legId: "leg-1",
    tripId: "trip-1",
    fromStopId: "stop-a",
    toStopId: "stop-b",
    name: "Chicago to NYC",
    order: 0,
    memberUids: [],
    isActive: true,
  });
  driverEntryUpdate.mockResolvedValue(undefined);
});

// ── getSeatOfferCandidates ────────────────────────────────────────────────────

describe("getSeatOfferCandidates", () => {
  it("returns members needing transportation as candidates, excluding the driver", async () => {
    driverEntry({ status: TransportationStatus.DrivingWithSeats });
    legEntries([
      { uid: "uid-driver", status: TransportationStatus.DrivingWithSeats },
      { uid: "uid-needs", status: TransportationStatus.NeedTransportation },
      { uid: "uid-flying", status: TransportationStatus.FlyingOrOther },
    ]);

    const result = await getSeatOfferCandidates(
      "uid-driver",
      "trip-1",
      "leg-1",
    );

    expect(result.candidateUids).toEqual(["uid-needs"]);
  });

  it("returns only currently-offered uids that are still eligible candidates", async () => {
    driverEntry({
      status: TransportationStatus.DrivingWithSeats,
      offeredToUids: ["uid-needs", "uid-stale"],
    });
    legEntries([
      { uid: "uid-needs", status: TransportationStatus.NeedTransportation },
    ]);

    const result = await getSeatOfferCandidates(
      "uid-driver",
      "trip-1",
      "leg-1",
    );

    expect(result.offeredToUids).toEqual(["uid-needs"]);
  });
});

// ── setSeatOffer ──────────────────────────────────────────────────────────────

describe("setSeatOffer", () => {
  it("writes the deduplicated offered uids to the driver entry", async () => {
    driverEntry({ status: TransportationStatus.DrivingWithSeats });
    legEntries([
      { uid: "uid-needs", status: TransportationStatus.NeedTransportation },
    ]);

    await setSeatOffer("uid-driver", "trip-1", "leg-1", [
      "uid-needs",
      "uid-needs",
    ]);

    expect(driverEntryUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ offeredToUids: ["uid-needs"] }),
    );
  });

  it("throws NotFoundError when the driver has no transportation entry", async () => {
    driverEntryGet.mockResolvedValue({ docs: [] });

    await expect(
      setSeatOffer("uid-driver", "trip-1", "leg-1", []),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws when the driver is not offering seats", async () => {
    driverEntry({ status: TransportationStatus.Driving });

    await expect(
      setSeatOffer("uid-driver", "trip-1", "leg-1", []),
    ).rejects.toThrow(/offering seats/);
  });

  it("throws when an offered uid does not need transportation for the leg", async () => {
    driverEntry({ status: TransportationStatus.DrivingWithSeats });
    legEntries([
      { uid: "uid-needs", status: TransportationStatus.NeedTransportation },
    ]);

    await expect(
      setSeatOffer("uid-driver", "trip-1", "leg-1", ["uid-other"]),
    ).rejects.toThrow(/need transportation/);
    expect(driverEntryUpdate).not.toHaveBeenCalled();
  });
});

// ── setSeatOffer — transport offer notifications ──────────────────────────────

describe("setSeatOffer — transport offer notifications", () => {
  it("notifies only guests newly offered a seat since the prior offer set", async () => {
    driverEntry({
      status: TransportationStatus.DrivingWithSeats,
      offeredToUids: ["uid-old"],
    });
    legEntries([
      { uid: "uid-old", status: TransportationStatus.NeedTransportation },
      { uid: "uid-new", status: TransportationStatus.NeedTransportation },
    ]);

    await setSeatOffer("uid-driver", "trip-1", "leg-1", ["uid-old", "uid-new"]);

    expect(writeNotificationsForTransportOffer).toHaveBeenCalledWith(
      "trip-1",
      "Chicago to NYC",
      ["uid-new"],
    );
  });

  it("does not notify when no new guests are offered a seat", async () => {
    driverEntry({
      status: TransportationStatus.DrivingWithSeats,
      offeredToUids: ["uid-old"],
    });
    legEntries([
      { uid: "uid-old", status: TransportationStatus.NeedTransportation },
    ]);

    await setSeatOffer("uid-driver", "trip-1", "leg-1", ["uid-old"]);

    expect(writeNotificationsForTransportOffer).not.toHaveBeenCalled();
  });

  it("still writes the offer when the notification write fails", async () => {
    driverEntry({ status: TransportationStatus.DrivingWithSeats });
    legEntries([
      { uid: "uid-new", status: TransportationStatus.NeedTransportation },
    ]);
    vi.mocked(writeNotificationsForTransportOffer).mockRejectedValueOnce(
      new Error("rtdb down"),
    );

    await setSeatOffer("uid-driver", "trip-1", "leg-1", ["uid-new"]);

    expect(driverEntryUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ offeredToUids: ["uid-new"] }),
    );
  });
});
